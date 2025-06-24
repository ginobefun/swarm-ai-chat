# SwarmAI.chat - AI 协作平台

<div align="center">

![SwarmAI.chat Logo](public/favicon.svg)

**让 AI 从"对话工具"提升为"生产力伙伴"**

[![Next.js](https://img.shields.io/badge/Next.js-15.3.4-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg)](/)

[在线演示](https://swarm-ai-chat.vercel.app) | [产品文档](documents/prd.md) | [任务清单](documents/tasks.md)

</div>

---

## 🌟 项目概述

SwarmAI.chat 是一个 **多智能体 AI 协作平台**，将先进的多智能体（Multi-Agent）协作范式与用户熟悉的即时通讯（IM）交互界面相结合。

### 🎯 解决的问题

传统 AI 应用存在的核心痛点：
- **认知负担重**：用户需自行拆解任务，不断通过提示词工程引导 AI
- **视角单一**：单一 AI 的回答缺乏多角度审视，容易产生片面结论
- **流程割裂**：AI 生成的内容需要用户手动整理，工作流不连贯
- **知识局限**：通用 AI 无法深入理解垂直领域的专业知识

### 💡 产品愿景

成为知识工作者的首选 AI 协同平台，让每个用户都能轻松组建和指挥自己的**虚拟专家团队**，高效、深度地完成复杂任务。

---

## ✨ 核心特性

### 🤖 多智能体协作
- **预置专业角色**：需求分析师、用户研究员、技术评估师、数据分析师等
- **智能@提及系统**：轻松指定特定 AI 角色参与讨论
- **协作模式**：支持流水线协作，AI 间自动任务传递

### 💬 现代化即时通讯
- **熟悉的聊天界面**：类似微信/Slack 的用户体验
- **群聊功能**：多个 AI 角色同时参与对话
- **实时响应**：流式输出，低响应延迟

### 🎨 智能工作区
- **动态摘要**：自动提取对话中的关键结论
- **任务清单**：智能识别并生成待办事项
- **思维导图**：可视化复杂思路和关系
- **文档协作**：支持多种格式导出

### 🌍 多语言与主题
- **国际化支持**：中文/英文无缝切换
- **暗黑模式**：浅色/深色/系统自适应主题
- **响应式设计**：桌面端、平板端、移动端完美适配

---

## 🛠️ 技术栈

### 前端架构
- **框架**：Next.js 15 (App Router)
- **语言**：TypeScript (严格模式)
- **样式**：CSS Modules + CSS 变量系统
- **状态管理**：React Hooks + Context API
- **主题**：next-themes

### 开发工具
- **代码规范**：ESLint + TypeScript Strict
- **构建工具**：Next.js 内置构建系统
- **包管理**：pnpm
- **版本控制**：Git + GitHub

### 部署与优化
- **SEO 优化**：完整 Meta 标签 + Open Graph
- **PWA 支持**：离线访问 + 桌面安装
- **性能优化**：代码分割 + 懒加载

---

## 📁 项目结构

```
swarm-ai-chat/
├── documents/              # 项目文档
│   ├── prd.md             # 产品需求文档
│   └── tasks.md           # 任务清单
├── public/                # 静态资源
│   ├── favicon.svg        # 网站图标
│   ├── manifest.json      # PWA 配置
│   └── ...               # 其他静态文件
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── globals.css   # 全局样式
│   │   ├── layout.tsx    # 根布局
│   │   └── page.tsx      # 主页面
│   ├── components/       # React 组件
│   │   ├── Navbar.tsx    # 顶部导航栏
│   │   ├── Sidebar.tsx   # 左侧聊天列表
│   │   ├── ChatArea.tsx  # 中间对话区
│   │   ├── Workspace.tsx # 右侧工作区
│   │   └── ...          # 其他组件
│   ├── contexts/         # React 上下文
│   │   └── AppContext.tsx # 应用状态管理
│   ├── data/            # 模拟数据
│   │   └── mockData.ts  # 测试数据
│   ├── i18n/            # 国际化
│   │   └── locales.ts   # 多语言文案
│   └── types/           # TypeScript 类型定义
│       └── index.ts     # 接口定义
├── next.config.ts        # Next.js 配置
├── package.json         # 项目依赖
└── tsconfig.json        # TypeScript 配置
```

---

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- pnpm >= 8.0.0

### 安装和运行

```bash
# 克隆项目
git clone https://github.com/ginobefun/swarm-ai-chat.git
cd swarm-ai-chat

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

项目将在 [http://localhost:3000](http://localhost:3000) 启动。

### 环境变量（可选）

创建 `.env.local` 文件配置 AI API：

```env
# OpenAI API 配置
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_URL=https://api.openai.com/v1

# Claude API 配置  
ANTHROPIC_API_KEY=your_anthropic_api_key

# Gemini API 配置
GOOGLE_API_KEY=your_google_api_key
```

---

## 📋 开发指南

### 代码规范

- **TypeScript**：使用严格模式，所有类型必须明确定义
- **组件**：采用 React Hooks 模式，禁用 Class 组件
- **样式**：使用 CSS 变量支持主题切换
- **命名**：使用描述性变量名，避免简短模糊名称

### 提交规范

```bash
feat: 新功能
fix: 问题修复  
docs: 文档更新
style: 样式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

### 分支策略

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `hotfix/*` - 紧急修复分支

---

## 🎯 开发路线图

### ✅ Alpha 版本 (当前)
- [x] 完整 UI 界面实现
- [x] 基础聊天功能
- [x] @提及系统
- [x] 主题切换和国际化
- [x] 响应式设计

### 🚧 Beta 版本 (4 周内)
- [ ] 真实 AI API 对接
- [ ] 完整会话管理
- [ ] 基础协同工作流
- [ ] Markdown 渲染

### 🎯 V1.0 版本 (8 周内)
- [ ] 用户认证系统
- [ ] 数据持久化
- [ ] 性能优化
- [ ] 安全性保障

### 🌟 V1.1 版本 (12 周内)
- [ ] 高级工作区模块
- [ ] 思维导图可视化
- [ ] 移动端应用

---

## 🤝 贡献指南

我们欢迎任何形式的贡献！

### 如何贡献

1. **Fork** 项目到你的 GitHub
2. **创建** 功能分支 (`git checkout -b feature/AmazingFeature`)
3. **提交** 你的更改 (`git commit -m 'feat: add some AmazingFeature'`)
4. **推送** 到分支 (`git push origin feature/AmazingFeature`)
5. **创建** Pull Request

### 贡献类型

- 🐛 **Bug 修复**：发现并修复问题
- ✨ **新功能**：开发新的功能特性
- 📝 **文档**：改进文档说明
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

### 产品指标
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

- 🎨 设计灵感来自现代化的协作工具
- 🤖 AI 技术基于 OpenAI、Anthropic、Google 等先进模型
- 💻 前端技术基于 Next.js、React 等开源框架

---

## 📞 联系我们

- **项目主页**：[GitHub Repository](https://github.com/ginobefun/swarm-ai-chat)
- **问题反馈**：[Issues](https://github.com/ginobefun/swarm-ai-chat/issues)
- **功能建议**：[Discussions](https://github.com/ginobefun/swarm-ai-chat/discussions)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个 Star！⭐**

Made with ❤️ by the SwarmAI.chat Team

</div>
