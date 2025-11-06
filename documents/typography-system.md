# SwarmAI.chat Typography System

基于Design Tokens的字体系统规范，限制为6个核心尺寸以确保视觉层次清晰。

## 📝 核心字体尺寸（6级）

### Level 1: Display - 超大标题
```
Size: text-4xl (36px / 2.25rem)
Line Height: leading-tight (1.25)
Font Weight: font-bold (700)

使用场景:
- Hero section主标题
- 登录/注册页面大标题
- 空状态页面标题
- WelcomeGuide主标题

示例:
<h1 className="text-4xl font-bold leading-tight">SwarmAI.chat</h1>
```

### Level 2: Heading Large - 大标题
```
Size: text-2xl (24px / 1.5rem)
Line Height: leading-tight (1.25)
Font Weight: font-semibold (600)

使用场景:
- 页面主标题（H1）
- Dialog标题
- Section标题
- Dashboard卡片大标题

示例:
<h1 className="text-2xl font-semibold">会话列表</h1>
```

### Level 3: Heading Small - 小标题
```
Size: text-lg (18px / 1.125rem)
Line Height: leading-snug (1.375)
Font Weight: font-semibold (600)

使用场景:
- 子标题（H2, H3）
- Card标题
- Session Item标题
- Dialog section标题

示例:
<h2 className="text-lg font-semibold">创建新会话</h2>
```

### Level 4: Body - 正文
```
Size: text-base (16px / 1rem) - Desktop
       text-sm (14px / 0.875rem) - Mobile
Line Height: leading-normal (1.5)
Font Weight: font-normal (400)

使用场景:
- 主要正文内容
- 消息文本
- 描述性文字
- Button文字

示例:
<p className="text-base leading-normal">这是一段正文内容...</p>
<button className="text-base">创建会话</button>
```

### Level 5: Small - 小字
```
Size: text-sm (14px / 0.875rem)
Line Height: leading-normal (1.5)
Font Weight: font-normal (400) / font-medium (500)

使用场景:
- 次要信息
- 输入框占位符
- 表单标签
- Help text
- 时间戳
- Badge文字

示例:
<span className="text-sm text-slate-600">2分钟前</span>
<label className="text-sm font-medium">邮箱地址</label>
```

### Level 6: Tiny - 微小字
```
Size: text-xs (12px / 0.75rem)
Line Height: leading-normal (1.5)
Font Weight: font-normal (400) / font-medium (500)

使用场景:
- Caption文字
- 错误提示
- 标签/Badge
- Tooltip
- 版权信息
- 辅助说明

示例:
<span className="text-xs text-slate-500">选填</span>
<p className="text-xs text-red-600">必填字段</p>
```

## 🎯 字体大小使用矩阵

| 元素类型 | Desktop | Mobile | Line Height | Weight | 场景 |
|---------|---------|--------|-------------|--------|------|
| Hero标题 | text-4xl (36px) | text-3xl (30px) | tight | bold | WelcomeGuide |
| 页面标题 | text-2xl (24px) | text-xl (20px) | tight | semibold | Dialog, Page H1 |
| Section标题 | text-lg (18px) | text-lg (18px) | snug | semibold | Card, H2 |
| 正文 | text-base (16px) | text-sm (14px) | normal | normal | Body, Button |
| 次要文字 | text-sm (14px) | text-sm (14px) | normal | normal/medium | Label, Help |
| 辅助文字 | text-xs (12px) | text-xs (12px) | normal | normal/medium | Caption, Error |

## ⚠️ 禁用的尺寸

以下Tailwind尺寸**不应使用**，以保持设计系统的一致性：

```
❌ text-3xl (30px) - 与text-2xl和text-4xl间隔不明显
❌ text-xl (20px)  - 与text-lg和text-2xl间隔不明显
❌ text-5xl及以上  - 超过合理的UI尺寸范围
```

如果需要这些尺寸，请在特定组件中override，并在代码注释中说明原因。

## 📱 响应式字体策略

### Mobile-First Approach

```tsx
// ✅ 推荐：移动端优先，桌面端扩展
<h1 className="text-2xl sm:text-3xl lg:text-4xl">

// ❌ 避免：桌面端优先
<h1 className="text-4xl sm:text-2xl">
```

### 关键断点

```
< 640px (mobile):   使用小一级的字体
>= 640px (tablet):  使用标准字体
>= 1024px (desktop): 保持或使用大一级字体
```

## 🎨 字重系统（4级）

严格限制为4个字重，避免过度使用：

### 1. Normal (400) - 正文
```
font-normal

使用场景:
- 所有正文文本
- 描述性内容
- 占位符
- 次要信息
```

### 2. Medium (500) - 强调
```
font-medium

使用场景:
- 表单标签
- 菜单项
- 需要轻微强调的文字
- Badge文字
```

### 3. Semibold (600) - 标题
```
font-semibold

使用场景:
- 所有标题（H1-H3）
- Card标题
- Section标题
- 重要的UI文字
```

### 4. Bold (700) - 超级强调
```
font-bold

使用场景:
- Hero标题
- 关键数字
- 强烈强调的内容
- 品牌名称
```

### ⚠️ 禁用字重
```
❌ font-light (300)
❌ font-extralight (200)
❌ font-thin (100)
❌ font-extrabold (800)
❌ font-black (900)
```

## 📏 行高系统（3级）

### 1. Tight (1.25) - 紧凑
```
leading-tight

使用场景:
- 大标题（text-2xl, text-4xl）
- Hero文字
- 需要紧凑视觉的短文本
```

### 2. Snug (1.375) - 标准紧凑
```
leading-snug

使用场景:
- 小标题（text-lg）
- Card标题
- Button文字
```

### 3. Normal (1.5) - 标准
```
leading-normal

使用场景:
- 所有正文（text-base, text-sm, text-xs）
- 描述性文字
- 表单内容
- 消息文本
```

### ⚠️ 不推荐
```
⚠️ leading-relaxed (1.75) - 仅用于长文章
❌ leading-loose (2) - UI设计中不使用
```

## 🔤 字体族（2种）

### Sans Serif - UI文字（默认）
```
font-sans -> Geist Sans, system-ui, sans-serif

使用场景:
- 所有UI文字
- 标题
- 按钮
- 表单
- 导航
```

### Monospace - 代码
```
font-mono -> Geist Mono, monospace

使用场景:
- 代码块
- 技术标识符
- API keys
- JSON展示
- 文件路径
```

## 📋 组件字体规范

### Button
```tsx
// Default
<Button className="text-sm font-medium">

// Large
<Button size="lg" className="text-base font-semibold">
```

### Dialog Title
```tsx
<DialogTitle className="text-2xl font-semibold leading-tight">
```

### Card Title
```tsx
<CardTitle className="text-lg font-semibold">
```

### Form Label
```tsx
<label className="text-sm font-medium">
```

### Error Message
```tsx
<p className="text-xs text-red-600 font-medium">
```

### Help Text
```tsx
<p className="text-xs text-slate-500">
```

### Badge
```tsx
<Badge className="text-xs font-medium">
```

### Timestamp
```tsx
<time className="text-xs text-slate-400">
```

## ✅ 使用检查清单

在添加文字样式前，请检查：

- [ ] 是否使用了6个核心尺寸之一？（xs, sm, base, lg, 2xl, 4xl）
- [ ] 是否使用了4个核心字重之一？（normal, medium, semibold, bold）
- [ ] 是否使用了3个核心行高之一？（tight, snug, normal）
- [ ] 移动端尺寸是否合适？（≥14px for body text）
- [ ] 是否考虑了响应式变化？（sm:, lg:前缀）
- [ ] 颜色对比度是否达标？（WCAG AA: 4.5:1）

## 🚀 迁移指南

### 从旧系统迁移

```tsx
// ❌ Before
<h1 className="text-3xl font-extrabold text-gray-900">

// ✅ After
<h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">

// ❌ Before
<p className="text-base font-light text-gray-600">

// ✅ After
<p className="text-sm font-normal text-slate-600 dark:text-slate-300">
```

## 📊 字体尺寸对比表

| Tailwind Class | Pixels | Rem | 用途 | 频率 |
|----------------|--------|-----|------|------|
| text-xs | 12px | 0.75rem | Caption, Error | ⭐⭐⭐ |
| text-sm | 14px | 0.875rem | Label, Secondary | ⭐⭐⭐⭐⭐ |
| text-base | 16px | 1rem | Body, Primary | ⭐⭐⭐⭐⭐ |
| text-lg | 18px | 1.125rem | Small Heading | ⭐⭐⭐⭐ |
| text-2xl | 24px | 1.5rem | Page Title | ⭐⭐⭐ |
| text-4xl | 36px | 2.25rem | Hero Title | ⭐⭐ |

## 🎯 设计决策记录

### 为什么只用6个尺寸？

1. **认知负荷**：过多选择导致决策困难
2. **视觉层次**：明确的尺寸差异创造清晰的层次
3. **一致性**：限制选择确保团队统一使用
4. **维护性**：更少的变体更易于长期维护

### 为什么禁用text-3xl和text-xl？

- text-xl (20px) 与 text-lg (18px) 差异仅2px，视觉区分度不够
- text-3xl (30px) 与 text-2xl (24px) 和 text-4xl (36px) 的间隔不平衡
- 保持1.5倍的缩放比例：12→14→16→18→24→36

## 📚 参考资源

- [Tailwind Typography Plugin](https://tailwindcss.com/docs/font-size)
- [Material Design Type Scale](https://m3.material.io/styles/typography/type-scale-tokens)
- [WCAG 2.1 Text Spacing](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html)
- [Apple HIG Typography](https://developer.apple.com/design/human-interface-guidelines/typography)

---

**版本：** v1.0.0
**最后更新：** 2025-11-06
**下一步计划：**
- [ ] 审查现有组件，统一字体大小
- [ ] 创建Typography示例页面
- [ ] 集成到Storybook
