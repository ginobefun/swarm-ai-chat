/**
 * 群聊管理 API
 *
 * POST /api/group-chat/manage - 创建新群聊
 * PUT /api/group-chat/manage - 更新群聊信息
 * DELETE /api/group-chat/manage?sessionId=xxx - 删除群聊
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database/prisma';

/**
 * POST - 创建新群聊并邀请 Agent
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      description,
      userId, // 创建者ID
      agentIds = [], // 要邀请的 Agent ID 列表
      type = 'GROUP', // 会话类型: DIRECT | GROUP | WORKFLOW
    } = body;

    if (!title || !userId) {
      return NextResponse.json(
        { error: '缺少必要参数: title 和 userId' },
        { status: 400 }
      );
    }

    // 创建群聊会话
    const session = await prisma.swarmChatSession.create({
      data: {
        title,
        description,
        type,
        status: 'ACTIVE',
        createdById: userId,
        configuration: {
          allowedAgents: agentIds,
          createdAt: new Date().toISOString(),
        },
      },
    });

    // 添加创建者为参与者
    await prisma.swarmChatSessionParticipant.create({
      data: {
        sessionId: session.id,
        participantId: userId,
        participantType: 'USER',
        role: 'OWNER',
      },
    });

    // 添加 Agent 为参与者
    if (agentIds.length > 0) {
      // 验证 Agent 是否存在
      const agents = await prisma.swarmAIAgent.findMany({
        where: {
          id: { in: agentIds },
          isActive: true,
        },
      });

      if (agents.length !== agentIds.length) {
        // 有些 Agent 不存在或未激活
        const foundIds = agents.map(a => a.id);
        const missingIds = agentIds.filter((id: string) => !foundIds.includes(id));

        return NextResponse.json(
          {
            error: '部分 Agent 不存在或未激活',
            missingIds,
          },
          { status: 400 }
        );
      }

      // 批量添加 Agent 参与者
      await prisma.swarmChatSessionParticipant.createMany({
        data: agents.map(agent => ({
          sessionId: session.id,
          participantId: agent.id,
          participantType: 'AGENT' as const,
          role: 'MEMBER' as const,
        })),
      });

      // 增加 Agent 的使用计数
      await prisma.swarmAIAgent.updateMany({
        where: { id: { in: agentIds } },
        data: { usageCount: { increment: 1 } },
      });
    }

    // 创建系统欢迎消息
    await prisma.swarmChatMessage.create({
      data: {
        sessionId: session.id,
        senderId: 'system',
        senderType: 'SYSTEM',
        content: `群聊「${title}」已创建。已邀请 ${agentIds.length} 位智能体参与协作。`,
        contentType: 'SYSTEM',
        status: 'SENT',
      },
    });

    // 获取完整的会话信息
    const fullSession = await prisma.swarmChatSession.findUnique({
      where: { id: session.id },
      include: {
        participants: {
          include: {
            agent: {
              select: {
                id: true,
                name: true,
                avatar: true,
                avatarStyle: true,
                description: true,
                specialty: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: fullSession,
    }, { status: 201 });
  } catch (error) {
    console.error('创建群聊失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * PUT - 更新群聊信息或邀请/移除 Agent
 */
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      action, // 'update' | 'invite' | 'remove'
      title,
      description,
      status,
      agentIds = [],
    } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 sessionId 参数' },
        { status: 400 }
      );
    }

    // 检查会话是否存在
    const session = await prisma.swarmChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    if (action === 'invite' && agentIds.length > 0) {
      // 邀请新 Agent
      const agents = await prisma.swarmAIAgent.findMany({
        where: {
          id: { in: agentIds },
          isActive: true,
        },
      });

      if (agents.length === 0) {
        return NextResponse.json(
          { error: '未找到可用的 Agent' },
          { status: 400 }
        );
      }

      // 检查 Agent 是否已经在群聊中
      const existingParticipants = await prisma.swarmChatSessionParticipant.findMany({
        where: {
          sessionId,
          participantId: { in: agentIds },
        },
      });

      const existingIds = existingParticipants.map(p => p.participantId);
      const newAgentIds = agentIds.filter((id: string) => !existingIds.includes(id));

      if (newAgentIds.length > 0) {
        await prisma.swarmChatSessionParticipant.createMany({
          data: newAgentIds.map((id: string) => ({
            sessionId,
            participantId: id,
            participantType: 'AGENT' as const,
            role: 'MEMBER' as const,
          })),
        });

        // 创建系统消息
        const newAgents = agents.filter(a => newAgentIds.includes(a.id));
        await prisma.swarmChatMessage.create({
          data: {
            sessionId,
            senderId: 'system',
            senderType: 'SYSTEM',
            content: `已邀请 ${newAgents.map(a => a.name).join('、')} 加入群聊。`,
            contentType: 'SYSTEM',
            status: 'SENT',
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: `成功邀请 ${newAgentIds.length} 位 Agent`,
      });
    } else if (action === 'remove' && agentIds.length > 0) {
      // 移除 Agent
      await prisma.swarmChatSessionParticipant.deleteMany({
        where: {
          sessionId,
          participantId: { in: agentIds },
          participantType: 'AGENT',
        },
      });

      await prisma.swarmChatMessage.create({
        data: {
          sessionId,
          senderId: 'system',
          senderType: 'SYSTEM',
          content: `已移除 ${agentIds.length} 位智能体。`,
          contentType: 'SYSTEM',
          status: 'SENT',
        },
      });

      return NextResponse.json({
        success: true,
        message: `成功移除 ${agentIds.length} 位 Agent`,
      });
    } else if (action === 'update') {
      // 更新群聊基本信息
      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;

      const updatedSession = await prisma.swarmChatSession.update({
        where: { id: sessionId },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        data: updatedSession,
      });
    }

    return NextResponse.json(
      { error: '无效的 action 参数' },
      { status: 400 }
    );
  } catch (error) {
    console.error('更新群聊失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - 删除群聊
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: '缺少 sessionId 参数' },
        { status: 400 }
      );
    }

    // 检查会话是否存在
    const session = await prisma.swarmChatSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return NextResponse.json(
        { error: '会话不存在' },
        { status: 404 }
      );
    }

    // 删除相关数据 (级联删除应该由 Prisma schema 处理)
    await prisma.swarmChatSession.delete({
      where: { id: sessionId },
    });

    return NextResponse.json({
      success: true,
      message: '群聊已删除',
    });
  } catch (error) {
    console.error('删除群聊失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '服务器内部错误' },
      { status: 500 }
    );
  }
}
