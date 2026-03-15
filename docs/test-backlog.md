# 测试补全 Backlog

本文档只记录 `wangEditor` 本体当前仍然缺失、但值得补齐的高价值测试。

范围：
- `packages/core`
- `packages/editor`
- `packages/basic-modules`
- `packages/list-module`
- `packages/table-module`
- `packages/upload-image-module`
- `packages/video-module`
- `tests/e2e`

暂不纳入本轮：
- `plugin-*`
- `yjs*`
- `editor-for-react`

## P0
- [ ] `tests/e2e`：补 `create -> destroy -> recreate` 生命周期用例
  目标：防止 editor/toolbar DOM 没清干净，或重复创建后状态异常。

- [ ] `tests/e2e`：补 `simple mode` 最小冒烟
  目标：验证 simple 模式工具栏、hoverbar、内容编辑链路没有和 default 模式一起回归。

- [ ] `tests/e2e`：补富文本粘贴场景
  目标：不仅测 plain text，还要覆盖 HTML paste 到 paragraph、list、table cell 的结果。

- [ ] `tests/e2e`：补 `setHtml` 关键回归场景
  目标：覆盖空字符串、table 后跟 paragraph、含样式文本、含 list 的回填结果。

- [ ] `packages/core/__tests__/text-area/event-handlers/`：补 `customPaste` 返回 `true` 的分支
  目标：现在只测了拦截默认粘贴，缺少继续默认粘贴的路径。

- [ ] `packages/core/__tests__/text-area/event-handlers/`：补更完整的 selection 边界
  目标：覆盖 void 节点前后、table 前后、空 block 内的移动/删除行为。

## P1
- [ ] `packages/editor/__tests__/create.test.ts`：补 `destroy` 后再次 `createEditor/createToolbar`
  目标：验证销毁后的容器可安全复用。

- [ ] `packages/editor/__tests__/create.test.ts`：补 `selector` 使用 DOMElement 与字符串两种路径
  目标：避免只测一种入参形式。

- [ ] `packages/core/__tests__/editor/plugins/with-content.test.ts`：补 `setHtml` 与 selection/disabled/focus 组合场景
  目标：覆盖“已有选区”“失焦状态”“禁用状态”下的内容替换稳定性。

- [ ] `packages/basic-modules/__tests__/image/`：补 `checkImage/parseImageSrc` 异步分支
  目标：现在 helper 有覆盖，但缺少更接近菜单执行链路的测试。

- [ ] `packages/video-module/__tests__/`：补 `parseVideoSrc` 与插入链路组合测试
  目标：覆盖 video 真正插入前的校验、转换和失败分支。

- [ ] `packages/table-module/__tests__/`：补 `merge/split cell` 行为测试
  目标：这是 table 最容易回归的编辑能力之一，目前覆盖不足。

- [ ] `packages/table-module/__tests__/`：补 table property / cell property 菜单测试
  目标：覆盖表格属性修改是否真正写回节点。

## P2
- [ ] `tests/e2e`：补 table 高级交互用例
  目标：覆盖 merge、split、header、full-width、property 变更。

- [ ] `tests/e2e`：补图片编辑链路
  目标：覆盖插入后改尺寸、查看链接、删除图片。

- [ ] `tests/e2e`：补视频插入链路
  目标：覆盖插入 video、uploadVideo、自定义 poster/src。

- [ ] `tests/e2e`：补只读态下菜单禁用与交互阻断
  目标：不仅测 `contenteditable=false`，还要测菜单不可执行。

- [ ] `tests/e2e`：补 undo/redo 跨模块链路
  目标：覆盖列表、表格、图片等结构化节点上的撤销恢复。

## 收敛标准
- 先补 P0，再决定是否继续做 P1/P2。
- 每补一类测试，优先验证“真实用户路径”而不是只补导出测试。
- 新增测试应优先避免实现细节耦合，尽量断言行为结果和最终文档结构。
