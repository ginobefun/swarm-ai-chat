# 🚀 多智能体群聊 - 快速开始

## 概述

本项目实现了一个完整的多智能体群聊协作平台,核心功能包括:

✅ **LangChain 多智能体编排**: 智能决策哪个Agent应该回应
✅ **10+ 预定义专业智能体**: 产品经理、技术专家、旅行规划师等
✅ **@提及功能**: 直接指定特定智能体回复
✅ **流式响应**: 实时显示AI生成过程
✅ **群聊管理**: 创建群聊、邀请/移除智能体

---

## 📦 已实现的核心文件

### 后端核心

| 文件 | 说明 |
|------|------|
| `src/lib/langchain/multi-agent-orchestrator.ts` | 🧠 多智能体编排器核心逻辑 |
| `src/app/api/group-chat/route.ts` | 💬 群聊对话API (支持流式) |
| `src/app/api/group-chat/manage/route.ts` | ⚙️ 群聊管理API (创建/编辑/删除) |
| `prisma/seed-agents.ts` | 🤖 预定义智能体种子数据 |

### 前端组件

| 文件 | 说明 |
|------|------|
| `src/components/agents/AgentLibrary.tsx` | 📚 智能体库界面 |
| `src/components/group-chat/CreateGroupChatDialog.tsx` | ➕ 创建群聊对话框 |
| `src/components/group-chat/GroupChatParticipants.tsx` | 👥 参与者管理面板 |
| `src/components/ui/label.tsx` | 🏷️ Label 组件 |
| `src/components/ui/textarea.tsx` | 📝 Textarea 组件 |

### 文档

| 文件 | 说明 |
|------|------|
| `MULTI_AGENT_GROUP_CHAT.md` | 📖 完整产品和技术文档 |
| `QUICKSTART.md` | ⚡ 本快速开始指南 |

---

## 🔧 安装步骤

### 1. 安装依赖

```bash
pnpm install
```

已安装的新依赖:
- `langchain` - LangChain 核心库
- `@langchain/core` - LangChain 基础包
- `@langchain/openai` - OpenAI/OpenRouter 集成
- `@langchain/community` - 社区工具
- `@radix-ui/react-label` - UI 组件

### 2. 配置环境变量

确保 `.env` 文件包含:

```env
# OpenRouter API (用于多模型调用)
OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# 数据库
DATABASE_URL=postgresql://user:password@localhost:5432/swarm_ai_chat

# 认证
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

### 3. 初始化数据库

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库模式
pnpm db:push

# 填充智能体数据
pnpm exec tsx prisma/seed-agents.ts
```

**注意**: 如果遇到 Prisma 引擎下载问题,可以:
1. 设置环境变量: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1`
2. 或手动下载 Prisma 引擎到本地

### 4. 启动开发服务器

```bash
pnpm dev
```

访问 `http://localhost:3000`

---

## 🎯 使用示例

### 场景1: 产品需求讨论

1. 点击 **"创建群聊"**
2. 输入: "新功能PRD讨论"
3. 选择智能体:
   - ✅ 资深产品经理
   - ✅ UX设计专家
   - ✅ 全栈架构师
   - ✅ 批判性思考者
4. 发送消息: "我们要做一个AI助手,请大家给出建议"
5. 系统会自动编排,或使用 `@产品经理` 指定回复

### 场景2: 旅行规划

1. 创建群聊: "2026日本关西7日游"
2. 选择: 旅行规划专家、讨论主持人
3. 发送: "预算2万元,想去大阪、京都、奈良"
4. 旅行专家会给出详细的行程建议

---

## 📚 核心 API 使用

### 创建群聊

```typescript
POST /api/group-chat/manage

{
  "title": "群聊名称",
  "description": "群聊描述",
  "userId": "user-id",
  "agentIds": ["product-manager-pro", "ux-designer-pro"],
  "type": "GROUP"
}
```

### 发送消息

```typescript
POST /api/group-chat

{
  "sessionId": "session-uuid",
  "userId": "user-id",
  "userName": "User Name",
  "message": "@产品经理 请评估这个功能"
}

// 返回 SSE 流
data: {"type":"chunk","agentId":"product-manager-pro","chunk":"这是一个..."}
data: {"type":"complete","content":"完整回复"}
data: [DONE]
```

---

## 🤖 可用的智能体

| ID | 名称 | 擅长领域 | 模型 |
|----|------|---------|------|
| `product-manager-pro` | 资深产品经理 | 需求分析、PRD撰写 | Claude 3.5 Sonnet |
| `marketing-strategist` | 营销策略专家 | 品牌推广、增长黑客 | Claude 3.5 Sonnet |
| `travel-planner-expert` | 旅行规划专家 | 行程设计、景点推荐 | Gemini Flash 1.5 |
| `fullstack-architect` | 全栈架构师 | 系统架构、技术选型 | Claude 3.5 Sonnet |
| `data-scientist-expert` | 数据科学家 | 数据分析、机器学习 | GPT-4o |
| `creative-writer` | 创意文案大师 | 文案撰写、故事讲述 | Claude 3.5 Sonnet |
| `critical-thinker` | 批判性思考者 | 逻辑分析、风险评估 | Claude 3.5 Sonnet |
| `business-strategist` | 商业战略顾问 | 商业模式、战略规划 | Claude 3.5 Sonnet |
| `ux-designer-pro` | UX设计专家 | 用户体验、交互设计 | Gemini Flash 1.5 |
| `general-facilitator` | 讨论主持人 | 引导讨论、总结观点 | Gemini Flash 1.5 |

---

## 🔍 技术架构亮点

### 1. LangChain 智能编排

```typescript
// 自动决策谁应该发言
const decision = await orchestrator.decideNextSpeaker(message, mentions);

// 生成回复 (支持流式)
const response = await orchestrator.generateAgentResponse(
  agentId,
  message,
  (chunk) => console.log(chunk)  // 流式回调
);
```

### 2. @提及解析

系统会自动解析消息中的 `@智能体名称`,支持:
- 完全匹配: `@资深产品经理`
- 模糊匹配: `@产品` (匹配 "资深产品经理")
- 多个提及: `@产品经理 @技术架构师`

### 3. 对话上下文管理

- 自动保存最近 20 条消息作为上下文
- 每个 Agent 有独立的 System Prompt
- 支持长期记忆 (通过数据库)

---

## 🐛 故障排除

### Prisma 引擎下载失败

```bash
# 设置环境变量
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

# 或使用镜像
export PRISMA_BINARIES_MIRROR=https://registry.npmmirror.com/-/binary/prisma
```

### OpenRouter API 限流

如果遇到 429 错误,可以:
1. 升级 OpenRouter 套餐
2. 增加请求间隔
3. 使用不同的模型降低成本

### 智能体回复慢

- 使用更快的模型 (如 Gemini Flash)
- 减少 System Prompt 长度
- 限制对话历史条数

---

## 📖 更多文档

详细文档请查看:
- **完整文档**: [MULTI_AGENT_GROUP_CHAT.md](./MULTI_AGENT_GROUP_CHAT.md)
- **PRD**: 见文档中的产品需求章节
- **API 文档**: 见文档中的 API 章节

---

## ✅ 下一步

实现完成后,你可以:

1. **测试基础功能**
   - 创建群聊
   - 邀请智能体
   - 发送消息测试 @提及
   - 观察自动编排

2. **扩展智能体库**
   - 在 `prisma/seed-agents.ts` 中添加新智能体
   - 定义不同的角色和专长

3. **优化用户体验**
   - 添加 @输入时的自动补全
   - 实现消息编辑和删除
   - 添加表情反应

4. **进阶功能**
   - RAG 知识库集成
   - 工具调用 (搜索、代码执行)
   - 实时 WebSocket 通信
   - 对话导出为文档

---

**祝你使用愉快! 🎉**

如有问题,请查看 [MULTI_AGENT_GROUP_CHAT.md](./MULTI_AGENT_GROUP_CHAT.md) 或提交 Issue。
