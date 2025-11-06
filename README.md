# SwarmAI.chat - AI 多智能体协作平台

<div align="center">

![SwarmAI.chat Logo](public/favicon.svg)

**让 AI 从"对话工具"提升为"生产力伙伴"**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-6.10.1-2D3748)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[在线演示](https://swarm-ai-chat.vercel.app) | [快速开始](#-快速开始) | [产品文档](docs/product/prd.md) | [技术文档](docs/technical/tech-stack.md)

</div>

---

## 🌟 项目概述

SwarmAI.chat 是一个创新的 **多智能体 AI 协作平台**，将先进的多智能体（Multi-Agent）协作范式与用户熟悉的即时通讯（IM）交互界面相结合，旨在让每个用户都能轻松组建和指挥自己的虚拟专家团队。

### 🎯 解决的痛点

传统单一 AI 对话的核心问题：
- **认知负担重**：用户需自行拆解复杂任务，不断通过提示词工程引导 AI
- **视角单一**：缺乏多角度审视，容易产生片面或错误结论
- **流程割裂**：AI 生成的零散内容需要用户手动整理成结构化文档
- **知识局限**：通用 AI 无法深入理解用户私有或垂直领域知识

### 💡 产品愿景

成为知识工作者的首选 AI 协同平台，将 AI 从"对话工具"提升为"生产力伙伴"，高效、深度地完成复杂知识工作任务。

---

## ✨ 核心特性

### 🤖 多智能体协作系统
- **预置专业角色**：文章摘要师、批判性思考者、创意大师、技术评估师等 10+ 专业 AI 角色
- **智能@提及系统**：类似 Slack，轻松指定特定 AI 角色参与讨论
- **流水线协作**：AI 之间自动传递任务，形成协作工作流

### 💬 现代化即时通讯界面
- **熟悉的聊天体验**：类似微信/Slack 的用户界面
- **群聊功能**：多个 AI 角色同时参与对话
- **实时流式响应**：支持 AI 流式输出，低响应延迟
- **Markdown 渲染**：支持富文本格式展示

### 🎨 智能工作区
- **动态摘要**：自动提取对话中的关键结论和要点
- **任务清单**：智能识别并生成可勾选的待办事项
- **思维导图**：可视化复杂思路和关系（规划中）
- **多格式导出**：支持 PDF、Word、Markdown 等格式

### 🌍 多语言与主题
- **国际化支持**：中文/英文无缝切换
- **自适应主题**：浅色/深色/系统自动主题
- **响应式设计**：完美适配桌面、平板、移动端

---

## 🛠️ 技术栈

### 🌐 核心框架
- **前端**：Next.js 15 (App Router) + TypeScript
- **样式**：TailwindCSS 4 + CSS 变量系统
- **状态管理**：React Hooks + Context API
- **主题**：next-themes

### 🤖 AI 集成
- **统一接口**：Vercel AI SDK (`ai` 包)
- **多模型支持**：OpenAI GPT-4, Anthropic Claude, Google Gemini
- **智能体框架**：LangChain.js
- **流式响应**：原生支持流式 AI 输出

### 🗄️ 数据持久化
- **数据库**：PostgreSQL (Neon 托管)
- **ORM**：Prisma 6.10.1
- **连接**：@neondatabase/serverless

### 🔐 用户认证
- **认证框架**：better-auth
- **OAuth 支持**：社交登录集成
- **安全**：加密存储和传输

### 🚀 部署优化
- **平台**：Vercel (原生集成)
- **CDN**：全球边缘节点
- **SEO**：完整 Meta 标签 + 结构化数据
- **PWA**：离线访问支持

---

## 📚 文档导航

本项目文档按类别组织，便于查找和维护：

### 📋 产品文档
- **[产品需求文档 (PRD)](docs/product/prd.md)** - 完整的产品需求和规划
- **[多智能体群聊功能](docs/product/multi-agent-group-chat.md)** - 群聊协作功能设计

### 💻 技术文档
- **[技术栈说明](docs/technical/tech-stack.md)** - 技术选型和架构说明
- **[架构 v2.0](docs/technical/architecture-v2.md)** - LangChain 多智能体编排架构
- **[Artifact 系统设计](docs/technical/artifact-system-design.md)** - Artifact 功能技术设计
- **[架构重新设计](docs/technical/swarm-architecture-redesign.md)** - Better Auth 集成架构
- **[类型管理指南](docs/technical/type-management-guidelines.md)** - TypeScript 类型规范
- **[模型更新指南](docs/technical/model-update-guide.md)** - AI 模型配置和更新

### 🎨 设计规范
- **[设计指南](docs/design/design-guidelines.md)** - UI/UX 设计基本原则
- **[设计标记系统](docs/design/design-tokens.md)** - 设计系统变量和标准
- **[图标使用指南](docs/design/icon-usage-guide.md)** - 图标系统规范
- **[排版系统](docs/design/typography-system.md)** - 字体排版规范

### 🔧 开发文档
- **[测试指南](docs/development/TESTING_GUIDE.md)** - 完整的测试计划和方法
- **[项目状态](docs/development/PROJECT_STATUS.md)** - 当前项目完成度和状态
- **[任务清单](docs/development/tasks.md)** - 开发任务和进度跟踪

### 📦 历史文档归档
项目开发过程中的阶段性总结和历史记录保存在 [docs/archive/](docs/archive/) 目录中，包括各个阶段的完成总结、实施报告和代码审查记录。

---

## 📁 项目结构

```
swarm-ai-chat/
├── docs/                       # 📚 项目文档
│   ├── product/               # 产品设计文档
│   ├── technical/             # 技术文档
│   ├── design/                # 设计规范文档
│   ├── development/           # 开发文档
│   └── archive/               # 历史文档归档
├── prisma/                    # 数据库相关
│   ├── schema.prisma          # 数据库模式
│   └── seed.ts                # 种子数据
├── public/                    # 静态资源
│   ├── favicon.svg            # 网站图标
│   ├── manifest.json          # PWA 配置
│   └── ...                    # 其他静态文件
├── src/                       # 源代码
│   ├── app/                   # Next.js App Router
│   │   ├── api/               # API 路由
│   │   │   ├── agents/        # AI 智能体 API
│   │   │   ├── sessions/      # 会话管理 API
│   │   │   └── admin/         # 管理员 API
│   │   ├── admin/             # 管理页面
│   │   ├── globals.css        # 全局样式
│   │   ├── layout.tsx         # 根布局
│   │   └── page.tsx           # 主页面
│   ├── components/            # React 组件
│   │   ├── chat/              # 聊天相关组件
│   │   │   ├── ChatArea.tsx   # 对话区域
│   │   │   ├── MessageList.tsx # 消息列表
│   │   │   └── MessageInput.tsx # 消息输入
│   │   ├── session/           # 会话管理组件
│   │   │   ├── SessionList.tsx # 会话列表
│   │   │   ├── SessionItem.tsx # 会话项
│   │   │   └── ...            # 其他会话组件
│   │   ├── workspace/         # 工作区组件
│   │   │   └── WorkspacePanel.tsx
│   │   ├── AgentDetail.tsx    # AI 角色详情
│   │   ├── AgentDiscovery.tsx # AI 角色发现
│   │   ├── Navbar.tsx         # 顶部导航
│   │   ├── ThemeToggle.tsx    # 主题切换
│   │   └── LanguageToggle.tsx # 语言切换
│   ├── lib/                   # 核心库
│   │   ├── ai/                # AI 相关工具
│   │   ├── agents/            # 智能体定义
│   │   ├── auth/              # 认证相关
│   │   └── database/          # 数据库操作
│   ├── hooks/                 # 自定义 Hooks
│   │   └── useSessionManager.ts
│   ├── contexts/              # React 上下文
│   │   └── AppContext.tsx
│   ├── constants/             # 常量定义
│   │   └── agents.ts          # AI 角色配置
│   ├── utils/                 # 工具函数
│   ├── i18n/                  # 国际化
│   │   └── locales.ts
│   └── types/                 # TypeScript 类型
│       └── index.ts
├── scripts/                   # 构建脚本
│   └── setup-local-db.sh      # 本地数据库设置
├── package.json               # 依赖配置
├── next.config.ts             # Next.js 配置
├── tailwind.config.js         # TailwindCSS 配置
└── tsconfig.json              # TypeScript 配置
```

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0
- PostgreSQL 数据库（推荐使用 Neon）

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/ginobefun/swarm-ai-chat.git
cd swarm-ai-chat

# 安装依赖
pnpm install

# 设置环境变量
cp .env.example .env.local
# 编辑 .env.local 配置必要的环境变量

# 初始化数据库
pnpm db:push
pnpm db:seed

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

项目将在 [http://localhost:3000](http://localhost:3000) 启动。

### 环境变量配置

创建 `.env.local` 文件：

```env
# 数据库配置
DATABASE_URL="postgresql://username:password@host:port/database"

# OpenAI API 配置
OPENAI_API_KEY="your_openai_api_key"
OPENAI_API_URL="https://api.openai.com/v1"

# Anthropic Claude API 配置  
ANTHROPIC_API_KEY="your_anthropic_api_key"

# Google Gemini API 配置
GOOGLE_API_KEY="your_google_api_key"

# 认证配置
BETTER_AUTH_SECRET="your_auth_secret"
BETTER_AUTH_URL="http://localhost:3000"

# 可选：其他配置
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 数据库设置

```bash
# 生成 Prisma 客户端
pnpm db:generate

# 推送数据库模式
pnpm db:push

# 运行数据库迁移
pnpm db:migrate

# 填充种子数据
pnpm db:seed

# 打开数据库管理界面
pnpm db:studio
```

---

## 📋 开发指南

### 代码规范

- **TypeScript**：严格模式，所有类型必须明确定义
- **组件**：React Hooks 模式，避免 Class 组件
- **样式**：TailwindCSS + CSS 变量，支持主题切换
- **命名**：描述性变量名，遵循 camelCase 约定

### 提交规范

```bash
feat: 新功能开发
fix: 问题修复  
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具变动
```

### 分支策略

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

---

## 🎯 开发路线图

### ✅ Alpha 版本 (已完成)
- [x] 完整 UI 界面实现
- [x] 基础聊天功能和 @提及系统
- [x] 主题切换和国际化支持
- [x] 响应式设计和 PWA 基础
- [x] Prisma 数据库集成

### 🚧 Beta 版本 (开发中 - 4 周内)
- [ ] 真实 AI API 对接 (OpenAI, Claude, Gemini)
- [ ] 完整会话管理系统
- [ ] 基础多智能体协作工作流
- [ ] 用户认证和数据持久化

### 🎯 V1.0 版本 (8 周内)
- [ ] 智能工作区增强功能
- [ ] 性能优化和安全性保障
- [ ] 流水线协作模式
- [ ] 文件上传和处理功能

### 🌟 V1.1 版本 (12 周内)
- [ ] 高级工作区模块 (思维导图、流程图)
- [ ] 自定义 AI 角色功能
- [ ] 企业知识库集成
- [ ] 移动端原生应用

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详细信息。

### 贡献类型

- 🐛 **Bug 修复**：发现并修复问题
- ✨ **新功能**：开发新的功能特性
- 📝 **文档**：改进文档和说明
- 🎨 **UI/UX**：优化用户界面和体验
- ⚡ **性能**：提升应用性能
- 🧪 **测试**：增加测试覆盖率

---

## 📊 项目指标

### 技术指标
- 页面加载时间 < 3 秒
- AI 响应延迟 < 2 秒 (P95)
- 核心服务可用性 > 99.9%
- 代码测试覆盖率 > 80%

### 产品指标 (V1.0 目标)
- 用户次周留存率 ≥ 40%
- 群聊创建率 ≥ 50%
- 用户满意度 NPS ≥ +20
- 5 分钟内完成首次群聊创建

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源协议。

---

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户！

- 🎨 设计灵感来自现代化协作工具
- 🤖 AI 技术基于 OpenAI、Anthropic、Google 等先进模型
- 💻 技术栈基于 Next.js、React、Prisma 等优秀开源项目

---

## 📞 联系方式

- **项目主页**：[GitHub Repository](https://github.com/ginobefun/swarm-ai-chat)
- **问题反馈**：[Issues](https://github.com/ginobefun/swarm-ai-chat/issues)
- **功能建议**：[Discussions](https://github.com/ginobefun/swarm-ai-chat/discussions)
- **技术文档**：[Wiki](https://github.com/ginobefun/swarm-ai-chat/wiki)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！⭐**

Made with ❤️ by the SwarmAI.chat Team

</div>

---

## 💬 聊天功能使用指南

### 🚀 快速开始

基础聊天功能已实现！按照以下步骤即可开始与 AI 智能体对话：

#### 1. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑 .env.local，添加 OpenRouter API 密钥
OPENROUTER_API_KEY="sk-or-v1-your-api-key-here"
DATABASE_URL="your-database-url"
BETTER_AUTH_SECRET="your-secret-key"
```

#### 2. 获取 OpenRouter API 密钥
1. 访问 [OpenRouter.ai](https://openrouter.ai/)
2. 注册账户并获取 API 密钥
3. 将密钥添加到 `.env.local` 文件

#### 3. 启动应用
```bash
pnpm install
pnpm db:generate
pnpm db:push
pnpm dev
```

#### 4. 开始聊天
1. 打开 http://localhost:3000
2. 创建或选择聊天会话
3. 在输入框输入问题
4. 享受与 AI 的实时对话！

### ✨ 功能特色

- **🤖 多智能体支持** - Gemini Flash、文章摘要师、批判性思考者等
- **⚡ 流式响应** - 实时显示 AI 回复过程
- **💾 消息持久化** - 所有对话自动保存
- **🎨 精美界面** - 响应式设计，支持暗黑模式
- **📝 Markdown 支持** - AI 回复支持格式化文本

---
