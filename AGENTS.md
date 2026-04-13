# AGENTS.md

本文件供 AI 助手在本仓库内协作使用，汇总关键文档、配置与工作流，确保行为一致、效率可控。

## 仓库结构
- `packages/`: 主要包（core、editor、框架适配、插件、yjs）
- `shared/rollup-config/`: 共享构建配置
- `docs/`: 开发/测试/发布指南
- `packages/*/__tests__/`: 单元测试，按包组织
- `tests/`: 测试基础设施与工具（setup、utils）
- `tests/e2e/`: E2E 测试
- `scripts/`: 构建辅助脚本

## 关键包职责
- `packages/core/`: 核心引擎（Slate 模型、视图/选择区、菜单体系、HTML 解析与生成、插件注册）。
- `packages/editor/`: 组合入口与 Boot，注册内置模块、创建 editor/toolbar、默认配置。
- `packages/basic-modules/`: 默认内置基础模块集合。
- `packages/list-module/`、`packages/table-module/`、`packages/video-module/`、`packages/upload-image-module/`、`packages/code-highlight/`: 默认内置模块。
- `packages/plugin-*`: 可选插件（如 markdown、mention、formula、link-card、float-image）。
- `packages/editor-for-react/`: React 适配层。
- `packages/yjs/`、`packages/yjs-for-react/`、`packages/yjs-for-vue/`: 协同编辑相关。

## 工具与环境
- pnpm workspaces + Turbo 的 monorepo。
- 包管理器：`pnpm@9.15.0`（见 `package.json`）。
- Node 版本：`package.json` 指定 `^22.13.0`（文档里有 18+，以 engines 为准）。
- 版本管理与发版：Changesets。
- 提交信息规范：commitlint（Conventional Commits）。

## 常用命令
- 安装依赖：`pnpm install`
- 开发/构建：`pnpm dev`、`pnpm build`
- 运行 editor 示例：`pnpm example`（浏览器打开 `http://localhost:8881/examples/`）
- Lint/格式化：`pnpm lint`、`pnpm lint:fix`、`pnpm format`
- 单测：`pnpm test`，覆盖率 `pnpm test-c`
- E2E：`pnpm e2e:dev`、`pnpm e2e`
- Changeset：`npx changeset`

## 测试注意
- 单元测试位于 `packages/<package>/__tests__/`。
- E2E 测试位于 `tests/e2e/`。
- 若修改了 `packages/core` 的 API，需要执行 `pnpm build` 让其他包读取最新产物。

## 开源项目工作原则（强约束）
- 默认把改动视为“公开 API/行为变更”，优先保证兼容性与可回滚性，而不是仅“当前需求可用”。
- 任何涉及导入/导出（`parseHtml`、`toHtml`、`renderStyle`）的改动，必须验证“回环不丢失”：
  `HTML -> Slate -> HTML`、`Slate -> HTML -> Slate`。
- 默认行为不可破坏：新增配置项必须有明确默认值，且默认行为与历史版本一致。
- 禁止隐式跨包耦合：一个包新增 class/data 语义时，必须在依赖关系、样式来源、文档中显式声明。
- patch/minor 发布禁止引入“静默降级”：如样式数据存在但展示失效、解析吞值、导出不可逆。

## PR 质量门禁（可合并前必须满足）
- 必跑：`pnpm build`（全仓）通过。
- 必跑：受影响包测试 + 关键依赖包测试（至少覆盖 `core`、变更包、直接受影响包）。
- 必查：若改动导入/导出链路，新增对应的回环测试（round-trip）与跨模式测试。
- 必查：若新增配置项，补齐类型定义、默认值测试、文档说明。
- 必查：Changeset 与变更范围一致（包级别准确、语义化版本合理）。
- 必查：对外行为变更需在 PR 描述中提供“风险清单 + 回滚策略”。

## 兼容性测试矩阵（涉及样式/序列化时强制执行）
- 模式维度：`inline` / `class`。
- 数据来源维度：默认配置值 / 自定义配置值（如自定义颜色、字体、行高等）。
- 路径维度：
  `render`（编辑态渲染）、`toHtml`（导出）、`parseHtml`（导入）。
- 回环维度：
  `setHtml(getHtml())`、`toHtml(parseHtml(html))`。
- 历史兼容维度：至少覆盖 v4/v5 兼容入口（如存在 pre-parse 逻辑）。

## 发版阻断条件（任一命中即不可发版）
- 存在会导致样式/数据“可导出不可展示”或“可展示不可回读”的缺陷。
- 存在未声明的行为变化（默认值变化、输出结构变化、属性语义变化）。
- 存在跨包依赖假设但未在依赖/文档/测试中显式体现。
- 仅在单一路径通过测试，缺失关键路径（render / toHtml / parseHtml / round-trip）验证。

## AI 助手执行规范（面向开源长期维护）
- 结论必须基于可复现证据（命令、测试、构建结果），不得凭“经验判断可发版”。
- 评审结论默认分级：`阻断问题`、`高风险`、`可接受风险`，并给出处理建议。
- 若仓库存在历史 lint 噪音，至少要保证“本次变更文件 lint 通过”并在结论中显式说明范围。
- 对“是否可合并发版”的回答必须明确：`可合并发版` / `可合并但不建议立即发版` / `不可合并发版`。

## 核心数据流与扩展点
- 渲染链路：`HTML -> JSON content -> VDOM -> DOM`，同时支持 `content -> HTML` 输出。
- 菜单系统支持：classic toolbar、hovering toolbar、tooltip、contextMenu。
- 模块注册：使用 `Boot.registerModule`，必须在创建编辑器之前注册且只注册一次。
- 模块扩展项（见 `packages/editor/src/register-builtin-modules/register.ts`）：
  `menus`、`renderElems`、`renderStyle`、`elemsToHtml`、`styleToHtml`、`preParseHtml`、`parseElemsHtml`、`parseStyleHtml`、`editorPlugin`。

## 常见改动定位
- 核心数据/渲染/HTML 转换：`packages/core/src/`。
- 内置模块注册与默认配置：`packages/editor/src/register-builtin-modules/`、`packages/editor/src/init-default-config/`。
- 新增模块/插件：实现 `IModuleConf` 并通过 `Boot.registerModule` 注册；内置模块需加入注册列表。

## 代码风格与规范
- `.editorconfig`: 2 空格缩进、LF、最大行宽 100、去除行尾空格。
- Prettier（`.prettierrc.cjs`）：单引号、无分号、行宽 100、ES5 尾逗号、箭头函数单参省略括号。
- ESLint（`.eslintrc.cjs`）：airbnb-base + TS/Vue 规则、simple-import-sort、禁止 `console`（允许 warn/error）、禁止从 `.` 或 `..` 导入（改用 index）。

## 提交与 PR
- 从 `master` 分支拉新分支。
- 分支命名规范（富文本编辑器项目）：
  - 规则：`<type>/<scope>/<short-desc>`
  - type 取值：`feat` `fix` `refactor` `docs` `test` `perf` `chore` `ci` `style` `build` `revert`
  - scope：包名或领域（如 `core` `editor` `basic-modules` `table-module` `tests` `docs`）
  - short-desc：小写英文与数字，使用 `-` 连接
  - 示例：`test/core/async-tests`、`fix/editor/fullscreen-icon`、`docs/readme/update-usage`
- 提交信息格式（见 `CONTRIBUTING.md`）：
  - 类型：`feat`、`fix`、`refactor`、`docs`、`test`、`perf`、`chore`、`ci`、`style`、`build`、`revert`
  - 格式：
    ```
    type(scope): 简要标题

    详细描述

    相关 issue 链接
    ```
- 提交前运行测试和 lint。
- 修改任何 package 时，PR 需要包含 Changeset。

## 发布流程（docs/publish.md）
- 正式版本：添加 Changeset，合并到 master 后 CI 自动发布到 npm。
- 预发布：`npx changeset pre enter beta` → `npx changeset` → `npx changeset version` → `npx changeset publish` → `npx changeset pre exit`（可选）。

## 其他约定
- 依赖管理：合理区分 `peerDependencies` 与 `dependencies`，避免重复打包第三方库。
- 包体积分析：在目标包内执行 `pnpm size-stats`，输出 `packages/<pkg>/stats.html`。
- 修改代码并重新打包后，需要强制刷新浏览器。
