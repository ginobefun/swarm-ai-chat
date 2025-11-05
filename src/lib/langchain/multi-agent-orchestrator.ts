/**
 * Multi-Agent Orchestrator
 *
 * 核心功能:
 * 1. 管理多个 LangChain Agent 的协作
 * 2. 实现智能编排 (决定谁应该发言)
 * 3. 处理 @提及和直接指定
 * 4. 管理群聊上下文和记忆
 */

import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 智能体配置接口
export interface AgentConfig {
  id: string;
  name: string;
  role: string;
  systemPrompt: string;
  modelPreference?: string;
  tools?: string[]; // 工具 ID 列表
  knowledgeBase?: string; // 知识库 ID
  temperature?: number;
}

// 消息接口
export interface ChatMessage {
  id: string;
  senderId: string;
  senderType: 'USER' | 'AGENT' | 'SYSTEM';
  senderName: string;
  content: string;
  mentions?: string[]; // @提及的 Agent ID 列表
  timestamp: Date;
}

// 编排决策接口
export interface OrchestrationDecision {
  nextSpeakerId: string;
  reason: string;
  shouldContinue: boolean;
}

/**
 * 多智能体编排器
 */
export class MultiAgentOrchestrator {
  private agents: Map<string, AgentConfig> = new Map();
  private llmInstances: Map<string, ChatOpenAI> = new Map();
  private conversationHistory: ChatMessage[] = [];
  private orchestratorLLM: ChatOpenAI;

  constructor(
    private apiKey: string,
    private baseURL?: string,
    private defaultModel: string = "anthropic/claude-3.5-sonnet"
  ) {
    // 初始化编排器的 LLM (用于决策谁应该发言)
    this.orchestratorLLM = new ChatOpenAI({
      apiKey: this.apiKey,
      configuration: {
        baseURL: this.baseURL || "https://openrouter.ai/api/v1",
      },
      model: this.defaultModel,
      temperature: 0.3,
    });
  }

  /**
   * 注册智能体
   */
  registerAgent(config: AgentConfig): void {
    this.agents.set(config.id, config);

    // 为每个 Agent 创建独立的 LLM 实例
    const llm = new ChatOpenAI({
      apiKey: this.apiKey,
      configuration: {
        baseURL: this.baseURL || "https://openrouter.ai/api/v1",
      },
      model: config.modelPreference || this.defaultModel,
      temperature: config.temperature || 0.7,
    });

    this.llmInstances.set(config.id, llm);
  }

  /**
   * 移除智能体
   */
  unregisterAgent(agentId: string): void {
    this.agents.delete(agentId);
    this.llmInstances.delete(agentId);
  }

  /**
   * 获取所有已注册的智能体
   */
  getRegisteredAgents(): AgentConfig[] {
    return Array.from(this.agents.values());
  }

  /**
   * 添加消息到历史记录
   */
  addMessage(message: ChatMessage): void {
    this.conversationHistory.push(message);
  }

  /**
   * 获取对话历史
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * 清空对话历史
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * 构建对话上下文 (LangChain Messages)
   */
  private buildConversationContext(limit: number = 20): BaseMessage[] {
    const recentMessages = this.conversationHistory.slice(-limit);

    return recentMessages.map(msg => {
      const content = `[${msg.senderName}]: ${msg.content}`;

      if (msg.senderType === 'USER') {
        return new HumanMessage(content);
      } else if (msg.senderType === 'AGENT') {
        return new AIMessage(content);
      } else {
        return new SystemMessage(content);
      }
    });
  }

  /**
   * 智能决策: 谁应该下一个发言?
   *
   * 这是多智能体编排的核心逻辑
   */
  async decideNextSpeaker(
    userMessage: string,
    mentions: string[] = []
  ): Promise<OrchestrationDecision> {
    // 如果用户 @了特定 Agent, 直接返回
    if (mentions.length > 0) {
      const firstMentioned = mentions[0];
      const agent = this.agents.get(firstMentioned);

      if (agent) {
        return {
          nextSpeakerId: firstMentioned,
          reason: `用户直接 @${agent.name}`,
          shouldContinue: mentions.length > 1, // 如果有多个@, 应该继续
        };
      }
    }

    // 构建决策提示词
    const agentList = Array.from(this.agents.values())
      .map(agent => `- ${agent.id}: ${agent.name} (${agent.role})`)
      .join('\n');

    const conversationContext = this.conversationHistory
      .slice(-5)
      .map(msg => `[${msg.senderName}]: ${msg.content}`)
      .join('\n');

    const decisionPrompt = `你是一个群聊协作的智能编排器。你的任务是决定在当前对话场景下,哪个智能体最适合回应用户的消息。

可用的智能体:
${agentList}

最近的对话记录:
${conversationContext}

用户的最新消息: ${userMessage}

请分析场景,选择最合适的智能体来回应。输出格式:
{
  "nextSpeakerId": "agent-id",
  "reason": "选择的理由",
  "shouldContinue": false
}

只输出 JSON,不要其他内容。`;

    try {
      const response = await this.orchestratorLLM.invoke([
        new SystemMessage("你是一个智能编排器,负责决策多智能体协作中的发言顺序。"),
        new HumanMessage(decisionPrompt),
      ]);

      const content = response.content.toString();

      // 尝试解析 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const decision = JSON.parse(jsonMatch[0]);
        return decision;
      }
    } catch (error) {
      console.error('决策失败, 使用默认策略:', error);
    }

    // 默认策略: 选择第一个注册的 Agent
    const firstAgent = Array.from(this.agents.values())[0];
    return {
      nextSpeakerId: firstAgent?.id || '',
      reason: '默认选择',
      shouldContinue: false,
    };
  }

  /**
   * 让特定 Agent 生成回复
   */
  async generateAgentResponse(
    agentId: string,
    userMessage: string,
    streamCallback?: (chunk: string) => void
  ): Promise<string> {
    const agent = this.agents.get(agentId);
    const llm = this.llmInstances.get(agentId);

    if (!agent || !llm) {
      throw new Error(`Agent ${agentId} 未找到`);
    }

    // 构建提示词模板
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", agent.systemPrompt],
      new MessagesPlaceholder("history"),
      ["human", "{input}"],
    ]);

    // 创建链
    const chain = prompt.pipe(llm).pipe(new StringOutputParser());

    // 获取对话历史
    const history = this.buildConversationContext(15);

    // 调用链
    if (streamCallback) {
      // 流式输出
      const stream = await chain.stream({
        input: userMessage,
        history: history,
      });

      let fullResponse = '';
      for await (const chunk of stream) {
        fullResponse += chunk;
        streamCallback(chunk);
      }
      return fullResponse;
    } else {
      // 非流式输出
      const response = await chain.invoke({
        input: userMessage,
        history: history,
      });
      return response;
    }
  }

  /**
   * 处理用户消息 (完整流程)
   *
   * 1. 解析 @提及
   * 2. 决策下一个发言者
   * 3. 生成回复
   * 4. 更新历史记录
   */
  async processUserMessage(
    userId: string,
    userName: string,
    message: string,
    streamCallback?: (agentId: string, agentName: string, chunk: string) => void
  ): Promise<ChatMessage[]> {
    // 解析 @提及
    const mentions = this.parseMentions(message);

    // 添加用户消息到历史
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: userId,
      senderType: 'USER',
      senderName: userName,
      content: message,
      mentions,
      timestamp: new Date(),
    };
    this.addMessage(userMsg);

    const responses: ChatMessage[] = [];

    // 如果有 @提及, 让所有被提及的 Agent 依次回复
    if (mentions.length > 0) {
      for (const agentId of mentions) {
        const agent = this.agents.get(agentId);
        if (!agent) continue;

        const response = await this.generateAgentResponse(
          agentId,
          message,
          streamCallback ? (chunk) => streamCallback(agentId, agent.name, chunk) : undefined
        );

        const agentMsg: ChatMessage = {
          id: `msg-${Date.now()}-${agentId}`,
          senderId: agentId,
          senderType: 'AGENT',
          senderName: agent.name,
          content: response,
          timestamp: new Date(),
        };

        this.addMessage(agentMsg);
        responses.push(agentMsg);
      }
    } else {
      // 智能决策谁应该回复
      const decision = await this.decideNextSpeaker(message, mentions);

      if (decision.nextSpeakerId) {
        const agent = this.agents.get(decision.nextSpeakerId);
        if (agent) {
          const response = await this.generateAgentResponse(
            decision.nextSpeakerId,
            message,
            streamCallback ? (chunk) => streamCallback(decision.nextSpeakerId, agent.name, chunk) : undefined
          );

          const agentMsg: ChatMessage = {
            id: `msg-${Date.now()}-${decision.nextSpeakerId}`,
            senderId: decision.nextSpeakerId,
            senderType: 'AGENT',
            senderName: agent.name,
            content: response,
            timestamp: new Date(),
          };

          this.addMessage(agentMsg);
          responses.push(agentMsg);
        }
      }
    }

    return responses;
  }

  /**
   * 解析消息中的 @提及
   */
  private parseMentions(message: string): string[] {
    const mentionPattern = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionPattern.exec(message)) !== null) {
      const mentionedName = match[1];

      // 在注册的 Agent 中查找匹配的名称或 ID
      for (const [id, agent] of this.agents) {
        if (agent.name.toLowerCase().includes(mentionedName.toLowerCase()) || id === mentionedName) {
          mentions.push(id);
          break;
        }
      }
    }

    return [...new Set(mentions)]; // 去重
  }

  /**
   * 导出对话历史为 Markdown
   */
  exportToMarkdown(): string {
    let markdown = '# 群聊对话记录\n\n';
    markdown += `导出时间: ${new Date().toLocaleString()}\n\n`;
    markdown += `参与者: ${Array.from(this.agents.values()).map(a => a.name).join(', ')}\n\n`;
    markdown += '---\n\n';

    for (const msg of this.conversationHistory) {
      markdown += `### ${msg.senderName} (${msg.timestamp.toLocaleString()})\n\n`;
      markdown += `${msg.content}\n\n`;
    }

    return markdown;
  }
}

/**
 * 创建默认的多智能体编排器实例
 */
export function createMultiAgentOrchestrator(
  apiKey: string,
  baseURL?: string
): MultiAgentOrchestrator {
  return new MultiAgentOrchestrator(apiKey, baseURL);
}
