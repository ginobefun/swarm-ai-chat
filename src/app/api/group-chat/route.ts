/**
 * 群聊多智能体协作 API
 *
 * POST /api/group-chat
 * - 处理用户消息
 * - 智能编排多个 Agent 的回复
 * - 支持流式响应
 */

import { NextRequest, NextResponse } from 'next/server';
import { createMultiAgentOrchestrator, AgentConfig } from '@/lib/langchain/multi-agent-orchestrator';
import { prisma } from '@/lib/database/prisma';

// 流式响应编码器
const encoder = new TextEncoder();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      userName,
      message,
      agentIds = [], // 参与的 Agent ID 列表
    } = body;

    if (!sessionId || !userId || !message) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 获取 API 密钥
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API Key 未配置' },
        { status: 500 }
      );
    }

    // 获取群聊会话信息
    const session = await prisma.swarmChatSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: {
            agent: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    // 创建编排器
    const orchestrator = createMultiAgentOrchestrator(
      apiKey,
      process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    );

    // 注册参与的 Agent
    const participatingAgents = session.participants
      .filter(p => p.participantType === 'AGENT' && p.agent)
      .map(p => p.agent!);

    for (const agent of participatingAgents) {
      const config: AgentConfig = {
        id: agent.id,
        name: agent.name,
        role: agent.specialty || agent.description || '',
        systemPrompt: agent.systemPrompt || `你是${agent.name},${agent.description}`,
        modelPreference: agent.modelPreference || undefined,
        temperature: 0.7,
      };
      orchestrator.registerAgent(config);
    }

    // 加载历史消息
    const historyMessages = await prisma.swarmChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 50,
    });

    for (const msg of historyMessages) {
      orchestrator.addMessage({
        id: msg.id,
        senderId: msg.senderId,
        senderType: msg.senderType as 'USER' | 'AGENT' | 'SYSTEM',
        senderName: msg.senderType === 'USER' ? 'User' : msg.senderId, // TODO: 获取实际名称
        content: msg.content,
        timestamp: msg.createdAt,
      });
    }

    // 保存用户消息到数据库
    const userMessage = await prisma.swarmChatMessage.create({
      data: {
        sessionId,
        senderId: userId,
        senderType: 'USER',
        content: message,
        contentType: 'TEXT',
        status: 'SENT',
      },
    });

    // 创建流式响应
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 处理用户消息并获取 Agent 回复
          const responses = await orchestrator.processUserMessage(
            userId,
            userName,
            message,
            (agentId, agentName, chunk) => {
              // 流式发送 Agent 的回复片段
              const data = {
                type: 'chunk',
                agentId,
                agentName,
                chunk,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          );

          // 保存 Agent 回复到数据库
          for (const response of responses) {
            const agent = participatingAgents.find(a => a.id === response.senderId);

            await prisma.swarmChatMessage.create({
              data: {
                sessionId,
                senderId: response.senderId,
                senderType: 'AGENT',
                content: response.content,
                contentType: 'TEXT',
                status: 'SENT',
                // TODO: 计算 token 数量和成本
              },
            });

            // 发送完成事件
            const completeData = {
              type: 'complete',
              agentId: response.senderId,
              agentName: agent?.name || response.senderId,
              content: response.content,
              messageId: response.id,
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
          }

          // 更新会话统计
          await prisma.swarmChatSession.update({
            where: { id: sessionId },
            data: {
              messageCount: { increment: 1 + responses.length },
              updatedAt: new Date(),
            },
          });

          // 发送结束标记
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('群聊处理错误:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : '未知错误',
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('群聊 API 错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/group-chat?sessionId=xxx
 * 获取群聊的参与者和配置信息
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 sessionId 参数' },
        { status: 400 }
      );
    }

    const session = await prisma.swarmChatSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                description: true,
                avatar: true,
                specialty: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        type: session.type,
        status: session.status,
        createdBy: session.createdBy,
      },
      participants: session.participants.map(p => ({
        id: p.id,
        type: p.participantType,
        joinedAt: p.joinedAt,
        agent: p.agent,
      })),
    });
  } catch (error) {
    console.error('获取群聊信息错误:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
