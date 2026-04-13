# class 模式与 CSP 配置

本文说明 `textStyleMode: 'class'` 的行为边界、扩展方式与发布检查点。

## 目标

在严格 CSP 场景下，尽量减少内联 `style` 输出，同时保证导入导出可回读。

## 配置项

```ts
const editorConfig = {
  textStyleMode: 'class',
  classStylePolicy: 'preserve-data',
  styleClassTokens: {
    color: ['rgb(1, 2, 3)'],
  },
  onClassStyleUnsupported(payload) {
    // 记录日志、上报监控
  },
}
```

## 快速接入

1. 启用 `textStyleMode: 'class'`。
2. 选择 `classStylePolicy`（建议从 `preserve-data` 开始）。
3. 确保已引入编辑器样式：
   - 例如 React/Vue 项目可引入 `@wangeditor-next/editor/dist/css/style.css`。
4. 如使用 `styleClassTokens` 扩展 token，需业务侧补充 CSS。

自定义 token 建议优先基于 `data-w-e-*` 写样式，而不是依赖 hash class 名：

```css
[data-w-e-color="rgb(1, 2, 3)"] { color: rgb(1, 2, 3); }
[data-w-e-font-size="20px"] { font-size: 20px; }
[data-w-e-line-height="2"] { line-height: 2; }
```

- `textStyleMode`
  - `inline`（默认）：输出内联样式。
  - `class`：输出 `class + data-w-e-*`。
- `classStylePolicy`（仅 class 模式生效）
  - `preserve-data`（默认）：输出 `data-w-e-*`，不输出 class/inline。
  - `fallback-inline`：输出 `data-w-e-*`，并回退内联样式。
  - `strict`：遇到未注册 token 直接抛错。
- `styleClassTokens`
  - 用于扩展 class 模式的可接受 token 集合。
  - 仅注册 token，不自动注入 CSS，业务方需自行提供样式规则。
- `onClassStyleUnsupported`
  - 未注册 token 的通知回调，包含 `type/value/scene/fallback/message`。

## 受支持的文本样式 token

- `color`
- `bgColor`
- `fontSize`
- `fontFamily`
- `textAlign`
- `lineHeight`
- `indent`

## 模块行为约定

- `basic-modules`
  - 文本样式在 class 模式下走 `class + data-w-e-*`。
  - 未注册 token 按 `classStylePolicy` 处理。
- `list-module`
  - 列表前缀颜色 class 使用 `w-e-list-color-*`，不再复用 `w-e-color-*`。
  - 颜色值仍通过 `data-w-e-color` 保留，保证回读。
- `table-module`
  - `border-style` 在 class 模式仅支持标准单值（如 `solid`、`dashed`）。
  - 复合值（如 `dotted solid dashed`）按 `classStylePolicy` 处理。
- `video-module` / `image` / `plugin-float-image`
  - 宽高、对齐等输出优先走 `class/data`，避免内联样式。

## 回环保证（必须验证）

- `HTML -> Slate -> HTML`
- `Slate -> HTML -> Slate`
- `setHtml(getHtml())`

建议覆盖以下矩阵：

- 模式：`inline` / `class`
- 策略：`preserve-data` / `fallback-inline` / `strict`
- 数据：默认 token / 自定义 token（`styleClassTokens`）
- 路径：`render` / `toHtml` / `parseHtml`

## 兼容性提示

- 默认行为保持兼容：`textStyleMode: 'inline'`、`classStylePolicy: 'preserve-data'`。
- 选择 `strict` 前，应先补齐 `styleClassTokens` 与业务 CSS，避免线上导出失败。
