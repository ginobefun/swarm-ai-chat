SwarmAI.chat · 多智能体协作群聊

LangGraph-驱动 V1.0 详细设计（交付 UI & 开发团队）

⸻

0 · 版本边界

范畴	本版实现	备注（保留扩展钩子）
性能	不做硬性 P95/成本目标	state.costUSD 字段仍累计，便于将来设阈值
可运维	先写入 DB 日志，暂不接入 OTel / Prometheus	Graph 事件层保留 onNodeStart/onNodeEnd 钩子
监控 / 合规	仅留空函数 beforeSendToLLM, afterLLMOutput	未来在此注入安全检测、速率统计


⸻

1 · 新增数据模型

model SwarmChatResult {
  id          String   @id @default(uuid()) @db.Uuid
  sessionId   String   @db.Uuid
  turnIndex   Int                         // 第几次主持人汇总
  stateBlob   Json                        // 压缩后的 OrchestratorState（无 HTML）
  summary     String?                     // Moderator 输出的 TL;DR
  createdAt   DateTime @default(now())
  session     SwarmChatSession @relation(fields: [sessionId], references: [id], onDelete: Cascade)

  @@index([sessionId])
  @@map("swarm_chat_results")
}

为什么需要
	•	把一次「主持人循环」视为 Turn，便于 UI 在工作区展示历史推理链。
	•	后端可按 turnIndex 快速定位、回放或重算。

⸻

2 · OrchestratorState（精简版）

type OrchestratorState = {
  sessionId: string                      // 关联 ChatSession
  turnIndex: number                      // 第几轮主持人循环
  userMessage: string                    // 输入
  confirmedIntent?: string               // 与用户确认后的意图
  tasks?: Task[]                         // 规划结果
  inFlight?: Record<string, Task>        // 正在执行的任务
  results?: Result[]                     // 任务完成结果
  summary?: string                       // TL;DR
  events?: GraphEvent[]                  // 前端可视化时间线
  costUSD?: number                       // Token 成本
};

tasks / results / events 仍使用 Reducer append。

⸻

3 · 核心流程（LangGraph）

UserMsg ─▶ Moderator ─┬─ clarifyIntent? ─▶ prompt user
                      ├─ planTasks ─▶ TaskRouter
                      └─ summarizeResults ─▶ Exit

节点	触发条件	输出
Moderator	任意消息 / Collector 回调	① 需澄清 → Event.ask_user ② 需规划 → tasks ③ 全部完成 → summary
TaskRouter	有 tasks 且存在 PENDING	向 AgentNode-[agentId] 动态派单
AgentNode-X	被路由到	results + events.task_done
Collector	任何 AgentNode 完成	回写 Cost / 触发 Moderator
Exit	summary 存在	将 OrchestratorState ⇒ SwarmChatResult


⸻

4 · 后端接口

Method	Path	说明
POST	/api/chat/:sessionId/dispatch	用户或 UI 发消息— 校验权限— 写 SwarmChatMessage (USER)— 调用 graph.stream()
POST	/api/chat/:sessionId/control	用户动作：{"action":"cancel" | "resume"}— 向 Graph 注入信号，更改 inFlight
GET	/api/chat/:sessionId/stream	SSE：服务器把 GraphEvent 转为事件流：agent_reply / system / ask_user / task_done / summary

取消流程：前端在任务栏点“终止”→ /control cancel → 后端 graph.interrupt() → 在 events 推送 flow_cancelled。

⸻

5 · 前端 - 后端时序

5.1 创建群聊 & 发送首条指令

sequenceDiagram
  participant U as User (UI)
  participant FE as Next.js FE
  participant BE as Dispatch API
  participant G as OrchestratorGraph
  participant DB as Postgres

  U->>FE: 输入「/ask 阅读并总结」
  FE->>BE: POST /dispatch
  BE->>DB: 写 SwarmChatMessage(USER)
  BE->>G: graph.stream({userMessage})
  G-->>BE: SSE ask_user? (需要澄清)
  BE-->>FE: event:ask_user
  FE->>U: Chat 气泡「请问要重点关注哪方面？」

  alt 用户澄清
    U->>FE: 回复「商业模式」
    FE->>BE: POST /dispatch (second)
    BE->>DB: 写 SwarmChatMessage(USER)
    G-->>BE: event:tasks_created
    BE-->>FE: event:task_start (3 并行)
    par 三 Agent 并行
      G-->>BE: event:agent_reply (Researcher)
      BE-->>FE: 同步
      ...
    end
    G-->>BE: event:summary
    BE-->>FE: summary
    BE->>DB: 写 SwarmChatMessage(SYSTEM) + SwarmChatResult(turnIndex=1)
  end

5.2 用户终止流程

sequenceDiagram
  U->>FE: 点击“终止流程”
  FE->>BE: POST /control { cancel }
  BE->>G: graph.interrupt()
  G-->>BE: event:flow_cancelled
  BE-->>FE: SSE flow_cancelled


⸻

6 · 前端交互点

UI 组件	事件	数据源	设计要点
ChatArea	ask_user / agent_reply / summary	SSE	ask_user -> 显示橙色系统气泡 agent_reply -> 普通左气泡 summary -> 固定到顶部“结论卡”
WorkspacePanel	task_start / task_done	SSE	看板列：进行中 / 已完成，节点显示 Agent 头像 + Title
FlowControlBar (新增)	flow_cancelled	SSE	按钮：终止 / 继续，放在 Chat 输入框上方
HistoryDrawer	查询 SwarmChatResult	REST GET /session/:id/results	时间轴展示每个 Turn 的 TL;DR，可回放


⸻

7 · 后端实现要点

7.1 Graph → 数据库 Hook

graph.on("cycleComplete", async ({state}) => {
  await prisma.swarmChatResult.create({
    data: {
      sessionId: state.sessionId,
      turnIndex: state.turnIndex,
      stateBlob : compress(state),     // LZ-UTF8
      summary   : state.summary ?? null
    }
  });
});

7.2 任务 ID 生成

const taskId = nanoid(8);             // 用于 inFlight key

7.3 取消 / 继续

export const interruptGraph = (id: string) => runtime[id]?.interrupt();
export const resumeGraph    = (id: string) => runtime[id]?.resume();


⸻

8 · 可扩展性占位

未来需求	预留位置
性能指标	state.costUSD、nodeLatency 已统计；Future: Prometheus exporter
全链路 Trace	Graph 事件钩子，可直接 otlpExporter.record()
内容安全	beforeSendToLLM(state, prompt) & afterLLMOutput(output) 空实现
Agent 热更新	AgentCatalog 读取优先级：in-memory → Redis Cache → DB，实现 catalog.refresh()


⸻

9 · 文件/模块划分

/src
 ├─ api/
 │   ├─ chat/[sessionId]/dispatch.ts
 │   ├─ chat/[sessionId]/control.ts
 │   └─ chat/[sessionId]/stream.ts
 ├─ orchestrator/
 │   ├─ graphBuilder.ts        // 构建 StateGraph
 │   ├─ nodes/                 // Moderator / TaskRouter / Agents
 │   ├─ types.ts               // OrchestratorState, Task, Result
 │   └─ hooks.ts               // DB persister, cancel/resume
 ├─ catalog/                   // YAML -> JSON
 └─ prisma/
     └─ schema.prisma          // 新增 SwarmChatResult


⸻

10 · 迭代排期（精简）

周次	交付	负责人
W1	SwarmChatResult 表 & Prisma 迁移、Graph 持久化钩子	BE
W1	Frontend SSE Client、ChatArea 显示 system/agent	FE
W2	WorkspacePanel 看板、FlowControlBar 终止按钮	FE
W2	Moderator + TaskRouter + 2 Demo Agents (researcher, summarizer)	BE
W3	End-to-End Demo：澄清 - 并行 - 汇总	全体
W4	代码评审、Edge Case（超时、取消后恢复）	QA


⸻

✅ 交付物
	1.	更新后的 Prisma schema（附 SwarmChatResult）。
	2.	graphBuilder.ts 与 2 个示例 AgentNode。
	3.	API Route + SSE Bridge。
	4.	Figma 原型：ChatArea / WorkspacePanel / FlowControlBar / HistoryDrawer。
	5.	本设计文档（同步 Notion）供 UI 设计 & 开发落地。

⸻

如需讨论 UI 动效或 Graph 细节，请在 comment 中直接标注章节编号，便于迭代。