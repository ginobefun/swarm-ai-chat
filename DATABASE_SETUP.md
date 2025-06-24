# Neon 数据库集成指南

## 🎯 概览

这份指南将帮助您将 SwarmAI.chat 项目与 Vercel 上的 Neon PostgreSQL 数据库集成。

## 📋 前置要求

1. ✅ 已在 Vercel 创建项目
2. ✅ 已创建 Neon 数据库账户
3. ✅ 已获取数据库连接字符串

## 🚀 集成步骤

### 步骤 1：获取 Neon 数据库连接字符串

1. 登录您的 [Neon 控制台](https://console.neon.tech/)
2. 选择您的项目
3. 进入 "Settings" → "Connection Details" 
4. 复制 "Connection string" 
   - 格式类似：`postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/dbname?sslmode=require`

### 步骤 2：在 Vercel 中设置环境变量

#### 方法 A：通过 Vercel 控制台

1. 打开 [Vercel 控制台](https://vercel.com/dashboard)
2. 进入您的 `swarm-ai-chat` 项目
3. 点击 "Settings" → "Environment Variables"
4. 添加新的环境变量：
   - **Name**: `DATABASE_URL`
   - **Value**: 您的 Neon 数据库连接字符串
   - **Environment**: 选择 Production, Preview, Development（全选）
5. 点击 "Save"

#### 方法 B：通过 Vercel CLI

```bash
# 如果还没有安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 进入项目目录并关联项目
vercel link

# 添加环境变量
vercel env add DATABASE_URL
# 粘贴您的数据库连接字符串
```

### 步骤 3：本地开发环境设置

1. 在项目根目录创建 `.env.local` 文件：
```bash
touch .env.local
```

2. 编辑 `.env.local` 文件，添加：
```env
DATABASE_URL="您的_Neon_数据库连接字符串"
```

**⚠️ 重要**: `.env.local` 文件不会提交到 Git，确保敏感信息安全。

### 步骤 4：初始化数据库

1. 启动开发服务器：
```bash
pnpm dev
```

2. 访问数据库管理页面：
```
http://localhost:3000/admin/database
```

3. 按顺序点击以下按钮：
   - **"完整设置（创建 + 导入）"** - 一键完成所有设置
   - 或者分别点击：
     - **"创建表结构"** - 创建数据库表
     - **"导入初始数据"** - 导入 12 个 AI 角色数据

4. 确认数据导入成功：
   - 查看"数据统计"部分
   - 应该显示：AI 角色：12, 技能标签：18, 工具：8 等

### 步骤 5：重新部署到 Vercel

```bash
# 提交更改
git add .
git commit -m "feat: integrate Neon database"

# 推送到 GitHub（将自动触发 Vercel 部署）
git push origin main
```

### 步骤 6：验证线上环境

1. 等待 Vercel 部署完成
2. 访问线上的数据库管理页面：
```
https://your-project.vercel.app/admin/database
```

3. 点击 **"刷新状态"** 确认数据库连接正常
4. 如果是首次部署，点击 **"完整设置（创建 + 导入）"**

## 🔧 API 端点

项目现在提供以下 API 端点：

### 数据库管理 API
- `GET /api/admin/database?action=status` - 获取数据库状态
- `POST /api/admin/database` - 数据库操作
  - `{ "action": "migrate" }` - 创建表结构
  - `{ "action": "seed" }` - 导入数据
  - `{ "action": "setup" }` - 完整设置

### AI 角色 API
- `GET /api/agents` - 获取所有 AI 角色
- `GET /api/agents?q=搜索关键词` - 搜索 AI 角色

## 🏗️ 数据库结构

数据库包含以下主要表：

- `ai_agents` - AI 角色信息
- `skill_tags` - 技能标签
- `tools` - 工具定义
- `usage_examples` - 使用示例
- `agent_skills` - 角色与技能关联
- `agent_tools` - 角色与工具关联
- `users` - 用户表（为未来功能预留）
- `sessions` - 会话表（为未来功能预留）
- `messages` - 消息表（为未来功能预留）

## 🔍 数据验证

集成完成后，您的数据库应该包含：

- **12 个专业 AI 角色**：需求分析师、用户研究员、技术评估师等
- **18 个技能标签**：分为核心能力、工具能力、领域专长三类
- **8 个工具**：Excel 分析、Python 脚本、Figma 设计等
- **36+ 个使用示例**：每个角色 3 个使用示例

## 🐛 故障排除

### 数据库连接失败
1. 确认 `DATABASE_URL` 环境变量正确设置
2. 检查 Neon 数据库是否处于活跃状态
3. 验证连接字符串格式是否正确

### 构建失败
1. 确保所有环境变量都已设置
2. 检查 Vercel 部署日志
3. 尝试本地构建：`pnpm run build`

### 数据导入失败
1. 检查数据库权限
2. 确认网络连接正常
3. 查看控制台错误日志

## 📚 下一步

数据库集成完成后，您可以：

1. **更新前端组件**：让 AgentDiscovery 和相关组件从数据库获取数据
2. **添加用户认证**：集成 NextAuth.js
3. **实现聊天功能**：将聊天记录保存到数据库
4. **添加管理功能**：创建、编辑、删除 AI 角色

## 🆘 需要帮助？

如果遇到任何问题，请检查：
1. Vercel 项目的环境变量设置
2. Neon 数据库的连接状态
3. 本地 `.env.local` 文件配置

---

**恭喜！🎉 您已成功将 SwarmAI.chat 与 Neon 数据库集成！** 