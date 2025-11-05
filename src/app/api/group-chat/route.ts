/**
 * Group Chat Multi-Agent API - Redesigned with new orchestrator
 *
 * POST /api/group-chat
 * - Process user messages in a group chat
 * - Orchestrate multiple AI agents
 * - Support streaming responses
 */

import { NextRequest, NextResponse } from 'next/server';
import { createOrchestrator, createAgentConfig, OrchestrationMode } from '@/lib/langchain/orchestrator';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { prisma } from '@/lib/database/prisma';
import { parseArtifacts } from '@/lib/artifact/parser';

// Stream encoder
const encoder = new TextEncoder();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      userId,
      userName = 'User',
      message,
      mode = 'dynamic', // orchestration mode: sequential | parallel | dynamic
    } = body;

    // Validate required parameters
    if (!sessionId || !userId || !message) {
      return NextResponse.json(
        { error: 'Missing required parameters: sessionId, userId, message' },
        { status: 400 }
      );
    }

    // Get API key
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API Key not configured' },
        { status: 500 }
      );
    }

    // Get session with participants
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
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get participating agents
    const participatingAgents = session.participants
      .filter(p => p.participantType === 'AGENT' && p.agent)
      .map(p => p.agent!);

    if (participatingAgents.length === 0) {
      return NextResponse.json(
        { error: 'No agents in this session' },
        { status: 400 }
      );
    }

    // Create orchestrator
    const orchestrationMode = mode === 'sequential' ? OrchestrationMode.SEQUENTIAL
      : mode === 'parallel' ? OrchestrationMode.PARALLEL
      : OrchestrationMode.DYNAMIC;

    const orchestrator = createOrchestrator(
      apiKey,
      process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
      orchestrationMode
    );

    // Initialize session
    orchestrator.initSession(sessionId, {
      title: session.title,
      type: session.type,
    });

    // Register all participating agents
    for (const agent of participatingAgents) {
      const agentConfig = createAgentConfig(
        agent.id,
        agent.name,
        agent.specialty || agent.description || 'AI Assistant',
        agent.systemPrompt || `You are ${agent.name}, ${agent.description}`,
        {
          description: agent.description || '',
          modelPreference: agent.modelPreference || undefined,
          temperature: 0.7,
          maxTokens: 2000,
          capabilities: agent.tags || [],
        }
      );
      orchestrator.registerAgent(agentConfig);
    }

    // Load conversation history
    const historyMessages = await prisma.swarmChatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 50, // Limit to last 50 messages
    });

    // Convert to LangChain messages
    const langchainMessages = historyMessages.map(msg => {
      const content = `[${msg.senderType === 'USER' ? userName : msg.senderId}]: ${msg.content}`;

      if (msg.senderType === 'USER') {
        return new HumanMessage(content);
      } else if (msg.senderType === 'AGENT') {
        return new AIMessage(content);
      } else {
        return new SystemMessage(content);
      }
    });

    orchestrator.loadHistory(langchainMessages);

    // Save user message to database
    const userMessageRecord = await prisma.swarmChatMessage.create({
      data: {
        sessionId,
        senderId: userId,
        senderType: 'USER',
        content: message,
        contentType: 'TEXT',
        status: 'SENT',
      },
    });

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Track responses for database storage
          const agentResponses: Array<{
            agentId: string;
            agentName: string;
            content: string;
          }> = [];

          let currentAgentContent = '';
          let currentAgentId = '';
          let currentAgentName = '';

          // Process message with orchestrator
          const responses = await orchestrator.processMessage(
            message,
            userId,
            (agentId, agentName, chunk) => {
              // If new agent, save previous agent's response
              if (currentAgentId && currentAgentId !== agentId) {
                agentResponses.push({
                  agentId: currentAgentId,
                  agentName: currentAgentName,
                  content: currentAgentContent,
                });
                currentAgentContent = '';
              }

              // Update current agent
              currentAgentId = agentId;
              currentAgentName = agentName;
              currentAgentContent += chunk;

              // Stream chunk to client
              const data = {
                type: 'chunk',
                agentId,
                agentName,
                chunk,
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            }
          );

          // Save last agent's response
          if (currentAgentId && currentAgentContent) {
            agentResponses.push({
              agentId: currentAgentId,
              agentName: currentAgentName,
              content: currentAgentContent,
            });
          }

          // If no streaming was used, use the responses directly
          if (agentResponses.length === 0 && responses.length > 0) {
            agentResponses.push(...responses.map(r => ({
              agentId: r.agentId,
              agentName: r.agentName,
              content: r.content,
            })));
          }

          // Save agent responses to database
          const savedMessages = [];
          for (const response of agentResponses) {
            // Parse artifacts from response
            const parseResult = parseArtifacts(response.content);
            const hasArtifacts = parseResult.artifacts.length > 0;

            // Save message with text content (artifacts removed)
            const savedMessage = await prisma.swarmChatMessage.create({
              data: {
                sessionId,
                senderId: response.agentId,
                senderType: 'AGENT',
                content: parseResult.textContent || response.content,
                contentType: 'TEXT',
                status: 'SENT',
                hasArtifacts,
                // TODO: Calculate token count and cost
                tokenCount: 0,
                cost: 0,
              },
            });

            // Save artifacts
            const savedArtifacts = [];
            for (const artifact of parseResult.artifacts) {
              const savedArtifact = await prisma.swarmArtifact.create({
                data: {
                  messageId: savedMessage.id,
                  sessionId,
                  type: artifact.type.toUpperCase() as any, // Convert to enum
                  title: artifact.title,
                  content: artifact.content,
                  language: artifact.language,
                  metadata: artifact.metadata || {},
                },
              });
              savedArtifacts.push(savedArtifact);
            }

            savedMessages.push(savedMessage);

            // Send completion event with artifacts
            const completeData = {
              type: 'complete',
              agentId: response.agentId,
              agentName: response.agentName,
              content: parseResult.textContent || response.content,
              messageId: savedMessage.id,
              artifacts: savedArtifacts.map(a => ({
                id: a.id,
                type: a.type,
                title: a.title,
                content: a.content,
                language: a.language,
              })),
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completeData)}\n\n`));
          }

          // Update session statistics
          await prisma.swarmChatSession.update({
            where: { id: sessionId },
            data: {
              messageCount: { increment: 1 + savedMessages.length },
              updatedAt: new Date(),
            },
          });

          // Send metadata
          const metadataData = {
            type: 'metadata',
            orchestrationMode: mode,
            agentsInvolved: agentResponses.length,
            state: orchestrator.getState(),
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadataData)}\n\n`));

          // Send done event
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Group chat processing error:', error);

          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
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
    console.error('Group chat API error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/group-chat?sessionId=xxx
 * Get group chat session information
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId parameter' },
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
                tags: true,
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
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        session: {
          id: session.id,
          title: session.title,
          description: session.description,
          type: session.type,
          status: session.status,
          messageCount: session.messageCount,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt,
          createdBy: session.createdBy,
        },
        participants: session.participants.map(p => ({
          id: p.id,
          type: p.participantType,
          role: p.role,
          joinedAt: p.joinedAt,
          agent: p.agent,
        })),
      },
    });
  } catch (error) {
    console.error('Get group chat error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
