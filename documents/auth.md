# SwarmAI 认证系统设置指南

本文档说明如何配置 SwarmAI 的用户认证系统，基于 [Better Auth](https://www.better-auth.com/docs/installation)。

## 🏗️ 架构设计理念

### 分离关注点架构 ⭐ **核心设计**

基于 SwarmAI 架构重新设计，我们采用了清晰的分层架构：

#### 1. **Better Auth 认证层** - 使用官方 CLI 生成
- **用途**: 专门负责用户身份验证、会话管理、OAuth 集成
- **生成方式**: 使用 `npx @better-auth/cli generate` 自动生成标准模型
- **优势**: 确保与 Better Auth 库版本的完全一致性，避免手动维护的兼容性问题

#### 2. **Swarm 业务层** - 自定义业务逻辑
- **用途**: 处理 AI 协作、对话、智能体等业务功能
- **命名规范**: 统一使用 "Swarm" 前缀，形成独立的业务命名空间
- **扩展性**: 独立演进，不受认证层约束

#### 3. **关联方式** - 外键而非字段混合
- 通过 `SwarmUser.userId` 关联到 `User.id`
- 保持两层数据的清晰边界
- 支持级联删除和数据一致性

### 架构对比

```typescript
// ❌ 重构前：混合架构
model User {
  // Better Auth 字段 + 业务字段混合
  id         String
  email      String
  username   String  // 业务字段
  role       Role    // 业务字段
  // ... 耦合严重
}

// ✅ 重构后：CLI 生成 + 分离架构
// Better Auth 层 (CLI 自动生成)
model User {
  id            String    @id
  email         String    @unique
  name          String?
  emailVerified Boolean
  image         String?
  // ... 纯认证字段
  swarmUser     SwarmUser? // 关联业务扩展
}

// Swarm 业务层 (自定义业务逻辑)
model SwarmUser {
  id                 String  @id @default(uuid())
  userId             String  @unique // 关联认证层
  username           String? @unique
  role               SwarmRole
  subscriptionStatus SubscriptionStatus
  // ... 业务字段
  user User @relation(fields: [userId], references: [id])
}
```

### 数据库模型说明

#### Better Auth 标准表（CLI 生成）⭐

```bash
# 生成标准认证模型
npx @better-auth/cli generate -y
```

生成的核心表：

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `user` | 用户基础信息 | id, email, name, emailVerified, image |
| `account` | OAuth 账户关联 | accountId, providerId, accessToken |
| `session` | 会话管理 | token, expiresAt, userId |
| `verification` | 验证码管理 | identifier, value, expiresAt |

#### Swarm 业务表（自定义设计）

| 表名 | 用途 | 关键字段 |
|------|------|----------|
| `swarm_users` | 用户业务扩展 | userId, username, role, subscriptionStatus |
| `swarm_ai_agents` | AI 智能体 | name, specialty, systemPrompt |
| `swarm_chat_sessions` | 对话会话 | title, type, createdById |
| `swarm_chat_messages` | 聊天消息 | content, senderType, sessionId |

## 🔧 环境变量配置

请在项目根目录创建 `.env.local` 文件，并配置以下环境变量：

### 1. 数据库配置
```env
DATABASE_URL="postgresql://username:password@localhost:5432/swarm_ai_chat"
```

### 2. Better Auth 基础配置
```env
# 生成一个安全的密钥 (32字符以上)
BETTER_AUTH_SECRET="your-super-secret-key-change-this-in-production"

# 应用基础URL
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. OAuth 第三方登录配置

#### Google OAuth 配置
1. 访问 [Google Console](https://console.developers.google.com/)
2. 创建新项目或选择现有项目
3. 启用 Google+ API
4. 创建 OAuth 2.0 凭据
5. 添加重定向 URI: `http://localhost:3000/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

#### GitHub OAuth 配置
1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 设置 Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

## 🗄️ 数据库配置与迁移

### 模型关联设计

#### 用户认证与业务数据关联
```prisma
// Better Auth 生成的用户表
model User {
  id            String     @id
  email         String     @unique
  name          String?
  emailVerified Boolean
  image         String?
  createdAt     DateTime
  updatedAt     DateTime
  
  // 关联到业务层
  swarmUser     SwarmUser?
  
  @@map("user")
}

// 业务层用户扩展
model SwarmUser {
  id                 String             @id @default(uuid()) @db.Uuid
  userId             String             @unique @map("user_id")
  username           String?            @unique @db.VarChar(50)
  role               SwarmRole          @default(USER)
  subscriptionStatus SubscriptionStatus @default(FREE)
  preferences        Json               @default("{}")
  
  // 关联回认证层
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("swarm_users")
}
```

### 数据一致性保障

#### 自动创建 SwarmUser 记录
在用户注册或首次社交登录时，系统会自动创建对应的 SwarmUser 记录：

```typescript
// 在 src/lib/auth.ts 中的 hooks 配置
hooks: {
  after: createAuthMiddleware(async (ctx) => {
    // 检测用户创建事件
    if (isUserCreationEvent(ctx)) {
      await createSwarmUserRecord(ctx.context.newSession.user)
    }
  }),
}
```

### 运行迁移命令
```bash
# 设置环境变量并推送schema（开发环境）
DATABASE_URL="postgresql://swarm_user:swarm_password@localhost:5432/swarm_ai_chat" pnpm db:push

# 填充种子数据
DATABASE_URL="postgresql://swarm_user:swarm_password@localhost:5432/swarm_ai_chat" pnpm db:seed

# 生成 Prisma 客户端
pnpm db:generate
```

## ✨ 功能特性

### 支持的登录方式
- ✅ 邮箱密码登录/注册（包含用户名设置）
- ✅ Google 社交登录
- ✅ GitHub 社交登录
- ✅ 多设备会话管理
- ✅ 账户关联功能

### 用户菜单界面 *(2024-12-19 新增)*
- 🎨 **UserMenu 组件** (`src/components/UserMenu.tsx`)
  - 现代化下拉菜单设计，采用高透明度背景确保最佳阅读体验
  - 毛玻璃效果 (`backdrop-blur-xl`) 和强阴影增强视觉层次
  - 用户信息头部展示（头像、姓名、邮箱）
  - 流畅的 Framer Motion 动画效果
- 📱 **移动端优化**
  - 触摸友好的交互目标
  - 响应式布局适配
  - 平滑的动画过渡
- 🌙 **完整的主题支持**
  - 浅色模式：`bg-white/95` 高透明度白色背景
  - 暗黑模式：`bg-slate-900/95` 高透明度深色背景
  - 智能边框和阴影适配

### 用户名系统
- 🏷️ 注册时必须设置唯一用户名
- 🔍 支持英文、数字、下划线组合
- 👥 用于群聊邀请和好友添加
- ✅ 全局唯一性验证
- 🤖 社交登录自动生成默认用户名

### 安全特性
- 🔐 加密存储密码
- 🛡️ 会话管理和自动刷新
- 🔄 跨标签页会话同步
- 📱 多设备登录支持
- 🔒 会话过期自动处理
- 🔗 OAuth 账户安全关联

### 用户界面
- 🎨 现代化登录对话框设计
- 📱 移动端完全适配
- 🌙 暗黑模式完整支持
- 🎭 Modal 背景遮罩效果
- ⚡ 流畅的动画过渡

## 🏗️ 架构说明

### 文件结构
```
src/
├── lib/
│   ├── auth.ts           # Better Auth服务端配置
│   └── auth-client.ts    # Better Auth客户端配置
├── app/api/auth/
│   └── [...all]/route.ts # Better Auth API路由
├── components/
│   ├── auth/
│   │   └── LoginDialog.tsx    # 登录注册对话框
│   └── providers/
│       └── AuthProvider.tsx   # 认证状态管理
└── app/layout.tsx        # 全局布局集成
prisma/
└── schema.prisma        # 分离架构数据库模型
```

### 认证流程

#### 用户注册流程
1. **邮箱注册**: 邮箱 → 用户名 → 密码 → 姓名
2. **自动创建**: Better Auth 创建 User → 系统自动创建 SwarmUser
3. **数据同步**: 用户名同步，业务数据初始化

#### 社交登录流程
1. **OAuth 认证**: Google/GitHub → Better Auth 验证
2. **账户关联**: 创建 Account 记录关联 User
3. **业务数据**: 自动创建 SwarmUser，生成默认用户名

#### 会话管理
1. **会话创建**: 登录成功创建 Session 记录
2. **自动刷新**: 1天后自动更新会话
3. **跨设备同步**: 支持多设备同时登录

### 数据层分离优势

#### 维护性提升 ⭐
- **认证层**: Better Auth CLI 自动维护，升级无风险
- **业务层**: 独立演进，不受认证变更影响
- **版本兼容**: 自动跟随 Better Auth 库更新

#### 扩展性增强
- **业务模型**: 可独立添加新的 Swarm 相关表
- **认证功能**: 通过 Better Auth 插件扩展
- **数据查询**: 清晰的 JOIN 关系，查询性能优化

#### 团队协作
- **职责分离**: 认证专家 vs 业务开发者
- **并行开发**: 认证和业务功能独立开发
- **代码审查**: 清晰的模块边界便于 Review

## 🎯 集成使用

### 在组件中使用认证
```tsx
import { useSession } from '@/components/providers/AuthProvider'
import { signOut } from '@/lib/auth-client'

export function MyComponent() {
    const { data: session, isPending } = useSession()
    
    if (isPending) return <div>加载中...</div>
    
    if (session?.user) {
        return (
            <div>
                <p>欢迎，@{session.user.swarmUser?.username}!</p>
                <p>邮箱：{session.user.email}</p>
                <p>角色：{session.user.swarmUser?.role}</p>
                <button onClick={() => signOut()}>退出登录</button>
            </div>
        )
    }
    
    return <div>请先登录</div>
}
```

### 获取完整用户信息
```tsx
const { data: session } = useSession()

if (session?.user) {
    // Better Auth 字段
    console.log('认证 ID:', session.user.id)
    console.log('邮箱：', session.user.email)
    console.log('姓名：', session.user.name)
    console.log('头像：', session.user.image)
    
    // Swarm 业务字段
    console.log('用户名：', session.user.swarmUser?.username)  // 用于@提及
    console.log('角色：', session.user.swarmUser?.role)
    console.log('订阅状态：', session.user.swarmUser?.subscriptionStatus)
}
```

### 触发登录对话框
```tsx
import { LoginDialog } from '@/components/auth/LoginDialog'

export function Navbar() {
    const [isLoginOpen, setIsLoginOpen] = useState(false)
    
    return (
        <>
            <button onClick={() => setIsLoginOpen(true)}>
                登录
            </button>
            
            <LoginDialog
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSuccess={() => {
                    setIsLoginOpen(false)
                    // 登录成功后的处理
                }}
            />
        </>
    )
}
```

## 🔧 开发指南

### 添加新的业务模型 ⭐ **重要**
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

## 🔒 安全注意事项

### 数据安全
1. **密钥安全**: 确保 `BETTER_AUTH_SECRET` 是强密码，生产环境中必须更换
2. **HTTPS**: 生产环境必须使用 HTTPS
3. **域名配置**: OAuth 回调 URL 必须与实际域名匹配
4. **环境隔离**: 开发、测试、生产环境使用不同的 OAuth 应用

### 数据完整性
1. **级联删除**: User 删除时自动删除 SwarmUser
2. **唯一约束**: 用户名全局唯一，邮箱全局唯一
3. **数据验证**: 前端和后端双重验证
4. **事务处理**: 确保认证和业务数据的一致性

### 隐私保护
1. **最小权限**: OAuth 只获取必要的用户信息
2. **数据脱敏**: 日志中不记录敏感信息
3. **访问控制**: 基于角色的权限管理
4. **数据保留**: 符合 GDPR 的数据保留政策

## 🚀 部署配置

### 本地开发环境
```bash
# 启动数据库
docker-compose up -d postgres

# 设置环境变量并推送schema
DATABASE_URL="postgresql://swarm_user:swarm_password@localhost:5432/swarm_ai_chat" pnpm db:push

# 启动开发服务器
pnpm dev
```

### Vercel 部署
在 Vercel 项目设置中添加环境变量：
- `DATABASE_URL` - 生产数据库连接
- `BETTER_AUTH_SECRET` - 强密码密钥
- `BETTER_AUTH_URL` - 生产域名
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`
- `GITHUB_CLIENT_ID` & `GITHUB_CLIENT_SECRET`

### 生产环境 OAuth 配置
记得在 Google Console 和 GitHub OAuth 应用中添加生产环境的回调 URL：
- Google: `https://yourdomain.com/api/auth/callback/google`
- GitHub: `https://yourdomain.com/api/auth/callback/github`

## 🐛 常见问题与解决方案

### Q: 社交登录失败
A: 检查 OAuth 客户端 ID 和密钥是否正确，回调 URL 是否匹配

### Q: SwarmUser 创建失败
A: 检查 hooks 配置和数据库关联关系，查看日志输出

### Q: 用户名重复错误
A: 前端已集成实时验证，确保用户名唯一性

### Q: 会话过期
A: 系统自动处理会话刷新，默认 7 天有效期

### Q: 数据库连接失败
A: 确认 `DATABASE_URL` 格式正确，数据库服务正在运行

### Q: 认证模型更新失败 ⭐ **新增**
A: 使用 `npx @better-auth/cli generate -y` 重新生成，不要手动修改

### Q: 账户关联问题
A: 确保启用了 `accountLinking` 功能，检查 Account 表数据

## 📱 移动端适配

- ✅ 响应式登录表单设计
- ✅ 触摸优化的按钮大小
- ✅ 移动端键盘适配
- ✅ 暗黑模式完整支持
- ✅ 平滑的动画过渡效果

## 🔄 后续扩展

### 计划功能
- 🔐 两步验证（2FA）
- 📧 邮箱验证流程
- 🔑 密码重置功能
- 👥 好友系统集成
- 💬 群聊邀请机制
- 🏢 企业 SSO 集成

### 架构优化
- 📊 用户行为分析
- 🚀 性能监控集成
- 🔄 数据同步策略
- 📈 扩展性优化

## ⚠️ 重要注意事项

### Better Auth 模型管理 ⭐ **关键原则**
- **永远不要手动编辑** Better Auth 生成的模型
- 使用 `npx @better-auth/cli generate` 进行所有认证模型更新
- 版本升级时重新运行 CLI 生成命令
- 保持 SwarmUser 与 User 的正确关联关系

### 数据类型一致性
- Better Auth User.id 使用 `String` 类型
- SwarmUser.userId 必须匹配 User.id 的类型
- 确保外键约束的类型兼容性
- 维护数据库索引的性能

### 开发最佳实践
- 测试环境优先验证认证流程
- 定期备份生产环境用户数据
- 监控认证成功率和失败率
- 保持认证相关依赖的及时更新

## 📚 更多资源

- [Better Auth 官方文档](https://www.better-auth.com/docs)
- [Better Auth CLI 使用指南](https://www.better-auth.com/docs/cli)
- [Google OAuth 设置指南](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth 设置指南](https://docs.github.com/en/developers/apps/building-oauth-apps) 
- [Prisma 文档](https://www.prisma.io/docs/)
- [SwarmAI 架构设计文档](./swarm-architecture-redesign.md)

---

**📝 文档版本**：v2.0 - 架构分离版本  
**📅 最后更新**：2024年12月  
**👥 维护团队**：SwarmAI 开发团队  
**🔧 关键改进**：Better Auth CLI 集成 + 分离架构设计