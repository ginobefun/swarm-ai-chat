# SwarmAI.chat Design Tokens

设计令牌(Design Tokens)是设计系统的最小单元，定义了项目中所有视觉设计的基础变量。

## 🎨 色彩系统 (Color System)

### 主色调 (Primary Colors)

用于品牌识别和主要操作按钮。

```
Light Mode:
- Primary: #4F46E5 (indigo-600)
- Primary Hover: #4338CA (indigo-700)
- Primary Light: #EEF2FF (indigo-50)

Dark Mode:
- Primary: #6366F1 (indigo-500)
- Primary Hover: #818CF8 (indigo-400)
- Primary Dark: #312E81 (indigo-950)
```

### 语义化颜色 (Semantic Colors)

**成功 (Success)**
```
- Light: #10B981 (emerald-500)
- Dark: #34D399 (emerald-400)
```

**警告 (Warning)**
```
- Light: #F59E0B (amber-500)
- Dark: #FBBF24 (amber-400)
```

**错误 (Error/Destructive)**
```
- Light: #EF4444 (red-500)
- Dark: #F87171 (red-400)
```

### 中性色 (Neutral Colors)

**明亮模式 (Light Mode)**
```
Background Levels:
- L0 (Page): #FAFAFA (gray-50)
- L1 (Card): #FFFFFF (white)
- L2 (Elevated): #FFFFFF + shadow

Border Colors:
- Default: #E2E8F0 (slate-200)
- Subtle: #F1F5F9 (slate-100)
- Strong: #CBD5E1 (slate-300)

Text Colors:
- Primary: #0F172A (slate-900) - 对比度 16.1:1
- Secondary: #475569 (slate-600) - 对比度 7.1:1
- Tertiary: #64748B (slate-500) - 对比度 5.4:1
- Disabled: #94A3B8 (slate-400) - 对比度 3.4:1
```

**暗黑模式 (Dark Mode)**
```
Background Levels:
- L0 (Page): #020617 (slate-950)
- L1 (Card): #0F172A (slate-900)
- L2 (Elevated): #1E293B (slate-800)

Border Colors:
- Default: #334155 (slate-700)
- Subtle: #334155/50 (slate-700/50)
- Strong: #475569 (slate-600)

Text Colors:
- Primary: #F8FAFC (slate-50) - 对比度 18.4:1
- Secondary: #CBD5E1 (slate-300) - 对比度 9.8:1
- Tertiary: #94A3B8 (slate-400) - 对比度 6.2:1
- Disabled: #64748B (slate-500) - 对比度 4.1:1
```

### 阴影系统 (Shadow System)

```
Light Mode:
- xs: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
- sm: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)
- md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)
- lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)
- xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)

Dark Mode:
- xs: 0 1px 2px 0 rgba(0, 0, 0, 0.3)
- sm: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)
- md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)
- lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)
- xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)
```

## 📏 间距系统 (Spacing System)

基于 4px 基准单位，使用Tailwind的间距scale。

```
0: 0px
0.5: 2px  (rare)
1: 4px    (tight spacing)
2: 8px    (compact spacing)
3: 12px   (default small)
4: 16px   (default medium)
5: 20px   (default large)
6: 24px   (section spacing)
8: 32px   (large section)
10: 40px  (major section)
12: 48px  (page section)
16: 64px  (hero section)
```

### 使用指南

**组件内间距 (Component Padding)**
```
- Button: px-4 py-2 (16px x 8px)
- Input: px-3 py-2 (12px x 8px)
- Card: p-6 (24px)
- Dialog: p-6 (24px)
```

**组件间距 (Component Margins)**
```
- Stack (vertical): gap-3 or gap-4 (12px or 16px)
- Grid: gap-4 or gap-6 (16px or 24px)
- Section: mb-8 or mb-12 (32px or 48px)
```

## 🔤 字体系统 (Typography System)

### 字体家族 (Font Families)

```
Sans-serif (UI Text):
- font-sans: Geist Sans, ui-sans-serif, system-ui

Monospace (Code):
- font-mono: Geist Mono, ui-monospace, monospace
```

### 字体大小 (Font Sizes)

```
xs: 12px / 0.75rem    (captions, labels)
sm: 14px / 0.875rem   (body small, secondary text)
base: 16px / 1rem     (body text, default)
lg: 18px / 1.125rem   (large body, emphasis)
xl: 20px / 1.25rem    (small headings)
2xl: 24px / 1.5rem    (headings H3)
3xl: 30px / 1.875rem  (headings H2)
4xl: 36px / 2.25rem   (headings H1, hero)
```

### 字重 (Font Weights)

```
normal: 400   (body text)
medium: 500   (emphasis, labels)
semibold: 600 (sub-headings, important UI)
bold: 700     (headings, strong emphasis)
```

### 行高 (Line Heights)

```
tight: 1.25     (headings)
normal: 1.5     (body text)
relaxed: 1.75   (long-form content)
```

## 📐 圆角系统 (Border Radius System)

统一的圆角规范，从小到大递增。

```
none: 0px
sm: 4px      (small elements, badges)
md: 6px      (inputs, small cards) [DEFAULT]
lg: 8px      (buttons, small cards)
xl: 12px     (cards, panels)
2xl: 16px    (large cards, dialogs)
3xl: 24px    (hero sections)
full: 9999px (pills, avatars)
```

### 使用指南

```
- Badge/Tag: rounded-sm (4px)
- Input/Textarea: rounded-md (6px)
- Button: rounded-lg (8px)
- Card: rounded-xl (12px)
- Dialog/Modal: rounded-2xl (16px)
- Avatar: rounded-full
- Message Bubble: rounded-2xl + corner adjustment
```

## 🎯 Z-Index系统 (Z-Index Layers)

避免随意使用z-index值，使用预定义的层级。

```
z-0: 0        (default, base layer)
z-10: 10      (sticky headers)
z-20: 20      (dropdowns, popovers)
z-30: 30      (sticky elements)
z-40: 40      (fixed overlays)
z-50: 50      (modals, dialogs)

Custom Values:
999: backdrop overlay
1000: navigation bar
1001: dropdown menus
```

## ⚡ 过渡动画 (Transitions)

### 持续时间 (Duration)

```
fast: 150ms    (micro-interactions)
normal: 200ms  (default, most UI)
slow: 300ms    (complex animations)
slower: 500ms  (page transitions)
```

### 缓动函数 (Easing)

```
linear: linear
ease-in: cubic-bezier(0.4, 0, 1, 1)
ease-out: cubic-bezier(0, 0, 0.2, 1) [DEFAULT]
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
```

### 常用过渡

```
transition-colors: color, background-color, border-color
transition-all: all properties (use sparingly)
transition-transform: transform only
transition-opacity: opacity only
```

## 📱 响应式断点 (Breakpoints)

Mobile-first策略，从小屏幕开始设计。

```
Mobile (default): < 640px
sm: >= 640px   (large phones, small tablets)
md: >= 768px   (tablets)
lg: >= 1024px  (laptops, desktops)
xl: >= 1280px  (large desktops)
2xl: >= 1536px (ultra-wide screens)
```

### 使用指南

```
Default: Mobile styles (no prefix)
Tablet: sm: and md: prefixes
Desktop: lg: and above
```

## 🎨 组件特定令牌 (Component-Specific Tokens)

### 按钮 (Button)

```
Heights:
- sm: h-8 (32px)
- default: h-9 (36px)
- lg: h-10 (40px)

Min Touch Target (Mobile): 44x44px
Recommendation: Use h-11 (44px) on mobile
```

### 输入框 (Input)

```
Height: h-9 (36px)
Padding: px-3 py-2
Border: border (1px)
Focus Ring: ring-[3px]
```

### 卡片 (Card)

```
Padding: p-6 (24px)
Border: border (1px)
Radius: rounded-xl (12px)
Gap (内部元素): gap-6 (24px)
```

## ♿ 可访问性令牌 (Accessibility Tokens)

### 对比度要求 (Contrast Requirements)

```
WCAG AA标准:
- Normal Text (< 18px): 4.5:1
- Large Text (≥ 18px or 14px bold): 3:1
- UI Components: 3:1

WCAG AAA标准:
- Normal Text: 7:1
- Large Text: 4.5:1
```

### 焦点指示器 (Focus Indicators)

```
Focus Ring:
- Width: ring-2 (2px)
- Color: ring-indigo-500
- Offset: ring-offset-2 (2px)
- Dark Mode: dark:ring-indigo-400 dark:ring-offset-slate-900
```

### 最小触摸目标 (Touch Targets)

```
Mobile:
- Minimum: 44x44px (Apple HIG)
- Recommended: 48x48px (Material Design)

Desktop:
- Minimum: 24x24px
```

## 📊 使用示例

### 按钮示例

```tsx
// Primary Button
<button className="
  h-10 px-4 py-2
  bg-indigo-600 hover:bg-indigo-700
  text-white font-medium text-sm
  rounded-lg shadow-sm
  transition-colors duration-200
  focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
  dark:bg-indigo-500 dark:hover:bg-indigo-600
  dark:focus-visible:ring-indigo-400 dark:focus-visible:ring-offset-slate-900
">
  Primary Action
</button>
```

### 卡片示例

```tsx
<div className="
  p-6 rounded-xl
  bg-white border border-slate-200
  shadow-sm
  dark:bg-slate-900 dark:border-slate-700
  dark:shadow-slate-950/40
">
  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-2">
    Card Title
  </h3>
  <p className="text-sm text-slate-600 dark:text-slate-300">
    Card description text
  </p>
</div>
```

## 🔄 版本历史

- v1.0.0 (2025-11-06): 初始版本，定义核心Design Tokens
- 下一步计划：
  - 创建Tailwind config扩展
  - 创建CSS变量版本
  - 集成到组件库

## 📚 参考资源

- [Tailwind CSS Color Palette](https://tailwindcss.com/docs/customizing-colors)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [Material Design 3 Tokens](https://m3.material.io/foundations/design-tokens/overview)
- [Apple Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines)
