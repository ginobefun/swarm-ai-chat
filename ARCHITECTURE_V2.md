# 🏗️ 多智能体编排架构 v2.0

## 📋 重构概述

基于 LangChain 最佳实践重新设计的多智能体协作架构。

### 🎯 核心改进

1. **升级 LangChain 到最新版本** (1.0.2)
2. **采用 Supervisor Pattern（监督者模式）**
3. **实现共享状态管理**
4. **支持多种编排模式**
5. **添加完整单元测试**

---

## 🔄 架构设计模式

### 1. Supervisor Pattern（监督者模式）

```
┌─────────────────────────────────────┐
│         User Message                │
└──────────────┬──────────────────────┘
               │
               ▼
      ┌────────────────┐
      │   Supervisor   │  ← 协调和决策
      │     Agent      │
      └────────┬───────┘
               │
      ┌────────┼────────┐
      ▼        ▼        ▼
   ┌─────┐ ┌─────┐ ┌─────┐
   │ PM  │ │Tech │ │ UX  │  ← 专业智能体
   │Agent│ │Agent│ │Agent│
   └─────┘ └─────┘ └─────┘
      │        │        │
      └────────┼────────┘
               ▼
        Agent Responses
```

**优势:**
- 🧠 **智能协调**: Supervisor 分析场景决定最佳 Agent
- 🔄 **动态编排**: 根据对话流程动态调整发言顺序
- 🎯 **职责分离**: Supervisor 负责协调，Specialist 专注专业领域

### 2. Shared State（共享状态）

所有 Agent 共享同一个对话状态:

```typescript
interface ConversationState {
  sessionId: string;              // 会话ID
  messages: BaseMessage[];        // 完整对话历史
  participants: string[];         // 活跃Agent列表
  metadata: Record<string, any>;  // 自定义元数据
  currentSpeaker?: string;        // 当前发言者
  nextSpeaker?: string;           // 下一个发言者
}
```

**优势:**
- 📝 **上下文连贯**: 所有Agent都能看到完整对话历史
- 🔄 **状态同步**: 自动同步消息更新
- 💾 **易于持久化**: 统一状态便于保存和恢复

---

## 🎮 三种编排模式

### Mode 1: Dynamic (动态编排) - 默认

Supervisor 智能决策谁应该回应:

```typescript
orchestrator.setMode(OrchestrationMode.DYNAMIC);

// 用户: "我想规划一次日本旅行"
// → Supervisor 分析: 旅行规划专家最合适
// → 旅行专家回复

// 用户: "预算怎么控制?"
// → Supervisor 分析: 继续让旅行专家回复
```

**适用场景:** 开放式讨论、脑暴、咨询

### Mode 2: Sequential (顺序编排)

Agent 按 @提及顺序依次回应:

```typescript
orchestrator.setMode(OrchestrationMode.SEQUENTIAL);

// 用户: "@产品经理 @技术架构师 评估这个功能"
// → 产品经理先回复
// → 技术架构师后回复
```

**适用场景:** 评审流程、结构化讨论

### Mode 3: Parallel (并行编排)

所有被 @的 Agent 同时回应:

```typescript
orchestrator.setMode(OrchestrationMode.PARALLEL);

// 用户: "@营销专家 @文案大师 @数据分析师 给出建议"
// → 三个Agent并行生成回复
// → 同时返回结果
```

**适用场景:** 快速收集多方意见、头脑风暴

---

## 🏛️ 核心类设计

### 1. MultiAgentOrchestrator (主编排器)

**职责:**
- 管理 Specialist Agent 注册表
- 维护共享 ConversationState
- 协调 Supervisor 和 Specialist 的交互
- 支持多种编排模式

**核心方法:**
```typescript
class MultiAgentOrchestrator {
  // 初始化会话
  initSession(sessionId: string, metadata?: Record<string, any>): void

  // 注册/注销智能体
  registerAgent(config: AgentConfig): void
  unregisterAgent(agentId: string): void

  // 加载历史记录
  loadHistory(messages: BaseMessage[]): void

  // 处理消息 (核心)
  processMessage(
    userMessage: string,
    userId: string,
    streamCallback?: (agentId, agentName, chunk) => void
  ): Promise<AgentResponse[]>

  // 状态管理
  getState(): ConversationState
  setMode(mode: OrchestrationMode): void
  getMode(): OrchestrationMode

  // 导出
  exportToMarkdown(): string
}
```

### 2. SupervisorAgent (监督者)

**职责:**
- 分析用户消息和对话上下文
- 决策哪个 Specialist Agent 应该回应
- 判断是否需要多个 Agent 参与

**决策逻辑:**
```typescript
class SupervisorAgent {
  async decideNextAgent(
    userInput: string,
    conversationState: ConversationState,
    availableAgents: AgentConfig[],
    mentionedAgents?: string[]
  ): Promise<OrchestrationDecision>
}

interface OrchestrationDecision {
  nextAgentId: string;      // 选择的Agent
  reasoning: string;        // 选择理由
  shouldContinue: boolean;  // 是否需要后续Agent
  suggestedFollowUp?: string;
}
```

**决策考虑因素:**
1. 用户显式 @提及
2. Agent 的专业领域和能力
3. 对话历史和上下文
4. 消息的隐含需求

### 3. SpecialistAgent (专业智能体)

**职责:**
- 代表一个专业领域的AI专家
- 接收输入和对话历史，生成回复
- 支持流式和非流式输出

**核心方法:**
```typescript
class SpecialistAgent {
  async respond(
    input: string,
    conversationHistory: BaseMessage[],
    streamCallback?: (chunk: string) => void
  ): Promise<string>

  getMetadata(): {
    id: string;
    name: string;
    role: string;
    description: string;
    capabilities: string[];
  }
}
```

---

## 🔧 使用示例

### 基础使用

```typescript
import { createOrchestrator, createAgentConfig, OrchestrationMode } from '@/lib/langchain/orchestrator';

// 1. 创建编排器
const orchestrator = createOrchestrator(
  apiKey,
  baseURL,
  OrchestrationMode.DYNAMIC
);

// 2. 初始化会话
orchestrator.initSession('session-123', {
  title: '产品需求讨论',
  type: 'GROUP',
});

// 3. 注册智能体
const productManager = createAgentConfig(
  'pm-001',
  '产品经理',
  '资深产品经理',
  'You are a senior product manager with 10 years experience...'
);

orchestrator.registerAgent(productManager);

// 4. 处理消息
const responses = await orchestrator.processMessage(
  'We need to design a new feature for...',
  'user-123',
  (agentId, agentName, chunk) => {
    console.log(`[${agentName}]: ${chunk}`);
  }
);

// 5. 获取状态
const state = orchestrator.getState();
console.log(`Session: ${state.sessionId}`);
console.log(`Messages: ${state.messages.length}`);
```

### 高级用法

```typescript
// 加载历史对话
const history = await loadFromDatabase(sessionId);
orchestrator.loadHistory(history);

// 动态切换模式
if (userWantsParallelFeedback) {
  orchestrator.setMode(OrchestrationMode.PARALLEL);
}

// 导出对话
const markdown = orchestrator.exportToMarkdown();
await saveToFile(markdown);
```

---

## 📊 上下文管理策略

### 自动裁剪

为避免上下文溢出，orchestrator 自动管理历史:

```typescript
private trimHistory(maxMessages: number = 20): BaseMessage[] {
  if (this.state.messages.length <= maxMessages) {
    return this.state.messages;
  }

  // 保留第一条消息(通常包含重要上下文) + 最近的消息
  return [
    this.state.messages[0],
    ...this.state.messages.slice(-maxMessages + 1),
  ];
}
```

**策略:**
- 保留首条消息（通常是系统指令或重要上下文）
- 保留最近 N 条消息（默认 20 条）
- 自动在每次调用 Agent 时裁剪

### 上下文共享

每个 Agent 收到的上下文包含:

```typescript
{
  input: string,              // 用户当前输入
  history: BaseMessage[],     // 裁剪后的对话历史
}
```

所有 Agent 看到相同的历史记录，确保上下文一致性。

---

## 🧪 测试覆盖

### 测试文件

`src/lib/langchain/__tests__/orchestrator.test.ts`

### 测试用例 (17个)

#### Agent Configuration (2 tests)
- ✅ 创建基础配置
- ✅ 创建带可选参数的配置

#### Multi-Agent Orchestrator (11 tests)
- ✅ 默认模式初始化
- ✅ 指定模式初始化
- ✅ 会话初始化
- ✅ 注册单个 Agent
- ✅ 注册多个 Agent
- ✅ 注销 Agent
- ✅ 加载对话历史
- ✅ 获取当前状态
- ✅ 切换编排模式
- ✅ 导出 Markdown
- ✅ 集成测试: 注册和状态管理

#### Specialist Agent (1 test)
- ✅ 创建专业智能体

#### Supervisor Agent (1 test)
- ✅ 创建监督者智能体

#### Integration Tests (2 tests)
- ✅ Agent 注册和状态管理
- ✅ 模式切换和状态持久化

### 运行测试

```bash
# 运行所有测试
pnpm test:run

# 交互式测试 UI
pnpm test:ui

# 持续监听模式
pnpm test
```

**测试结果:**
```
✓ src/lib/langchain/__tests__/orchestrator.test.ts (17 tests) 16ms

Test Files  1 passed (1)
     Tests  17 passed (17)
  Start at  03:29:35
  Duration  2.22s
```

---

## 🔄 与旧架构对比

| 方面 | 旧架构 | 新架构 v2.0 |
|------|--------|-------------|
| **设计模式** | 扁平化，无明确模式 | Supervisor Pattern |
| **状态管理** | 分散的消息列表 | 统一 ConversationState |
| **决策机制** | 简单 @解析 + 基础决策 | Supervisor 智能分析 |
| **编排模式** | 仅支持单一模式 | 3种模式（动态/顺序/并行）|
| **上下文共享** | 手动管理 | 自动共享和裁剪 |
| **测试覆盖** | 无 | 17个单元测试 |
| **类型安全** | 基础 TypeScript | 完整类型定义 |
| **可扩展性** | 中等 | 高（模块化设计）|

---

## 🚀 性能优化

### 1. 并行执行

在 PARALLEL 模式下,多个 Agent 同时生成回复:

```typescript
const parallelResponses = await Promise.all(
  mentions.map(agentId =>
    this.invokeAgent(agentId, userMessage, streamCallback)
  )
);
```

### 2. 流式输出

支持服务端流式响应，实时显示生成过程:

```typescript
const responses = await orchestrator.processMessage(
  message,
  userId,
  (agentId, agentName, chunk) => {
    // 实时推送到前端
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({
      type: 'chunk',
      agentId,
      agentName,
      chunk
    })}\n\n`));
  }
);
```

### 3. 上下文自动裁剪

避免发送过长上下文，节省 token 成本:

```typescript
const trimmedHistory = this.trimHistory(20);  // 只保留20条
```

---

## 📦 API 集成

### 更新的 API 端点

**POST /api/group-chat**

新增 `mode` 参数:

```json
{
  "sessionId": "uuid",
  "userId": "user-id",
  "userName": "User Name",
  "message": "用户消息",
  "mode": "dynamic"  // 新增: sequential | parallel | dynamic
}
```

**响应流:**

```
data: {"type":"chunk","agentId":"pm-001","agentName":"产品经理","chunk":"这是"}
data: {"type":"chunk","agentId":"pm-001","agentName":"产品经理","chunk":"一个"}
data: {"type":"complete","agentId":"pm-001","content":"完整回复","messageId":"msg-123"}
data: {"type":"metadata","orchestrationMode":"dynamic","agentsInvolved":1,"state":{...}}
data: [DONE]
```

---

## 🎯 最佳实践

### 1. Agent 配置

```typescript
// ✅ 好的实践
const config = createAgentConfig(
  'pm-expert',
  'Product Manager Expert',
  'Senior Product Manager',
  'You are a senior product manager with 10 years of experience in...',
  {
    description: 'Specialized in B2B SaaS product design',
    capabilities: ['prd-writing', 'user-research', 'roadmap-planning'],
    temperature: 0.7,  // 适中的创造性
    maxTokens: 2000,
  }
);

// ❌ 避免
const config = createAgentConfig(
  'agent1',  // ID太简单
  'Agent',   // 名称不清晰
  'Helper',  // 角色模糊
  'Help user'  // System Prompt 太简单
);
```

### 2. 模式选择

```typescript
// 评审流程 → Sequential
orchestrator.setMode(OrchestrationMode.SEQUENTIAL);

// 快速收集意见 → Parallel
orchestrator.setMode(OrchestrationMode.PARALLEL);

// 自然对话 → Dynamic (默认)
orchestrator.setMode(OrchestrationMode.DYNAMIC);
```

### 3. 历史管理

```typescript
// ✅ 定期保存状态
const state = orchestrator.getState();
await saveToDatabase(state);

// ✅ 恢复会话
const savedState = await loadFromDatabase(sessionId);
orchestrator.loadHistory(savedState.messages);

// ✅ 导出记录
const markdown = orchestrator.exportToMarkdown();
await saveAsFile(markdown);
```

---

## 🔮 未来扩展方向

### 1. LangGraph 集成

使用 LangGraph 实现更复杂的状态机:

```typescript
import { StateGraph } from "@langchain/langgraph";

const workflow = new StateGraph({
  channels: {
    messages: [],
    currentAgent: null,
  }
});

workflow.addNode("supervisor", supervisorNode);
workflow.addNode("specialist1", specialist1Node);
workflow.addEdge("supervisor", "specialist1");
```

### 2. Tool Calling

为 Agent 添加工具调用能力:

```typescript
const tools = [
  new DuckDuckGoSearchTool(),
  new CalculatorTool(),
  new CodeInterpreterTool(),
];

const agentWithTools = createAgentConfig(
  'researcher',
  'Researcher',
  'Research Expert',
  'You are a researcher with access to search tools...',
  {
    tools: tools,
  }
);
```

### 3. RAG 知识库

为每个 Agent 配置专属知识库:

```typescript
const vectorStore = await loadVectorStore(agentId);

const agentWithKnowledge = createAgentConfig(
  'legal-expert',
  'Legal Expert',
  'Legal Advisor',
  'You have access to legal documents...',
  {
    retriever: vectorStore.asRetriever(),
  }
);
```

### 4. 高级编排模式

- **Debate Mode**: Agent 之间互相辩论
- **Review Mode**: Agent 轮流评审用户草案
- **Hierarchical**: 多层级 Agent 结构

---

## 📚 参考资源

### LangChain 文档
- [Multi-Agent Patterns](https://js.langchain.com/docs/use_cases/multi_agent)
- [LangGraph](https://langchain-ai.github.io/langgraphjs/)
- [Agent Types](https://js.langchain.com/docs/modules/agents/agent_types)

### 设计模式
- Supervisor Pattern
- Agent-as-a-Tool Pattern
- Hierarchical Multi-Agent Systems

---

## ✅ 总结

### 关键改进

1. **架构升级**: Supervisor Pattern + Shared State
2. **编排增强**: 3种模式 (Dynamic/Sequential/Parallel)
3. **代码质量**: 完整类型定义 + 17个单元测试
4. **可维护性**: 模块化设计 + 清晰职责分离
5. **可扩展性**: 易于添加新 Agent 和新模式

### 技术栈

- LangChain.js 1.0.2+
- TypeScript 5.0+
- Vitest (测试框架)
- Next.js 15 (API Routes)

### 测试通过率

**17/17 tests passed ✅**

---

**架构 v2.0 已就绪，可投入生产使用！🚀**
