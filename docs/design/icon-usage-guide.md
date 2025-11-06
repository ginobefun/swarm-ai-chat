# SwarmAI.chat Icon Usage Guide

图标使用规范，明确何时使用Emoji、何时使用Lucide Icons，以及如何保持一致性。

## 🎨 图标系统架构

SwarmAI.chat使用两套图标系统：

### 1. Emoji 表情符号
**库：** Unicode Emoji (系统原生)
**包大小：** 0 KB
**用途：** 装饰性、情感化、品牌化的视觉元素

### 2. Lucide Icons
**库：** lucide-react
**包大小：** ~2 KB per icon (tree-shakeable)
**用途：** 功能性、交互性、操作性的UI图标

---

## 📋 使用决策树

```
┌─────────────────────────────┐
│  需要使用图标？              │
└──────────┬──────────────────┘
           │
    ┌──────▼──────┐
    │ 是否需要表达  │
    │ 情感/个性？   │
    └──────┬──────┘
           │
     ┌─────▼─────┐
     │    是      │
     └─────┬─────┘
           │
    ┌──────▼──────────┐
    │ 使用 Emoji 表情  │
    │ 示例：🤖 💬 🎉  │
    └─────────────────┘

           │
     ┌─────▼─────┐
     │    否      │
     └─────┬─────┘
           │
    ┌──────▼────────────┐
    │ 是否需要用户交互？  │
    │ (点击、悬停等)     │
    └──────┬────────────┘
           │
     ┌─────▼─────┐
     │    是      │
     └─────┬─────┘
           │
    ┌──────▼───────────┐
    │ 使用 Lucide Icons │
    │ 示例：<Plus />    │
    │      <Settings /> │
    └──────────────────┘
```

---

## 🎭 Emoji 使用规范

### ✅ 适用场景

#### 1. 用户身份/角色标识
```tsx
// ✅ Avatar placeholder
<div className="avatar">
  🤖  {/* AI Agent */}
  👤  {/* User */}
  👥  {/* Team */}
</div>
```

#### 2. 状态指示器（装饰性）
```tsx
// ✅ Empty state
<div className="empty-state">
  <span className="text-4xl">💬</span>
  <p>还没有会话</p>
</div>

// ✅ Success message
<div className="success">
  🎉 会话创建成功！
</div>
```

#### 3. 特性/功能展示
```tsx
// ✅ Feature highlights (WelcomeGuide)
<div className="feature">
  <span>🤖</span>
  <h3>多智能体协作</h3>
</div>

<div className="feature">
  <span>⚡</span>
  <h3>智能工作流</h3>
</div>
```

#### 4. 品牌识别
```tsx
// ✅ Logo / Brand
<span className="logo">🌊</span>
<h1>SwarmAI.chat</h1>
```

#### 5. 情感化消息
```tsx
// ✅ Toast notifications
toast.success("✅ 操作成功！")
toast.error("⚠️ 出错了")
toast.info("💡 提示：...")
```

### ❌ 不适用场景

```tsx
// ❌ 不要用于功能性按钮
<button>➕ 创建</button>  // 错误
<button><Plus /> 创建</button>  // 正确

// ❌ 不要用于导航图标
<nav>
  <a>🏠 首页</a>  // 错误
  <a><Home /> 首页</a>  // 正确
</nav>

// ❌ 不要用于表单控件
<input type="checkbox" />📧 邮件通知  // 错误
<input type="checkbox" /><Mail /> 邮件通知  // 正确
```

### 📏 Emoji尺寸规范

```tsx
// Small: text-base (16px)
<span className="text-base">🤖</span>

// Medium: text-lg (18px)
<span className="text-lg">🤖</span>

// Large: text-2xl (24px)
<span className="text-2xl">🤖</span>

// XLarge: text-4xl (36px) - 仅用于Hero/Empty State
<span className="text-4xl">🤖</span>
```

### 🎯 Emoji选择标准

#### 推荐使用的Emoji类别

1. **简单图形** - 跨平台一致性高
   - ✅ ⚡ 🌟 💡 🎯 🔥

2. **技术相关**
   - ✅ 🤖 💻 📱 ⚙️ 🔧

3. **状态指示**
   - ✅ ✅ ⚠️ ❌ ℹ️ 📌

4. **通用符号**
   - ✅ 💬 📧 🔔 📂 🗂️

#### 避免使用的Emoji

1. **复杂人物** - 跨平台差异大
   - ❌ 👨‍💻 👩‍🎨 (使用 👤 代替)

2. **肤色变体** - 可能引起争议
   - ❌ 👍🏻 👍🏿 (使用 ✅ 代替)

3. **组合Emoji** - 部分系统不支持
   - ❌ 👨‍👩‍👧‍👦 (使用 👥 代替)

4. **新版Emoji** - 旧系统可能显示为方框
   - ❌ 🫠 🫶 (iOS 15.4+才支持)

---

## 🎯 Lucide Icons 使用规范

### ✅ 适用场景

#### 1. 操作按钮
```tsx
import { Plus, Trash2, Edit, Download } from 'lucide-react'

// ✅ Action buttons
<Button><Plus className="w-4 h-4" /> 创建</Button>
<Button><Edit className="w-4 h-4" /> 编辑</Button>
<Button variant="destructive"><Trash2 className="w-4 h-4" /> 删除</Button>
```

#### 2. 导航图标
```tsx
import { Home, Settings, User, MessageSquare } from 'lucide-react'

// ✅ Navigation
<nav>
  <a><Home className="w-5 h-5" /> 首页</a>
  <a><MessageSquare className="w-5 h-5" /> 会话</a>
  <a><Settings className="w-5 h-5" /> 设置</a>
</nav>
```

#### 3. 状态指示器（功能性）
```tsx
import { Check, AlertCircle, Info, Loader2 } from 'lucide-react'

// ✅ Status indicators
<span><Check className="w-4 h-4 text-green-500" /> 已完成</span>
<span><AlertCircle className="w-4 h-4 text-red-500" /> 错误</span>
<span><Loader2 className="w-4 h-4 animate-spin" /> 加载中</span>
```

#### 4. 表单控件图标
```tsx
import { Search, Eye, EyeOff, Calendar } from 'lucide-react'

// ✅ Form controls
<Input
  icon={<Search className="w-4 h-4" />}
  placeholder="搜索..."
/>

<button type="button">
  <Eye className="w-4 h-4" />
</button>
```

#### 5. 下拉菜单/Tooltip指示
```tsx
import { ChevronDown, ChevronRight, MoreVertical } from 'lucide-react'

// ✅ Dropdown indicators
<Button>
  选择主题 <ChevronDown className="w-4 h-4" />
</Button>

<Button variant="ghost">
  <MoreVertical className="w-4 h-4" />
</Button>
```

### 📏 Icon尺寸规范

```tsx
// Tiny: w-3 h-3 (12px) - 仅用于Badge/Tag
<Check className="w-3 h-3" />

// Small: w-4 h-4 (16px) - 默认，最常用
<Plus className="w-4 h-4" />

// Medium: w-5 h-5 (20px) - 导航、大按钮
<Home className="w-5 h-5" />

// Large: w-6 h-6 (24px) - Icon-only按钮、特殊强调
<Settings className="w-6 h-6" />

// XLarge: w-8 h-8 (32px) - 仅用于Hero section
<Brain className="w-8 h-8" />
```

### 🎨 Icon颜色规范

```tsx
// Inherit from parent (推荐)
<Plus className="w-4 h-4" />  // 继承text-color

// Semantic colors
<Check className="w-4 h-4 text-green-500" />  // Success
<AlertCircle className="w-4 h-4 text-red-500" />  // Error
<Info className="w-4 h-4 text-blue-500" />  // Info

// Interactive states
<button className="text-slate-600 hover:text-slate-900">
  <Plus className="w-4 h-4" />  // Icon自动继承颜色变化
</button>
```

### 🔄 Icon动画

```tsx
import { Loader2, RefreshCw } from 'lucide-react'

// ✅ Loading spinner
<Loader2 className="w-4 h-4 animate-spin" />

// ✅ Refresh animation
<RefreshCw className="w-4 h-4 transition-transform hover:rotate-180" />

// ❌ 避免过度动画
<Plus className="w-4 h-4 animate-bounce" />  // 太夸张
```

---

## 📦 常用图标映射表

| 功能 | Emoji | Lucide Icon | 推荐使用 |
|------|-------|-------------|---------|
| 创建/添加 | ➕ | `<Plus />` | Lucide |
| 删除 | ❌ | `<Trash2 />` | Lucide |
| 编辑 | ✏️ | `<Edit />` | Lucide |
| 搜索 | 🔍 | `<Search />` | Lucide |
| 设置 | ⚙️ | `<Settings />` | Lucide |
| 首页 | 🏠 | `<Home />` | Lucide |
| 用户 | 👤 | `<User />` | Emoji (Avatar) |
| AI助手 | 🤖 | `<Bot />` | Emoji (品牌) |
| 消息 | 💬 | `<MessageSquare />` | Both (场景区分) |
| 成功状态 | ✅ | `<Check />` | Lucide (功能) |
| 错误状态 | ⚠️ | `<AlertCircle />` | Lucide (功能) |
| 加载中 | ⏳ | `<Loader2 />` | Lucide |
| 下载 | ⬇️ | `<Download />` | Lucide |
| 上传 | ⬆️ | `<Upload />` | Lucide |
| 星标/收藏 | ⭐ | `<Star />` | Lucide |
| 通知 | 🔔 | `<Bell />` | Lucide |
| 日历 | 📅 | `<Calendar />` | Lucide |
| 文件 | 📄 | `<File />` | Lucide |

---

## 🎯 实战案例

### 案例1：Button组件

```tsx
// ✅ 正确：功能性按钮使用Lucide
import { Plus } from 'lucide-react'

<Button>
  <Plus className="w-4 h-4 mr-2" />
  创建会话
</Button>

// ❌ 错误：功能性按钮不要用Emoji
<Button>
  ➕ 创建会话
</Button>
```

### 案例2：Empty State

```tsx
// ✅ 正确：装饰性使用Emoji
<div className="empty-state">
  <span className="text-4xl mb-4">💬</span>
  <h3>还没有会话</h3>
  <Button>
    <Plus className="w-4 h-4 mr-2" />
    创建第一个会话
  </Button>
</div>
```

### 案例3：Toast Notification

```tsx
import { toast } from 'sonner'
import { Check, AlertCircle } from 'lucide-react'

// ✅ 方案1：Emoji（简洁风格）
toast.success("✅ 会话创建成功")

// ✅ 方案2：Lucide（专业风格）
toast.success("会话创建成功", {
  icon: <Check className="w-4 h-4" />
})
```

### 案例4：Avatar

```tsx
// ✅ 正确：用户头像使用Emoji
<div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
  <span className="text-xl">🤖</span>
</div>

// ❌ 错误：不要用Lucide（太单调）
<div className="w-12 h-12 rounded-full">
  <User className="w-6 h-6" />
</div>
```

### 案例5：SessionItem

```tsx
import { Pin } from 'lucide-react'

// ✅ 混合使用
<div className="session-item">
  {/* Avatar: Emoji */}
  <div className="avatar">🤖</div>

  <div className="content">
    <h3>会话标题</h3>
    <p>最后一条消息...</p>
  </div>

  {/* Pin indicator: Lucide */}
  {isPinned && (
    <Pin className="w-4 h-4 text-indigo-500" />
  )}
</div>
```

---

## ♿ 可访问性要求

### Emoji可访问性

```tsx
// ✅ 装饰性Emoji - 隐藏于屏幕阅读器
<span aria-hidden="true">🤖</span>

// ✅ 有意义的Emoji - 提供替代文本
<span role="img" aria-label="机器人">🤖</span>

// ✅ 在按钮中
<button aria-label="创建新会话">
  ➕ <span className="sr-only">创建</span>
</button>
```

### Lucide Icons可访问性

```tsx
// ✅ Icon-only按钮 - 必须有aria-label
<button aria-label="设置">
  <Settings className="w-5 h-5" />
</button>

// ✅ Icon + Text - aria-hidden图标
<button>
  <Plus className="w-4 h-4" aria-hidden="true" />
  <span>创建</span>
</button>

// ✅ 状态指示器
<div role="status" aria-live="polite">
  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
  <span className="sr-only">加载中...</span>
</div>
```

---

## 📊 图标使用统计（目标）

| 类型 | 预期比例 | 场景 |
|------|---------|------|
| Lucide Icons | 70% | 功能性UI |
| Emoji | 25% | 装饰/品牌 |
| 自定义SVG | 5% | Logo/特殊需求 |

---

## ✅ 代码审查检查清单

在PR中添加图标时，检查：

- [ ] 是否选择了正确的图标类型（Emoji vs Lucide）？
- [ ] Lucide Icon尺寸是否合适？（通常w-4 h-4）
- [ ] 是否添加了必要的ARIA标签？
- [ ] Emoji是否设置了aria-hidden？
- [ ] Icon颜色是否符合设计系统？
- [ ] 是否避免了过度动画？
- [ ] 是否考虑了暗黑模式的对比度？

---

## 🚀 最佳实践总结

### DO ✅

1. **功能性交互** → Lucide Icons
2. **装饰性元素** → Emoji
3. **保持一致性** → 同一功能使用同一图标
4. **添加ARIA标签** → 确保可访问性
5. **使用语义化颜色** → text-green-500 (success), text-red-500 (error)

### DON'T ❌

1. ❌ 混用图标系统（同一元素不要Emoji+Lucide）
2. ❌ 过度使用Emoji（保持专业性）
3. ❌ 忘记可访问性（aria-label, aria-hidden）
4. ❌ 使用过小的图标（< 12px）
5. ❌ 使用过多动画（保持克制）

---

**版本：** v1.0.0
**最后更新：** 2025-11-06
**维护者：** SwarmAI Design Team
