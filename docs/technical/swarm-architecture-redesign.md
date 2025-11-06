# SwarmAI 概念模型重新设计完成报告

## 📋 项目概述

本文档记录了 SwarmAI.chat 项目的概念模型重新设计过程，实现了 Better Auth 标准表和 Swarm 业务逻辑表的完全分离，建立了清晰的架构边界和命名空间。

## 🎯 设计原则

### 1. 分离关注点
- **Better Auth 表**：使用官方 CLI 工具生成，保持与库的完全一致性
- **Swarm 业务表**：使用统一的"Swarm"前缀，形成独立的业务命名空间

### 2. 清晰的架构边界
- 认证层：Better Auth 负责用户身份验证、会话管理
- 业务层：Swarm 模型负责智能体、对话、技能等业务逻辑
- 通过外键关联而非字段混合的方式连接两层

### 3. 向前兼容
- 保持前端接口不变，通过类型别名实现平滑迁移
- 维护现有的 API 契约和数据流

### 4. 标准化认证模型 ⭐ **重要改进**
- 使用 `npx @better-auth/cli generate` 自动生成认证模型
- 确保与 Better Auth 库版本的完全一致性
- 避免手动维护带来的兼容性问题

## 🗃️ 新架构设计

### Better Auth 标准表（CLI 生成） ⭐ **新方法**

```bash
# 使用官方 CLI 生成
npx @better-auth/cli generate -y
```

生成的标准模型：
```typescript
// 自动生成的用户身份表
model User {
  id            String    @id
  name          String?
  email         String
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  sessions      Session[]
  accounts      Account[]
  swarmUser     SwarmUser?  // 关联业务扩展
}

// 自动生成的账户关联表
model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  accessToken           String?
  refreshToken          String?
  // ... 其他 OAuth 字段
}

// 自动生成的会话管理表
model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  userId    String
  // ... 其他会话字段
}

// 自动生成的验证码表
model Verification {
  id         String   @id
  identifier String
  value      String
  expiresAt  DateTime
  // ... 其他验证字段
}
```

### Swarm 业务模型（使用 Swarm 前缀）

```typescript
// 1. 用户扩展信息
model SwarmUser {
  id                 String             @id @default(uuid())
  userId             String             @unique // 关联 Better Auth User
  username           String?            @unique
  role               SwarmRole          @default(USER)
  subscriptionStatus SubscriptionStatus @default(FREE)
  preferences        Json               @default("{}")
  
  // 关联到 Better Auth User
  user User @relation(fields: [userId], references: [id])
}

// 2. 技能标签系统
model SwarmSkillTag {
  id          String              @id
  name        String
  category    SwarmSkillCategory
  color       String
  description String?
}

// 3. 工具系统
model SwarmTool {
  id                  String  @id
  name                String
  description         String?
  category            String
  configurationSchema Json    @default("{}")
  requiresAuth        Boolean @default(false)
}

// 4. 智能体核心
model SwarmAIAgent {
  id               String  @id
  name             String
  description      String?
  specialty        String?
  personality      String?
  systemPrompt     String?
  modelPreference  String  @default("gpt-4")
  isActive         Boolean @default(true)
  isPublic         Boolean @default(true)
  createdById      String? // 关联 SwarmUser
}

// 5. 智能体能力关联
model SwarmAIAgentSkill {
  agentId          String
  skillId          String
  isPrimary        Boolean @default(false)
  proficiencyLevel Int     @default(3)
}

model SwarmAIAgentTool {
  agentId      String
  toolId       String
  isPrimary    Boolean @default(false)
  customConfig Json    @default("{}")
  isEnabled    Boolean @default(true)
}

// 6. 使用示例
model SwarmAIAgentUsageExample {
  agentId         String
  title           String
  prompt          String
  description     String?
  expectedOutput  String?
  difficultyLevel Int     @default(1)
}

// 7. 对话系统
model SwarmChatSession {
  id             String             @id @default(uuid())
  title          String?
  type           SwarmSessionType   @default(DIRECT)
  status         SwarmSessionStatus @default(ACTIVE)
  createdById    String            // 关联 SwarmUser
  primaryAgentId String?           // 关联 SwarmAIAgent
  configuration  Json              @default("{}")
  messageCount   Int               @default(0)
  totalCost      Decimal           @default(0)
}

model SwarmChatSessionParticipant {
  sessionId String                 // 关联 SwarmChatSession
  userId    String?                // 关联 SwarmUser
  agentId   String?                // 关联 SwarmAIAgent
  role      SwarmParticipantRole   @default(PARTICIPANT)
  isActive  Boolean                @default(true)
}

model SwarmChatMessage {
  id              String             @id @default(uuid())
  sessionId       String             // 关联 SwarmChatSession
  senderType      SwarmSenderType
  senderId        String
  content         String
  contentType     SwarmContentType   @default(TEXT)
  status          SwarmMessageStatus @default(SENT)
  tokenCount      Int                @default(0)
  processingTime  Int                @default(0)
  cost            Decimal            @default(0)
}
```

## 🔄 迁移过程

### 1. Schema 重构 ⭐ **更新流程**
- 从 schema.prisma 中移除手动定义的 Better Auth 模型
- 使用 `npx @better-auth/cli generate` 生成标准模型
- 保留所有 Swarm 业务模型，添加正确的关联关系

### 2. 类型系统更新
- 更新 `src/types/api.ts` 中的类型定义
- 修复 `src/types/index.ts` 中的枚举导入
- 通过类型别名保持向前兼容性

### 3. 数据库操作层更新
- 更新 `src/lib/database/sessions-prisma.ts` 中的模型引用
- 修改所有 Prisma 查询使用新的表名
- 保持 API 接口不变

### 4. 数据迁移
- 成功推送新 schema 到数据库
- 解决了类型匹配和外键约束问题
- Better Auth 模型与 Swarm 模型正确关联

## 📊 架构对比

### 重构前：混合架构
```
Users 表 {
  ✓ Better Auth 字段 (id, email, name...)
  ✗ 业务字段 (username, role, subscription...)
}

Sessions 表 {
  ✗ 会话认证 + 业务对话混合
}
```

### 重构后：CLI 生成 + 分离架构 ⭐
```
Better Auth 层 (CLI 生成) {
  ✓ User (纯认证，自动生成)
  ✓ Account (OAuth，自动生成)
  ✓ Session (会话管理，自动生成)
  ✓ Verification (验证码，自动生成)
}

Swarm 业务层 {
  ✓ SwarmUser (用户扩展)
  ✓ SwarmAIAgent (智能体)
  ✓ SwarmChatSession (业务对话)
  ✓ SwarmChatMessage (消息)
  ✓ SwarmSkillTag (技能)
  ✓ SwarmTool (工具)
}
```

## 🎉 实施结果

### 技术成果
- ✅ **架构清晰**：Better Auth 和业务逻辑完全分离
- ✅ **命名规范**：统一的 Swarm 前缀便于识别和管理
- ✅ **类型安全**：完整的 TypeScript 类型定义
- ✅ **构建成功**：所有类型错误已解决
- ✅ **标准化认证**：使用官方 CLI 生成的标准模型 ⭐
- ✅ **数据库同步**：外键关系和类型匹配已修复

### 业务优势
1. **维护性提升**：Better Auth 表由官方工具维护，升级无风险
2. **扩展性增强**：业务模型独立演进，不受认证层约束
3. **团队协作**：清晰的模块边界便于分工开发
4. **代码质量**：统一命名规范提高代码可读性
5. **版本兼容**：自动跟随 Better Auth 库的更新 ⭐

### 性能优化
1. **查询效率**：减少表字段冗余，提高查询性能
2. **索引优化**：针对业务场景设计专门索引
3. **缓存友好**：清晰的数据边界便于缓存策略设计

## 🚀 后续计划

### 短期目标（1-2周）
- [x] 使用 Better Auth CLI 生成标准认证模型 ⭐
- [x] 完成数据库 schema 迁移和类型修复
- [ ] 完善认证流程的错误处理
- [ ] 优化 SwarmUser 和 User 的数据同步机制

### 中期目标（1-2月）
- [ ] 实施智能体能力评估系统
- [ ] 开发工具市场和插件机制
- [ ] 构建对话质量分析功能

### 长期目标（3-6月）
- [ ] 支持企业级权限管理
- [ ] 实现分布式智能体协作
- [ ] 构建 AI 训练数据管道

## 📚 相关文档

- [Better Auth 集成文档](./auth.md)
- [Prisma Schema 设计规范](../prisma/schema.prisma)
- [API 类型定义参考](../src/types/api.ts)
- [数据库种子数据](../prisma/seed.ts)

## 🔧 开发指南

### 添加新的业务模型
1. 在 `prisma/schema.prisma` 中使用 `Swarm` 前缀定义模型
2. 运行 `pnpm prisma generate` 生成类型
3. 在 `src/types/api.ts` 中添加对应的 API 类型
4. 创建相应的数据库操作函数

### 更新认证模型 ⭐ **重要**
1. **不要手动修改** User、Account、Session、Verification 模型
2. 运行 `npx @better-auth/cli generate -y` 重新生成
3. 确保 SwarmUser 的关联关系保持正确
4. 测试认证流程的完整性

### 扩展认证功能
1. 查阅 Better Auth 官方文档
2. 在 `src/lib/auth.ts` 中配置新的认证提供商
3. 更新 `src/components/auth/` 中的相关组件
4. 使用 CLI 重新生成必要的模型更新

## ⚠️ 重要注意事项

### Better Auth 模型管理 ⭐
- **永远不要手动编辑** Better Auth 生成的模型
- 使用 `npx @better-auth/cli generate` 进行所有认证模型更新
- 版本升级时重新运行 CLI 生成命令
- 保持 SwarmUser 与 User 的正确关联关系

### 数据类型一致性
- Better Auth User.id 使用 `String` 类型
- SwarmUser.userId 必须匹配 User.id 的类型
- 确保外键约束的类型兼容性

---

**📝 文档版本**：v1.1  
**📅 最后更新**：2024年12月  
**👥 维护团队**：SwarmAI 开发团队  
**🔧 关键改进**：Better Auth CLI 集成