/**
 * Multi-Agent Orchestration - Redesigned with LangChain Best Practices
 *
 * Architecture Pattern: Supervisor + Shared State
 *
 * Key Design Principles:
 * 1. Supervisor Pattern: A supervisor agent coordinates specialist agents
 * 2. Shared State: All agents share a common conversation state
 * 3. Tool-based Agents: Each specialist is exposed as a tool to the supervisor
 * 4. Flexible Modes: Support sequential, parallel, and dynamic orchestration
 * 5. Memory Management: Efficient context sharing and trimming
 */

import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, AIMessage, BaseMessage, SystemMessage } from "@langchain/core/messages";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { z } from "zod";
import { getArtifactInstructions } from "@/lib/artifact/parser";

// ==================== Type Definitions ====================

/**
 * Orchestration modes
 */
export enum OrchestrationMode {
  SEQUENTIAL = 'sequential',      // Agents respond one by one in order
  PARALLEL = 'parallel',          // All mentioned agents respond in parallel
  DYNAMIC = 'dynamic',            // Supervisor decides who should respond
  ROUND_ROBIN = 'round_robin',    // Agents take turns responding
}

/**
 * Agent configuration
 */
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  modelPreference?: string;
  temperature?: number;
  maxTokens?: number;
  capabilities?: string[];        // What this agent can do
}

/**
 * Conversation state shared among all agents
 */
export interface ConversationState {
  sessionId: string;
  messages: BaseMessage[];        // Full conversation history
  participants: string[];         // Active agent IDs
  metadata: Record<string, any>;  // Custom metadata
  currentSpeaker?: string;        // Current active agent
  nextSpeaker?: string;           // Next agent to respond
}

/**
 * Orchestration decision from supervisor
 */
export interface OrchestrationDecision {
  nextAgentId: string;
  reasoning: string;
  shouldContinue: boolean;
  suggestedFollowUp?: string;
}

/**
 * Agent response
 */
export interface AgentResponse {
  agentId: string;
  agentName: string;
  content: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

// ==================== Specialist Agent ====================

/**
 * Specialist Agent - Represents a single expert agent
 */
export class SpecialistAgent {
  private llm: ChatOpenAI;
  private promptTemplate: ChatPromptTemplate;

  constructor(
    private config: AgentConfig,
    private apiKey: string,
    private baseURL?: string
  ) {
    // Initialize LLM for this agent
    this.llm = new ChatOpenAI({
      apiKey: this.apiKey,
      configuration: {
        baseURL: this.baseURL || "https://openrouter.ai/api/v1",
      },
      model: config.modelPreference || "anthropic/claude-3.5-sonnet",
      temperature: config.temperature || 0.7,
      maxTokens: config.maxTokens || 2000,
    });

    // Create prompt template
    this.promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", config.systemPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);
  }

  /**
   * Generate response to user input
   */
  async respond(
    input: string,
    conversationHistory: BaseMessage[],
    streamCallback?: (chunk: string) => void
  ): Promise<string> {
    const chain = this.promptTemplate
      .pipe(this.llm)
      .pipe(new StringOutputParser());

    if (streamCallback) {
      // Streaming mode
      const stream = await chain.stream({
        input,
        history: conversationHistory,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        streamCallback(chunk);
      }
      return fullResponse;
    } else {
      // Non-streaming mode
      return await chain.invoke({
        input,
        history: conversationHistory,
      });
    }
  }

  /**
   * Get agent metadata
   */
  getMetadata() {
    return {
      id: this.config.id,
      name: this.config.name,
      role: this.config.role,
      description: this.config.description,
      capabilities: this.config.capabilities || [],
    };
  }
}

// ==================== Supervisor Agent ====================

/**
 * Supervisor Agent - Coordinates specialist agents
 *
 * Responsibilities:
 * 1. Analyze user input and conversation context
 * 2. Decide which specialist agent(s) should respond
 * 3. Determine when the conversation should end
 * 4. Maintain conversation coherence
 */
export class SupervisorAgent {
  private llm: ChatOpenAI;

  constructor(
    private apiKey: string,
    private baseURL?: string,
    private model: string = "anthropic/claude-3.5-sonnet"
  ) {
    this.llm = new ChatOpenAI({
      apiKey: this.apiKey,
      configuration: {
        baseURL: this.baseURL || "https://openrouter.ai/api/v1",
      },
      model: this.model,
      temperature: 0.3, // Lower temperature for more consistent decisions
      maxTokens: 500,
    });
  }

  /**
   * Decide which agent should respond next
   */
  async decideNextAgent(
    userInput: string,
    conversationState: ConversationState,
    availableAgents: AgentConfig[],
    mentionedAgents?: string[]
  ): Promise<OrchestrationDecision> {
    // If user mentioned specific agents, return the first one
    if (mentionedAgents && mentionedAgents.length > 0) {
      const mentionedAgent = availableAgents.find(a => a.id === mentionedAgents[0]);
      if (mentionedAgent) {
        return {
          nextAgentId: mentionedAgent.id,
          reasoning: `User explicitly mentioned ${mentionedAgent.name}`,
          shouldContinue: mentionedAgents.length > 1,
        };
      }
    }

    // Build agent list for supervisor
    const agentDescriptions = availableAgents
      .map(agent => `- ${agent.id}: ${agent.name} (${agent.role}) - ${agent.description}`)
      .join('\n');

    // Build recent conversation context
    const recentMessages = conversationState.messages.slice(-5);
    const conversationContext = recentMessages
      .map(msg => {
        if (msg instanceof HumanMessage) {
          return `User: ${msg.content}`;
        } else if (msg instanceof AIMessage) {
          return `Agent: ${msg.content}`;
        } else if (msg instanceof SystemMessage) {
          return `System: ${msg.content}`;
        }
        return '';
      })
      .join('\n');

    // Create decision prompt
    const decisionPrompt = `You are a supervisor coordinating a group of specialist AI agents. Your task is to decide which agent should respond to the user's message.

Available Agents:
${agentDescriptions}

Recent Conversation:
${conversationContext}

User's Latest Message: ${userInput}

Analyze the user's message and conversation context, then decide which agent is BEST suited to respond. Consider:
1. Agent expertise and capabilities
2. Conversation flow and context
3. User's implicit or explicit needs

Respond in this exact JSON format:
{
  "nextAgentId": "agent-id",
  "reasoning": "Brief explanation of why this agent is best suited",
  "shouldContinue": false
}

Only output valid JSON, nothing else.`;

    try {
      const response = await this.llm.invoke([
        new SystemMessage("You are an intelligent agent coordinator. Always respond with valid JSON."),
        new HumanMessage(decisionPrompt),
      ]);

      const content = response.content.toString();

      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]) as OrchestrationDecision;

        // Validate the agent ID exists
        const selectedAgent = availableAgents.find(a => a.id === decision.nextAgentId);
        if (selectedAgent) {
          return decision;
        }
      }
    } catch (error) {
      console.error('Supervisor decision failed:', error);
    }

    // Fallback: select the first available agent
    const fallbackAgent = availableAgents[0];
    return {
      nextAgentId: fallbackAgent.id,
      reasoning: 'Fallback selection due to decision error',
      shouldContinue: false,
    };
  }
}

// ==================== Multi-Agent Orchestrator ====================

/**
 * Multi-Agent Orchestrator - Main orchestration engine
 *
 * Key Features:
 * 1. Manages multiple specialist agents
 * 2. Maintains shared conversation state
 * 3. Coordinates agent interactions via supervisor
 * 4. Supports multiple orchestration modes
 */
export class MultiAgentOrchestrator {
  private specialists: Map<string, SpecialistAgent> = new Map();
  private supervisor: SupervisorAgent;
  private state: ConversationState;

  constructor(
    private apiKey: string,
    private baseURL?: string,
    private mode: OrchestrationMode = OrchestrationMode.DYNAMIC
  ) {
    this.supervisor = new SupervisorAgent(apiKey, baseURL);

    // Initialize conversation state
    this.state = {
      sessionId: '',
      messages: [],
      participants: [],
      metadata: {},
    };
  }

  /**
   * Initialize session
   */
  initSession(sessionId: string, metadata?: Record<string, any>) {
    this.state.sessionId = sessionId;
    this.state.metadata = metadata || {};
  }

  /**
   * Register a specialist agent
   */
  registerAgent(config: AgentConfig): void {
    const agent = new SpecialistAgent(config, this.apiKey, this.baseURL);
    this.specialists.set(config.id, agent);

    if (!this.state.participants.includes(config.id)) {
      this.state.participants.push(config.id);
    }
  }

  /**
   * Unregister an agent
   */
  unregisterAgent(agentId: string): void {
    this.specialists.delete(agentId);
    this.state.participants = this.state.participants.filter(id => id !== agentId);
  }

  /**
   * Get all registered agents
   */
  getAgents(): AgentConfig[] {
    return Array.from(this.specialists.values()).map(agent => {
      const metadata = agent.getMetadata();
      return {
        id: metadata.id,
        name: metadata.name,
        role: metadata.role,
        description: metadata.description,
        systemPrompt: '', // Don't expose system prompt
        capabilities: metadata.capabilities,
      };
    });
  }

  /**
   * Load conversation history
   */
  loadHistory(messages: BaseMessage[]): void {
    this.state.messages = messages;
  }

  /**
   * Get conversation state
   */
  getState(): ConversationState {
    return { ...this.state };
  }

  /**
   * Parse @mentions from message
   */
  private parseMentions(message: string): string[] {
    const mentionPattern = /@([\w-]+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(message)) !== null) {
      const mentionedName = match[1];

      // Find agent by ID or name
      for (const [id, agent] of this.specialists) {
        const metadata = agent.getMetadata();
        if (id === mentionedName ||
            metadata.name.toLowerCase().includes(mentionedName.toLowerCase())) {
          mentions.push(id);
          break;
        }
      }
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  /**
   * Trim conversation history to prevent context overflow
   */
  private trimHistory(maxMessages: number = 20): BaseMessage[] {
    if (this.state.messages.length <= maxMessages) {
      return this.state.messages;
    }

    // Keep the first message (often contains important context) and recent messages
    return [
      this.state.messages[0],
      ...this.state.messages.slice(-maxMessages + 1),
    ];
  }

  /**
   * Process user message - Main orchestration logic
   */
  async processMessage(
    userMessage: string,
    userId: string = 'user',
    streamCallback?: (agentId: string, agentName: string, chunk: string) => void
  ): Promise<AgentResponse[]> {
    // Add user message to state
    const userMsg = new HumanMessage(userMessage);
    this.state.messages.push(userMsg);

    // Parse @mentions
    const mentions = this.parseMentions(userMessage);

    // Get available agents
    const availableAgents = this.getAgents();
    const responses: AgentResponse[] = [];

    switch (this.mode) {
      case OrchestrationMode.SEQUENTIAL:
        // Agents respond one by one based on @mentions or supervisor decision
        const agentsToRespond = mentions.length > 0
          ? mentions
          : [(await this.supervisor.decideNextAgent(userMessage, this.state, availableAgents, mentions)).nextAgentId];

        for (const agentId of agentsToRespond) {
          const response = await this.invokeAgent(agentId, userMessage, streamCallback);
          if (response) {
            responses.push(response);
          }
        }
        break;

      case OrchestrationMode.PARALLEL:
        // All mentioned agents respond in parallel
        if (mentions.length > 0) {
          const parallelResponses = await Promise.all(
            mentions.map(agentId => this.invokeAgent(agentId, userMessage, streamCallback))
          );
          responses.push(...parallelResponses.filter(r => r !== null) as AgentResponse[]);
        } else {
          // No mentions, let supervisor decide
          const decision = await this.supervisor.decideNextAgent(userMessage, this.state, availableAgents);
          const response = await this.invokeAgent(decision.nextAgentId, userMessage, streamCallback);
          if (response) {
            responses.push(response);
          }
        }
        break;

      case OrchestrationMode.DYNAMIC:
      default:
        // Supervisor decides who responds
        if (mentions.length > 0) {
          // User explicitly mentioned agents
          for (const agentId of mentions) {
            const response = await this.invokeAgent(agentId, userMessage, streamCallback);
            if (response) {
              responses.push(response);
            }
          }
        } else {
          // Supervisor makes decision
          const decision = await this.supervisor.decideNextAgent(
            userMessage,
            this.state,
            availableAgents,
            mentions
          );

          const response = await this.invokeAgent(decision.nextAgentId, userMessage, streamCallback);
          if (response) {
            responses.push(response);
          }

          // If supervisor suggests continuation, make another decision
          if (decision.shouldContinue) {
            const followUpDecision = await this.supervisor.decideNextAgent(
              decision.suggestedFollowUp || userMessage,
              this.state,
              availableAgents.filter(a => a.id !== decision.nextAgentId)
            );

            const followUpResponse = await this.invokeAgent(
              followUpDecision.nextAgentId,
              userMessage,
              streamCallback
            );
            if (followUpResponse) {
              responses.push(followUpResponse);
            }
          }
        }
        break;
    }

    return responses;
  }

  /**
   * Invoke a specific agent
   */
  private async invokeAgent(
    agentId: string,
    userMessage: string,
    streamCallback?: (agentId: string, agentName: string, chunk: string) => void
  ): Promise<AgentResponse | null> {
    const agent = this.specialists.get(agentId);
    if (!agent) {
      console.error(`Agent ${agentId} not found`);
      return null;
    }

    const metadata = agent.getMetadata();
    const trimmedHistory = this.trimHistory();

    try {
      const content = await agent.respond(
        userMessage,
        trimmedHistory,
        streamCallback ? (chunk) => streamCallback(agentId, metadata.name, chunk) : undefined
      );

      // Add agent response to shared state
      const agentMsg = new AIMessage(content);
      this.state.messages.push(agentMsg);

      return {
        agentId,
        agentName: metadata.name,
        content,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error(`Agent ${agentId} failed to respond:`, error);
      return null;
    }
  }

  /**
   * Export conversation to Markdown
   */
  exportToMarkdown(): string {
    let markdown = `# Multi-Agent Conversation\n\n`;
    markdown += `Session ID: ${this.state.sessionId}\n`;
    markdown += `Participants: ${this.state.participants.join(', ')}\n\n`;
    markdown += `---\n\n`;

    for (const msg of this.state.messages) {
      if (msg instanceof HumanMessage) {
        markdown += `**User:**\n${msg.content}\n\n`;
      } else if (msg instanceof AIMessage) {
        markdown += `**Agent:**\n${msg.content}\n\n`;
      } else if (msg instanceof SystemMessage) {
        markdown += `*System: ${msg.content}*\n\n`;
      }
    }

    return markdown;
  }

  /**
   * Set orchestration mode
   */
  setMode(mode: OrchestrationMode): void {
    this.mode = mode;
  }

  /**
   * Get current mode
   */
  getMode(): OrchestrationMode {
    return this.mode;
  }
}

// ==================== Factory Functions ====================

/**
 * Create a multi-agent orchestrator
 */
export function createOrchestrator(
  apiKey: string,
  baseURL?: string,
  mode: OrchestrationMode = OrchestrationMode.DYNAMIC
): MultiAgentOrchestrator {
  return new MultiAgentOrchestrator(apiKey, baseURL, mode);
}

/**
 * Create agent configuration
 */
export function createAgentConfig(
  id: string,
  name: string,
  role: string,
  systemPrompt: string,
  options?: Partial<AgentConfig>
): AgentConfig {
  // Append artifact instructions to system prompt
  const enhancedSystemPrompt = `${systemPrompt}

---

${getArtifactInstructions()}`;

  return {
    id,
    name,
    role,
    description: options?.description || role,
    systemPrompt: enhancedSystemPrompt,
    modelPreference: options?.modelPreference,
    temperature: options?.temperature ?? 0.7,
    maxTokens: options?.maxTokens ?? 2000,
    capabilities: options?.capabilities || [],
  };
}
