# wangEditor-next

本文件说明如何在 `wangEditor-next` monorepo 中协作开发。目标是让人类和 AI 助手都能快速定位、正确修改、可验证交付。

---

## 项目定位

`wangEditor-next` 是一个可扩展的富文本编辑器体系，核心在 `packages/core`，通过 `editor` 组合层和多个内置/可选模块提供能力。

关键约束：
- 默认把改动视为公开 API 或公开行为变更，优先兼容性和可回滚性。
- 导入/导出链路（`parseHtml`、`toHtml`、`renderStyle`）的修改必须证明可回环、不丢失。
- 新增配置必须有明确默认值，且默认行为与历史版本一致。

---

## 仓库结构

```txt
.
├─ packages/                  # 核心包、内置模块、插件、框架适配、yjs
│  ├─ core/                   # 核心引擎（模型/渲染/HTML 转换/插件注册）
│  ├─ editor/                 # 组合入口与 Boot，注册内置模块和默认配置
│  ├─ basic-modules/          # 默认基础模块集合
│  ├─ *-module/               # list/table/video/upload-image/code-highlight 等
│  ├─ plugin-*/               # 可选插件（markdown/mention/formula/link-card...）
│  ├─ editor-for-react/       # React 适配层
│  └─ yjs*                    # 协同编辑相关
├─ apps/                      # 示例与应用层工作区
├─ shared/rollup-config/      # 共享构建配置
├─ tests/                     # 测试基础设施与 e2e
│  └─ e2e/                    # Playwright E2E
├─ docs/                      # 开发/测试/发布文档
└─ scripts/                   # 构建与辅助脚本
```

---

## 环境与工具

- Node: `^22.13.0`（以 `package.json#engines` 为准）
- Package Manager: `pnpm@9.15.0`
- Monorepo: `pnpm workspaces` + `turbo`
- Versioning/Release: `changesets`
- Commit 规范：`commitlint`（Conventional Commits）

---

## 常用命令

- 安装依赖：`pnpm install`
- 开发：`pnpm dev`
- 全仓构建：`pnpm build`
- 示例（HTML demo）：`pnpm example`（`http://localhost:8881/examples/`）
- 单测：`pnpm test`
- 覆盖率：`pnpm test-c`
- E2E（UI 模式）：`pnpm e2e:dev`
- E2E（CI 模式）：`pnpm e2e`
- 跨浏览器冒烟：`pnpm e2e:matrix`
- 性能基准：`pnpm e2e:perf`
- Lint：`pnpm lint`
- Lint 自动修复：`pnpm lint:fix`
- 格式化：`pnpm format`
- Changeset：`pnpm changeset`

---

## 改动定位

- 核心数据/渲染/HTML 转换：`packages/core/src/`
- 内置模块注册：`packages/editor/src/register-builtin-modules/`
- 默认配置：`packages/editor/src/init-default-config/`
- 模块扩展项定义：`packages/editor/src/register-builtin-modules/register.ts`
  - `menus`
  - `renderElems`
  - `renderStyle`
  - `elemsToHtml`
  - `styleToHtml`
  - `preParseHtml`
  - `parseElemsHtml`
  - `parseStyleHtml`
  - `editorPlugin`

---

## 强约束（必须遵守）

### 1) 导入导出回环不丢失

涉及 `parseHtml` / `toHtml` / `renderStyle` 的变更，必须验证：
- `HTML -> Slate -> HTML`
- `Slate -> HTML -> Slate`
- `setHtml(getHtml())`
- `toHtml(parseHtml(html))`

### 2) 禁止隐式跨包语义耦合

若新增 class/data/属性语义，必须在以下位置显式对齐：
- 依赖关系
- 样式来源
- 文档说明
- 测试覆盖

### 3) patch/minor 禁止静默降级

不得出现：
- 样式数据“可导出不可展示”
- 样式数据“可展示不可回读”
- 解析吞值、不可逆转换
- 未声明默认值变更或输出结构变更

---

## 兼容性测试矩阵（样式/序列化改动时强制）

- 模式：`inline` / `class`
- 数据来源：默认配置值 / 自定义配置值
- 路径：`render` / `toHtml` / `parseHtml`
- 回环：`setHtml(getHtml())` / `toHtml(parseHtml(html))`
- 历史兼容：至少覆盖 v4/v5 兼容入口（如存在 pre-parse）

---

## PR 前验证清单

提交前至少完成：
- `pnpm build` 全仓通过
- 受影响包测试通过 + 关键依赖包测试通过（至少 `core`、变更包、直接受影响包）
- 若改动导入/导出链路：补齐 round-trip 与跨模式测试
- 若新增配置项：补齐类型定义、默认值测试、文档说明
- 对外行为变更：PR 描述包含风险清单和回滚策略
- 任意 package 变更：PR 包含对应 Changeset

---

## 发版阻断条件（任一命中即不可发版）

- 存在样式/数据“可导出不可展示”或“可展示不可回读”缺陷
- 存在未声明行为变化（默认值、输出结构、属性语义）
- 存在跨包依赖假设但未在依赖/文档/测试显式体现
- 仅验证单一路径，缺失 `render` / `toHtml` / `parseHtml` / round-trip 关键验证

---

## 提交与分支规范

- 从 `master` 拉分支
- 分支命名：`<type>/<scope>/<short-desc>`
- `type`：`feat` `fix` `refactor` `docs` `test` `perf` `chore` `ci` `style` `build` `revert`
- 示例：`fix/editor/fullscreen-icon`、`test/core/async-tests`
- 提交信息格式：

```txt
type(scope): 简要标题

详细描述

相关 issue 链接
```

---

## AI 助手执行规范

- 结论必须基于可复现证据（命令、测试、构建结果），禁止仅凭经验判断。
- 评审默认分级：`阻断问题`、`高风险`、`可接受风险`。
- 若存在历史 lint 噪音，至少保证“本次改动文件 lint 通过”，并明确说明验证范围。
- 对“是否可合并发版”必须给出明确结论：
  - `可合并发版`
  - `可合并但不建议立即发版`
  - `不可合并发版`
- 默认小步提交、单一目的变更，避免一次 PR 混入多类无关改动。

---

## 代码风格

- `.editorconfig`：2 空格、LF、最大行宽 100、去除行尾空格
- Prettier（`.prettierrc.cjs`）：单引号、无分号、行宽 100、ES5 尾逗号
- ESLint（`.eslintrc.cjs`）：airbnb-base + TS/Vue + import 排序；禁止 `console`（`warn/error` 例外）

---

## 发布流程

- 正式发布：新增 Changeset，合并到 `master` 后由 CI 自动发布 npm
- 预发布：
  - `pnpm changeset pre enter beta`
  - `pnpm changeset`
  - `pnpm version:release`
  - `pnpm publish`
  - `pnpm changeset pre exit`（可选）

---

## 附加约定

- 依赖管理：合理区分 `peerDependencies` 与 `dependencies`，避免重复打包第三方库。
- 包体积分析：在目标包内执行 `pnpm size-stats`，输出 `packages/<pkg>/stats.html`。
- 修改代码并重新打包后，需强制刷新浏览器再验证。
