# 测试优化 TODO

本文件汇总当前测试体系的优化点与执行顺序，后续按步骤逐步改进。

## 现状与问题清单
- 文档与实际不一致：`docs/test.md` 与 `AGENTS.md` 仍描述 Jest + `tests/units`，实际使用 Vitest + `packages/*/__tests__`。
- editor 生命周期不一致：`tests/utils/create-editor.ts` 会注册全局清理，但 `packages/core/__tests__/create-core-editor.ts` 与 `packages/editor/__tests__/create.test.ts` 创建的 editor 未统一回收。
- 模块级共享 editor：部分测试在模块顶层创建 editor（如 `packages/basic-modules/__tests__/text-style/menu/menus.test.ts`、`packages/basic-modules/__tests__/header/menu/header-menu.test.ts`），易产生跨用例污染。
- 覆盖率盲区：`plugin-*`、`yjs*`、`editor-for-react` 等包未纳入 coverage include，且缺少基础测试。
- E2E 覆盖过浅：仅验证创建编辑器，缺少核心交互路径。
- 测试容错过强：`--dangerouslyIgnoreUnhandledErrors` + `NODE_OPTIONS=--unhandled-rejections=warn` 可能掩盖异常。
- 测试工具重复：大量重复的 content/选区/DOM 操作，缺少统一 fixtures 工具库。

## 优化执行顺序
### Phase 0：文档与约定统一（低成本高收益）
- 更新 `docs/test.md`：改为 Vitest + `packages/*/__tests__` 的真实目录与命令说明。
- 更新 `AGENTS.md`：同步测试目录结构与工具说明。

### Phase 1：测试稳定性与生命周期统一
- 统一 editor 清理：让 `packages/core/__tests__/create-core-editor.ts` 与 `packages/editor/__tests__/create.test.ts` 创建的 editor 也加入全局 cleanup。
- 禁止模块级共享 editor：改为 `beforeEach` 创建、`afterEach` 销毁。
- 在 `tests/setup/index.ts` 增加兜底清理策略（仅销毁本次创建的 editor 集合）。

### Phase 2：覆盖率与包覆盖补齐
- 扩展 `vitest.config.mts` 的 coverage include 与 alias，纳入 `plugin-*`、`yjs*`、`editor-for-react` 等包。
- 在缺失包新增最小 smoke tests（create/parse/render/plugin 注册）。
- 更新 `scripts/test-coverage-split.js`，增加对应包的分片覆盖率执行。

### Phase 3：E2E 主路径覆盖
- 新增 3-5 个核心用例：输入、撤销/重做、菜单加粗斜体、列表、表格、图片/视频上传模拟。
- 在 example 页面补充稳定的 `data-testid` 选择器。

### Phase 4：严格性与质量门槛
- 逐步移除 `--dangerouslyIgnoreUnhandledErrors`，改为仅对历史不稳定用例放行。
- 添加 coverage threshold（包级或全局）。
- 抽象通用测试工具：`flushPromises`、`createContentFactory`、DOM helper，减少重复样板。

## 执行记录
- [ ] Phase 0 文档更新
- [ ] Phase 1 生命周期统一
- [ ] Phase 2 覆盖率补齐
- [ ] Phase 3 E2E 覆盖
- [ ] Phase 4 质量门槛
