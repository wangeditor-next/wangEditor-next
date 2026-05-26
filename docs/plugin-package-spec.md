# plugin-* 包统一规范

本文档定义 `packages/plugin-*` 的统一结构与交付检查项，用于后续新增插件时快速对齐。

## 1. 适用范围

- 目录：`packages/plugin-*`
- 包名：`@wangeditor-next/plugin-xxx`
- 目标：保证插件在构建、发布、测试、文档、配置上的一致性

## 2. 标准目录结构

```txt
packages/plugin-xxx/
├─ src/
│  ├─ index.ts
│  ├─ constants/               # 可选：图标、常量
│  ├─ utils/                   # 可选：dom utils / shared helper
│  └─ module/
│     ├─ index.ts
│     ├─ plugin.ts             # editorPlugin
│     ├─ local.ts              # 可选：i18n 文案
│     ├─ custom-types.ts       # 可选：自定义节点类型
│     ├─ render-elem.ts        # 可选：renderElems
│     ├─ elem-to-html.ts       # 可选：elemsToHtml
│     ├─ parse-elem-html.ts    # 可选：parseElemsHtml
│     └─ menu/                 # 可选：菜单实现
├─ __tests__/
│  ├─ module.test.ts
│  └─ ...
├─ package.json
├─ rollup.config.js
├─ tsconfig.json
├─ README.md
├─ README-en.md
└─ CHANGELOG.md
```

## 3. package.json 统一约束

必须与现有插件保持同构字段：

- `type: "module"`
- `main/module/types/exports/files/publishConfig/repository/bugs`
- 构建脚本统一：
  - `dev`
  - `dev-watch`
  - `build`
  - `dev-size-stats`
  - `size-stats`
- `devDependencies` 至少包含 `@wangeditor-next-shared/rollup-config`
- `peerDependencies` 仅声明运行时必须由宿主提供的依赖（通常至少有 `@wangeditor-next/editor`，按需加 `dom7`、`snabbdom`）

## 4. 源码模块规范

### 4.1 入口

- `src/index.ts` 仅做模块导出（`export default module`）
- `src/module/index.ts` 汇总 `IModuleConf`

### 4.2 editorPlugin

- 插件行为通过 `editorPlugin` 注入
- 只重写必须的方法（如 `insertBreak` / `isVoid` / `isInline`）
- 避免兜底式逻辑，优先保证行为可预期

### 4.3 自定义元素链路（如有）

涉及自定义节点时必须成对实现并验证：

- `renderElems`
- `elemsToHtml`
- `parseElemsHtml`

并确保 round-trip 稳定：

- `elem -> html -> elem`
- `html -> elem -> html`

### 4.4 菜单（如有）

- 菜单注册通过 `menus` 数组输出
- 默认配置统一通过 `config` 暴露到 `editorConfig.MENU_CONF[key]`
- 涉及上传能力时，优先复用 `createUploader`

## 5. 测试基线

每个新插件至少包含：

- `module.test.ts`：模块导出结构
- `plugin.test.ts`：核心插件行为

按能力增加：

- 自定义元素：`elem-to-html` / `parse-html` / round-trip
- 菜单：`isDisabled` / `exec` / `getValue`
- 上传 helper：`customUpload` / 默认上传 / 回调触发
- i18n：`local.test.ts`

## 6. 文档基线

每个插件必须有：

- `README.md`（中文）
- `README-en.md`（英文）
- `CHANGELOG.md`

README 至少包含：

- 插件介绍
- 安装方式
- 注册方式（`Boot.registerModule(...)`）
- 关键配置说明
-（如适用）HTML 输出格式

## 7. 提交流程

新增或修改 `plugin-*` 时，必须同时完成：

1. 增加/更新插件代码与测试
2. 更新 `pnpm-lock.yaml`
3. 增加 changeset（`.changeset/*.md`）
4. 通过定向测试与构建

推荐验证命令（按实际包名替换）：

```sh
pnpm exec vitest run packages/plugin-xxx/__tests__
pnpm --filter @wangeditor-next/plugin-xxx build
```

## 8. 可复用脚手架参考

本仓库现有实现可作为直接模板：

- 轻量行为类插件：`packages/plugin-ctrl-enter`
- 元素 + 菜单 + 上传链路：`packages/plugin-attachment`
- 元素型插件：`packages/plugin-mention` / `packages/plugin-link-card`
- 行为型插件：`packages/plugin-markdown`
