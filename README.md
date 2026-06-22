# 图片画廊 Gallery

一个基于 React + TypeScript + Vite + Tailwind CSS 构建的响应式图片浏览画廊，支持大图预览、键盘导航、收藏夹等功能。

## 技术栈

- **React 19** — UI 框架
- **TypeScript 6** — 类型安全
- **Vite 8** — 构建工具与开发服务器
- **Tailwind CSS 3** — 原子化 CSS 样式方案
- **PostCSS + Autoprefixer** — CSS 后处理

---

## 项目结构

```
huachuang_image-gallery/
├── index.html                    # 应用入口 HTML
├── package.json                  # 依赖与脚本配置
├── tailwind.config.js            # Tailwind CSS 配置
├── postcss.config.js             # PostCSS 配置
├── vite.config.ts                # Vite 构建配置
├── tsconfig.json                 # TypeScript 根配置
├── tsconfig.app.json             # 应用层 TypeScript 配置
├── tsconfig.node.json            # Node 层 TypeScript 配置
├── eslint.config.js              # ESLint 配置
├── public/
│   ├── favicon.svg               # 网站图标
│   └── icons.svg                 # 图标资源集合
└── src/
    ├── main.tsx                  # React 应用入口
    ├── App.tsx                   # 根组件：全局状态管理 + 页面布局
    ├── index.css                 # Tailwind CSS 指令入口
    ├── assets/                   # 静态资源（未使用）
    │   ├── hero.png
    │   ├── react.svg
    │   └── vite.svg
    └── components/
        ├── ImageGrid.tsx         # 响应式图片网格组件
        └── ImageModal.tsx        # 大图预览模态框组件
```

### 文件职责速览

| 文件 | 职责 |
|------|------|
| [main.tsx](src/main.tsx) | 渲染根节点，挂载 `<App />` 到 `#root`，启用 React StrictMode |
| [App.tsx](src/App.tsx) | 页面整体布局、全局状态（选中图片、收藏集合、视图切换）、localStorage 持久化 |
| [ImageGrid.tsx](src/components/ImageGrid.tsx) | 渲染缩略图网格、处理单图加载失败、显示收藏角标 |
| [ImageModal.tsx](src/components/ImageModal.tsx) | 大图预览、平滑切换、键盘监听、箭头导航、爱心收藏、加载/错误状态 |
| [index.css](src/index.css) | 注入 Tailwind 三层指令（base/components/utilities）+ 清除 body 默认 margin |
| [tailwind.config.js](tailwind.config.js) | 配置 Tailwind 扫描范围（index.html + src 下所有 tsx/ts/jsx/js） |

---

## 组件架构

### 父子关系与数据流

```
App.tsx (根组件)
├── <header> 标题 + "我的收藏"切换按钮
├── ImageGrid
│   props: images, onImageClick, favoriteIds
│   └── 渲染 <div> 网格，每格含 <img> + 收藏角标
├── ImageModal
│   props: image, onClose, images, onSelectImage, favoriteIds, onToggleFavorite
│   ├── 关闭按钮 ×
│   ├── 收藏按钮 ♥
│   ├── 左箭头 ←
│   ├── 右箭头 →
│   └── 底部序号 "3 / 20"
└── 收藏视图空状态（条件渲染）
```

### App 全局状态管理

[App.tsx](src/App.tsx) 管理三类核心状态：

1. **`selectedImage: ImageItem | null`**（[L44](src/App.tsx#L44-L44)）
   - 当前被选中、在模态框中展示的图片
   - `null` 表示模态框关闭

2. **`favoriteIds: Set<number>`**（[L44](src/App.tsx#L44-L44)）
   - 已收藏图片的 ID 集合
   - 使用 `Set` 数据结构，`O(1)` 复杂度判断/增删
   - 通过 `useEffect` 自动同步到 `localStorage`

3. **`showFavorites: boolean`**（[L45](src/App.tsx#L45-L45)）
   - 视图切换标记：`false` 显示全部图片，`true` 仅显示收藏

**图片数据生成**：[generateImages()](src/App.tsx#L14-L25) 使用 `picsum.photos/seed/{id}` 生成 20 张可复现的随机图片，保证每次刷新图片内容一致。

### ImageGrid 组件

[ImageGrid.tsx](src/components/ImageGrid.tsx) 通过 props 接收：

- `images: ImageItem[]` — 要渲染的图片列表（全部或收藏过滤后）
- `onImageClick: (image) => void` — 点击缩略图回调，通知 App 打开模态框
- `favoriteIds?: Set<number>` — 收藏 ID 集合，用于显示右上角粉色爱心角标

内部维护两个组件私有状态：
- `errorStates: Record<number, boolean>` — 每张图的加载失败状态
- `retryKeys: Record<number, number>` — 用于触发重试的 key（修改 key 强制浏览器重新加载图片）

### ImageModal 组件

[ImageModal.tsx](src/components/ImageModal.tsx) 通过 props 与 App 双向通信：

**入参（App → Modal）**：
- `image` — 当前要展示的图片
- `images` — 完整图片列表，用于上下切换导航
- `favoriteIds` — 收藏状态，决定爱心填充色

**出参回调（Modal → App）**：
- `onClose()` — 关闭模态框
- `onSelectImage(image)` — 切换到指定图片（左右箭头/方向键触发）
- `onToggleFavorite(id)` — 切换收藏状态

---

## 核心功能实现说明

### 1. 模态框平滑切换（不闪烁）

**问题**：快速切换图片时，如果每次先卸载再挂载模态框，会出现短暂黑屏闪烁。

**方案**：**双状态分离 + 预加载 + 竞态保护**（[ImageModal.tsx#L18-L87](src/components/ImageModal.tsx#L18-L87)）

| 状态 | 作用 |
|------|------|
| `displayImage` | 当前实际渲染的图片（旧图保持显示直到新图加载完成）|
| `image` (prop) | 目标图片（用户想看的图）|
| `isLoading` | 新图是否正在加载中 |
| `currentIdRef` | ref 标记「当前最新请求的图片 ID」，防止竞态 |

**流程**：
1. 用户切换图片 → `image` prop 变化，但 `displayImage` 仍显示旧图
2. 隐藏的 `<img>` 标签开始预加载新图
3. 加载完成触发 `onLoad` → 校验 `image.id === currentIdRef.current`（防止旧请求晚到覆盖新图）
4. 校验通过后替换 `displayImage`，隐藏 spinner，完成平滑过渡
5. 加载期间旧图以 50% 透明度 + 居中 spinner 提示用户

### 2. 图片加载失败处理

**网格缩略图**（[ImageGrid.tsx#L18-L86](src/components/ImageGrid.tsx#L18-L86)）：
- 每张图的 `<img>` 绑定 `onError` → 设置 `errorStates[id] = true`
- 失败时替换渲染为：破损图标 + "加载失败" 文字 + 「重试」按钮
- 重试按钮点击时递增 `retryKeys[id]`，因为 `<img key>` 变化，React 卸载旧节点挂载新节点，浏览器重新发起请求

**模态框大图**（[ImageModal.tsx#L155-L218](src/components/ImageModal.tsx#L155-L218)）：
- 隐藏的预加载 `<img>` 的 `onError` 设置 `hasError = true`
- 显示区域覆盖半透明遮罩，渲染失败图标 + "图片加载失败" + 「重新加载」按钮
- 重试通过递增 `retryKey` state 实现（原理同上）

### 3. 键盘快捷键

**实现位置**：[ImageModal.tsx#L50-L72](src/components/ImageModal.tsx#L50-L72)

在 `useEffect` 中给 `document` 注册 `keydown` 事件监听：

| 按键 | 行为 |
|------|------|
| `Escape` | 调用 `onClose()` 关闭模态框 |
| `ArrowLeft` | 调用 `goToPrev()` 切换上一张（边界保护：第一张不响应）|
| `ArrowRight` | 调用 `goToNext()` 切换下一张（边界保护：最后一张不响应）|

**设计要点**：
- 事件绑定在 `document` 而非某个元素，保证无论焦点在哪都能响应
- 方向键用 `e.preventDefault()` 避免页面滚动
- `useEffect` 返回清理函数移除监听，防止内存泄漏和重复绑定
- 依赖数组包含 `[image, onClose, goToPrev, goToNext]`，其中 `goToPrev/Next` 用 `useCallback` 缓存避免频繁重绑

### 4. 收藏功能与 localStorage 持久化

**数据结构**：`Set<number>`（[App.tsx#L44](src/App.tsx#L44-L44)）
- 查找：`favoriteIds.has(id)` → O(1)
- 插入/删除：不可变更新 `new Set(prev)` 后 `add/delete`

**写入时机**（[App.tsx#L47-L53](src/App.tsx#L47-L53)）：
- `useEffect(() => { localStorage.setItem(...) }, [favoriteIds])`
- 每当收藏集合变化，自动同步到 localStorage
- 存储格式：`JSON.stringify(Array.from(set))` → 例如 `"[1, 5, 12]"`

**读取时机**（[App.tsx#L29-L40](src/App.tsx#L29-L40)）：
- `useState` 惰性初始化：`useState(() => loadFavorites())`
- 只在组件首次挂载时执行一次，从 localStorage 恢复
- 包裹 `try/catch`，若 JSON 损坏或 localStorage 禁用，静默返回空 Set

### 5. 爱心图标（纯 CSS/Tailwind 实现）

**原理**：3 个 `<span>` 元素组合成心形（[App.tsx#L103-L122](src/App.tsx#L103-L122) 等处）

```
    ╱╲    ╱╲          ← 两个圆角矩形（左右瓣）
   ╱  ╲  ╱  ╲
  ╱    ╲╱    ╲
  ╲        ╱
   ╲      ╱          ← 一个旋转 45° 的方块（底部尖端）
    ╲    ╱
     ╲  ╱
      ╲╱
```

| 元素 | Tailwind 类 | 作用 |
|------|-------------|------|
| 左瓣 | `rounded-t-full -rotate-45 origin-bottom-left` | 左上圆角矩形，以左下角为原点逆时针旋转 45° |
| 右瓣 | `rounded-t-full rotate-45 origin-bottom-right` | 右上圆角矩形，以右下角为原点顺时针旋转 45° |
| 底部 | `rotate-45` | 正方形旋转 45° 形成 V 字底 |

用 `relative + absolute` 定位将三者叠加在同一个容器中。颜色切换通过条件类名 + `transition-colors duration-200` 实现平滑过渡。

### 6. 收藏视图切换与空状态

**视图过滤**（[App.tsx#L79-L81](src/App.tsx#L79-L81)）：
```typescript
const displayImages = showFavorites
  ? IMAGES.filter((img) => favoriteIds.has(img.id))
  : IMAGES;
```

**条件渲染**（[App.tsx#L127-L150](src/App.tsx#L127-L150)）：
- `showFavorites === true && displayImages.length === 0` → 渲染空状态提示
- 否则 → 渲染 `<ImageGrid images={displayImages} ... />`

**空状态内容**：大号灰色爱心图标 + 标题「还没有收藏任何图片」+ 引导文字。

---

## 数据流与状态管理

项目采用 **React Hooks 原生方案**（`useState` + `useEffect`），未引入 Redux、Zustand 等状态管理库。

### 状态分类

| 状态 | 位置 | 类型 | 说明 |
|------|------|------|------|
| `selectedImage` | App | 全局 state | 模态框当前图片 |
| `favoriteIds` | App | 全局 state + localStorage | 收藏集合 |
| `showFavorites` | App | 全局 state | 视图切换标记 |
| `displayImage` | ImageModal | 内部 state | 已加载完成、实际显示的图片 |
| `isLoading` | ImageModal | 内部 state | 大图加载中 |
| `hasError` | ImageModal | 内部 state | 大图加载失败 |
| `retryKey` | ImageModal | 内部 state | 重试触发键 |
| `errorStates` | ImageGrid | 内部 state | 各缩略图加载失败状态 |
| `retryKeys` | ImageGrid | 内部 state | 各缩略图重试触发键 |

### Props 传递方向

```
App ──images, favoriteIds──▶ ImageGrid（单向，只读）
App ──onImageClick──────────▶ ImageGrid（回调）
App ──image, images, favoriteIds──▶ ImageModal（单向，只读）
App ◀──onClose / onSelectImage / onToggleFavorite── ImageModal（回调）
```

### localStorage 容错

- **读取**：`try/catch` 包裹 `JSON.parse`，数据损坏时回退到空 Set
- **写入**：`try/catch` 包裹 `localStorage.setItem`，隐私模式或配额不足时静默失败不崩溃

---

## 运行方式

### 环境要求

- Node.js ≥ 18
- npm / pnpm / yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

Vite 默认在 http://localhost:5173 启动（若被占用会自动尝试 5174、5175...），终端会打印实际地址。

### 构建生产版本

```bash
npm run build
```

先执行 `tsc -b` 类型检查，通过后再由 Vite 打包，产物输出到 `dist/` 目录。

### 本地预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

运行 ESLint 检查代码质量与规范。
