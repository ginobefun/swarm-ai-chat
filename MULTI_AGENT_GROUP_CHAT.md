# 🚀 多智能体群聊协作平台

## 📋 产品概述

这是一个创新的"智能体即服务"(Agent-as-a-Service)协作平台,用户可以创建群聊,邀请多个专业AI智能体参与脑暴和协作,高效完成从创意构思到方案落地的全过程。

### 🎯 核心价值

- **多角度智慧碰撞**: 同时获得产品经理、技术专家、营销顾问等多个专业视角
- **智能编排**: LangChain 自动决策哪个Agent最适合回应,或由用户@指定
- **预定义专家**: 10+位预配置的专业智能体,每个都有明确的角色和能力
- **灵活协作**: 支持产品设计、旅行规划、营销策划等多种场景

### 🌟 使用场景

| 场景 | 推荐智能体组合 | 典型产出 |
|------|--------------|---------|
| **产品需求讨论** | 产品经理 + UX设计师 + 技术架构师 + 批判性思考者 | 完整PRD文档 |
| **旅行计划制定** | 旅行专家 + 讨论主持人 | 详细行程安排 |
| **营销方案脑暴** | 营销专家 + 文案大师 + 数据科学家 | 营销策略方案 |
| **商业计划评审** | 商业顾问 + 批判性思考者 + 财务分析师 | 商业可行性报告 |

---

## 🏗️ 技术架构

### 核心技术栈

```
Frontend (Next.js 15 + React 19)
├── 智能体库界面 (AgentLibrary)
├── 群聊创建对话框 (CreateGroupChatDialog)
├── 参与者面板 (GroupChatParticipants)
└── 增强聊天界面 (ChatArea with @mention)

Backend (Next.js API Routes + LangChain)
├── /api/group-chat - 多智能体对话API
├── /api/group-chat/manage - 群聊管理API
└── /api/agents - 智能体库API

AI Layer (LangChain.js)
├── MultiAgentOrchestrator - 智能编排器
│   ├── 决策谁应该发言
│   ├── 管理对话上下文
│   └── 处理@提及
└── Agent Registry - 智能体注册表

Database (PostgreSQL + Prisma)
├── SwarmAIAgent - 智能体定义
├── SwarmChatSession - 群聊会话
├── SwarmChatMessage - 聊天消息
└── SwarmChatSessionParticipant - 参与者关系
```

### LangChain 多智能体编排流程

```
用户消息
    ↓
解析@提及
    ↓
    ├─→ [有@] → 直接调用指定Agent
    └─→ [无@] → 智能决策谁应该回应
              ↓
         编排器分析场景
              ↓
         选择最合适的Agent
              ↓
    Agent生成回复 (支持流式输出)
              ↓
         保存到数据库
              ↓
         返回给用户
```

---

## 🤖 预定义智能体库

### 产品和商业类

#### 1. 资深产品经理 (product-manager-pro)
- **角色**: 10年产品经验,需求分析专家
- **擅长**: PRD撰写、用户研究、产品规划
- **模型**: Claude 3.5 Sonnet
- **适用场景**: 产品设计、需求讨论、功能评审

#### 2. 营销策略专家 (marketing-strategist)
- **角色**: 品牌推广和增长黑客
- **擅长**: 营销策略、内容营销、数据分析
- **模型**: Claude 3.5 Sonnet
- **适用场景**: 营销活动策划、品牌建设

### 旅行和生活类

#### 3. 旅行规划专家 (travel-planner-expert)
- **角色**: 环游世界的旅行达人
- **擅长**: 行程设计、景点推荐、预算规划
- **模型**: Gemini Flash 1.5
- **适用场景**: 旅行计划制定、行程优化

### 技术和开发类

#### 4. 全栈架构师 (fullstack-architect)
- **角色**: 资深系统设计专家
- **擅长**: 系统架构、技术选型、性能优化
- **模型**: Claude 3.5 Sonnet
- **适用场景**: 技术方案评审、架构设计

#### 5. 数据科学家 (data-scientist-expert)
- **角色**: 数据分析和机器学习专家
- **擅长**: 数据分析、统计建模、可视化
- **模型**: GPT-4o
- **适用场景**: 数据驱动决策、指标设计

### 创意和内容类

#### 6. 创意文案大师 (creative-writer)
- **角色**: 资深文案撰稿人
- **擅长**: 文案撰写、故事讲述、内容创作
- **模型**: Claude 3.5 Sonnet
- **适用场景**: 文案优化、品牌叙事

### 战略和分析类

#### 7. 批判性思考者 (critical-thinker)
- **角色**: 善于发现问题的质疑者
- **擅长**: 逻辑分析、风险评估、反面论证
- **模型**: Claude 3.5 Sonnet
- **适用场景**: 方案评审、风险识别

#### 8. 商业战略顾问 (business-strategist)
- **角色**: 商业模式设计专家
- **擅长**: 商业战略、竞争分析、价值创造
- **模型**: Claude 3.5 Sonnet
- **适用场景**: 商业模式设计、战略规划

### 设计类

#### 9. UX设计专家 (ux-designer-pro)
- **角色**: 用户体验设计师
- **擅长**: 交互设计、界面设计、可用性
- **模型**: Gemini Flash 1.5
- **适用场景**: 产品体验优化、界面设计

### 通用类

#### 10. 讨论主持人 (general-facilitator)
- **角色**: 会议主持和协调者
- **擅长**: 讨论引导、观点总结、决策推动
- **模型**: Gemini Flash 1.5
- **适用场景**: 引导群聊讨论、总结观点

---

## 🚀 快速开始

### 1. 环境准备

```bash
# 克隆项目
git clone <repository-url>
cd swarm-ai-chat

# 安装依赖
pnpm install

# 配置环境变量
cp .env.example .env
```

### 2. 配置环境变量

在 `.env` 文件中配置以下关键变量:

```env
# OpenRouter API Key (用于调用多个LLM模型)
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# 数据库连接
DATABASE_URL=postgresql://user:password@localhost:5432/swarm_ai_chat

# 认证配置
BETTER_AUTH_SECRET=your-secret-key-here
BETTER_AUTH_URL=http://localhost:3000
```

### 3. 初始化数据库

```bash
# 生成Prisma客户端
pnpm db:generate

# 推送数据库模式
pnpm db:push

# 填充预定义智能体数据
pnpm exec tsx prisma/seed-agents.ts
```

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000` 即可开始使用!

---

## 📖 使用指南

### 创建群聊

1. 点击主界面的 **"创建群聊"** 按钮
2. 输入群聊名称和描述
   - 例如: "2026年日本关西7日游规划"
3. 点击 **"下一步"** 进入智能体选择页面
4. 从智能体库中选择要邀请的专家
   - 可以根据分类筛选 (产品、营销、技术等)
   - 可以搜索智能体名称或描述
5. 点击 **"创建群聊"** 完成

### 与智能体协作

#### 方式1: @特定智能体

在消息中使用 `@智能体名称` 来直接指定回复:

```
@旅行规划专家 请推荐关西地区值得去的城市
```

系统会自动识别@提及,让被提及的智能体回复。

#### 方式2: 开放式问题 (自动编排)

直接发送问题,系统会智能决策最合适的智能体回复:

```
我想规划一次日本关西的7日游,预算大概2万元,有什么建议?
```

编排器会分析场景,自动选择"旅行规划专家"来回应。

#### 方式3: @多个智能体

可以同时@多个智能体,让他们依次回复:

```
@产品经理 @技术架构师 @UX设计师
我们要做一个多智能体聊天产品,请大家从各自的角度给出建议
```

### 管理参与者

在群聊界面右侧的"参与者"面板中:

- 查看所有参与的智能体和用户
- 点击智能体可以查看详细信息
- 群主可以邀请新的智能体或移除现有智能体

---

## 🔧 API 文档

### 群聊对话 API

**POST /api/group-chat**

处理用户消息,智能编排多个Agent回复,支持流式响应。

**请求体**:
```json
{
  "sessionId": "session-uuid",
  "userId": "user-id",
  "userName": "User Name",
  "message": "用户的消息内容",
  "agentIds": ["agent-1", "agent-2"]
}
```

**响应**: Server-Sent Events (SSE) 流

```
data: {"type":"chunk","agentId":"agent-1","agentName":"智能体名称","chunk":"回复片段"}
data: {"type":"complete","agentId":"agent-1","agentName":"智能体名称","content":"完整回复","messageId":"msg-id"}
data: [DONE]
```

### 群聊管理 API

**POST /api/group-chat/manage** - 创建群聊

```json
{
  "title": "群聊名称",
  "description": "群聊描述",
  "userId": "创建者ID",
  "agentIds": ["agent-1", "agent-2"],
  "type": "GROUP"
}
```

**PUT /api/group-chat/manage** - 邀请/移除Agent

```json
{
  "sessionId": "session-uuid",
  "action": "invite",  // 或 "remove"
  "agentIds": ["agent-3", "agent-4"]
}
```

**DELETE /api/group-chat/manage?sessionId=xxx** - 删除群聊

### 智能体库 API

**GET /api/agents** - 获取智能体列表

查询参数:
- `category`: 按分类筛选
- `featured`: 只显示精选 (true/false)
- `search`: 搜索关键词

---

## 🧩 核心代码模块

### 1. LangChain 多智能体编排器

```typescript
// src/lib/langchain/multi-agent-orchestrator.ts

import { MultiAgentOrchestrator } from '@/lib/langchain/multi-agent-orchestrator';

// 创建编排器
const orchestrator = new MultiAgentOrchestrator(apiKey, baseURL);

// 注册智能体
orchestrator.registerAgent({
  id: 'product-manager-pro',
  name: '产品经理',
  role: '资深产品经理',
  systemPrompt: '你是一名资深产品经理...',
  modelPreference: 'anthropic/claude-3.5-sonnet',
});

// 处理用户消息
const responses = await orchestrator.processUserMessage(
  userId,
  userName,
  message,
  (agentId, agentName, chunk) => {
    // 流式回调
    console.log(`[${agentName}]: ${chunk}`);
  }
);
```

### 2. 智能决策逻辑

编排器会根据以下因素决策:

1. **@提及优先**: 如果消息中有@,直接选择被提及的Agent
2. **场景分析**: 分析对话上下文和用户意图
3. **智能体能力匹配**: 匹配最擅长该领域的Agent
4. **对话连贯性**: 考虑之前的对话历史

### 3. 前端组件使用

```typescript
import { CreateGroupChatDialog } from '@/components/group-chat/CreateGroupChatDialog';
import { GroupChatParticipants } from '@/components/group-chat/GroupChatParticipants';
import { AgentLibrary } from '@/components/agents/AgentLibrary';

// 在你的页面中使用
<CreateGroupChatDialog />
<GroupChatParticipants sessionId={id} participants={participants} />
<AgentLibrary onSelectAgent={handleSelect} />
```

---

## 🎨 UI/UX 特性

### 智能体库界面

- **分类导航**: 按产品、营销、技术等分类浏览
- **精选推荐**: 高亮显示精选智能体
- **详细画像**: 显示技能、工具、使用次数等
- **多选支持**: 可同时选择多个智能体

### 群聊界面

- **参与者面板**: 右侧显示所有参与者
- **@提及支持**: 输入@时自动补全智能体名称
- **流式响应**: 实时显示AI回复过程
- **角色标识**: 清晰区分用户和各个智能体的消息

### 消息样式

- **用户消息**: 右侧,蓝色背景
- **智能体消息**: 左侧,带头像和名称
- **系统消息**: 居中,灰色背景

---

## 📊 数据模型

### 核心表结构

```prisma
// 智能体定义
model SwarmAIAgent {
  id              String   @id
  name            String
  avatar          String
  description     String
  specialty       String
  systemPrompt    String
  modelPreference String?
  tags            String[]
  capabilityLevel Int
  rating          Decimal
  usageCount      Int
  isFeatured      Boolean
  // ... 关系和其他字段
}

// 群聊会话
model SwarmChatSession {
  id          String   @id @default(uuid())
  title       String
  description String?
  type        SessionType  // DIRECT | GROUP | WORKFLOW
  status      SessionStatus
  createdById String
  participants SwarmChatSessionParticipant[]
  messages    SwarmChatMessage[]
  // ...
}

// 聊天消息
model SwarmChatMessage {
  id         String   @id @default(uuid())
  sessionId  String
  senderId   String
  senderType MessageSenderType  // USER | AGENT | SYSTEM
  content    String
  contentType MessageContentType
  status     MessageStatus
  // ...
}

// 参与者关系
model SwarmChatSessionParticipant {
  sessionId     String
  participantId String
  participantType ParticipantType  // USER | AGENT
  role          ParticipantRole    // OWNER | MEMBER
  // ...
}
```

---

## 🔐 安全和权限

### 认证

- 使用 `better-auth` 进行用户认证
- 支持邮箱密码登录
- JWT token 管理

### 权限控制

- **群主 (OWNER)**: 可以管理群聊、邀请/移除智能体
- **成员 (MEMBER)**: 可以发送消息、查看历史
- **智能体**: 只能被动响应,不能主动发起

### 数据隔离

- 每个用户只能访问自己创建或参与的群聊
- 消息历史按会话隔离
- API 调用需要有效的认证 token

---

## 🚀 部署指南

### Vercel 部署 (推荐)

```bash
# 1. 安装 Vercel CLI
npm i -g vercel

# 2. 登录
vercel login

# 3. 部署
vercel --prod
```

### 环境变量配置

在 Vercel 项目设置中配置:

```
OPENROUTER_API_KEY=xxx
DATABASE_URL=xxx
BETTER_AUTH_SECRET=xxx
BETTER_AUTH_URL=https://your-domain.vercel.app
```

### 数据库

推荐使用:
- **Supabase** (PostgreSQL)
- **Neon** (Serverless PostgreSQL)
- **Railway** (PostgreSQL)

### 运行种子脚本

在数据库准备好后,运行:

```bash
# 本地
pnpm exec tsx prisma/seed-agents.ts

# 或通过Vercel CLI
vercel exec -- pnpm exec tsx prisma/seed-agents.ts
```

---

## 🔄 后续优化方向

### MVP 后的进阶功能

1. **F4: 自定义智能体**
   - 用户可以通过 UI 创建自己的 Agent
   - 上传知识库文档 (PDF, Markdown)
   - 选择工具和配置 System Prompt

2. **F5: 协作模式**
   - 脑暴模式: 所有 Agent 自由发言
   - 评审模式: Agent 依次评审用户草案
   - 轮询模式: 按顺序让每个 Agent 发言

3. **F6: 任务输出**
   - 一键导出聊天记录为 Markdown
   - 生成结构化文档 (PRD、旅行计划等)
   - PDF 导出和分享

4. **F7: RAG 知识库**
   - 为智能体配置向量数据库
   - 上传领域知识文档
   - 实时检索增强生成

5. **F8: 工具调用**
   - 集成网页搜索
   - 代码执行器
   - 数据可视化
   - 日历查询

6. **F9: 实时协作**
   - WebSocket 实时通信
   - 多用户同时在线
   - 打字状态显示

7. **F10: 分析和洞察**
   - 对话质量评分
   - Agent 贡献度分析
   - 话题趋势分析

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request!

### 开发流程

1. Fork 项目
2. 创建特性分支: `git checkout -b feature/amazing-feature`
3. 提交改动: `git commit -m 'Add some amazing feature'`
4. 推送分支: `git push origin feature/amazing-feature`
5. 提交 Pull Request

### 代码规范

- 使用 TypeScript
- 遵循 ESLint 规则
- 组件使用函数式 + Hooks
- API 返回标准化格式

---

## 📝 更新日志

### v1.0.0 - 2025-01-05

**核心功能**
- ✅ LangChain 多智能体编排器
- ✅ 10+ 预定义专业智能体
- ✅ 群聊创建和管理
- ✅ @提及指定 Agent
- ✅ 智能决策编排
- ✅ 流式响应支持
- ✅ 智能体库界面
- ✅ 参与者管理面板

**技术栈**
- Next.js 15 + React 19
- LangChain.js
- PostgreSQL + Prisma
- OpenRouter API
- TailwindCSS + Radix UI

---

## 📄 许可证

MIT License

---

## 💬 联系方式

- Issue: [GitHub Issues](https://github.com/your-repo/issues)
- Email: your-email@example.com

---

## 🙏 致谢

感谢以下开源项目:

- [Next.js](https://nextjs.org/)
- [LangChain](https://js.langchain.com/)
- [Prisma](https://www.prisma.io/)
- [Vercel AI SDK](https://sdk.vercel.ai/)
- [Radix UI](https://www.radix-ui.com/)

---

**让AI协作变得简单而强大! 🚀**
