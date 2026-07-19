# v6 兼容策略与清理边界

`@wangeditor-next/editor@6` 的发布不代表 monorepo 内所有包都进入了同一个主版本。
兼容代码由实际提供该行为的包负责，只有该包进入下一个主版本，才能删除已公开的旧 API。

仓库使用 [`v6-compatibility-inventory.json`](./v6-compatibility-inventory.json) 记录已确认的兼容入口。
修改清单后运行：

```bash
pnpm check:compatibility
```

## 分类

| 分类                  | 含义                                       | 删除条件                                           |
| --------------------- | ------------------------------------------ | -------------------------------------------------- |
| `public-api`          | 仍在类型或运行时导出中公开的旧调用方式     | 已弃用、有迁移路径，且所属包进入清单指定的主版本   |
| `stored-data`         | 读取历史 HTML、JSON 或服务端响应的转换逻辑 | 有数据迁移方案，并完成导入、导出和 round-trip 验证 |
| `runtime-environment` | 浏览器、SSR 或事件能力差异的兜底           | 仓库先提高并公布运行环境基线，再完成目标环境验证   |

`stored-data` 兼容不是待删除的普通技术债。即使编辑器 API 升级，用户已有内容仍可能长期包含旧格式。
这类逻辑原则上保留；如果迁移到独立 legacy parser，也必须保持默认可读且不丢失。

## 当前结论

- `@wangeditor-next/core` 根入口的 `createUploader` 和 `createUppyUploader` 已弃用。新代码应从
  `@wangeditor-next/core/upload` 导入，根入口最早在 `core@2` 删除。
- `IToolbarConfig.insertKeys` 的单对象/字符串形式和 `IDomEditor.move(distance, reverse)` 仍是
  `core@1` 的公开类型，不能在 `core@1.x` 静默删除。
- v4/v5 HTML 预解析、旧 list JSON、旧上传响应和历史媒体/表格属性属于持久化数据兼容，
  不能仅因为 `editor@6` 发布而删除。
- 浏览器与 Node/SSR polyfill 的删除需要单独确定 browserslist 和 SSR 支持基线。

完整路径和状态见兼容清单。

## 变更流程

1. 修改兼容代码前，先在清单中确认所有者包、分类和删除条件。
2. 删除 `public-api` 前提供弃用周期、迁移说明和对应包的 major changeset。
3. 修改 `stored-data` 时覆盖 `HTML -> Slate -> HTML`、`Slate -> HTML -> Slate`、
   `setHtml(getHtml())` 和 `toHtml(parseHtml(html))` 中受影响的路径。
4. 修改 `runtime-environment` 前更新支持基线，并在对应浏览器或 SSR 环境实测。
5. PR 中运行 `pnpm check:compatibility`；新增兼容分支时同步更新清单。

## 不应执行的清理

- 不依据注释中出现“兼容”“旧版”等文字直接删除代码。
- 不把 `editor` 的主版本当作所有 workspace 包的破坏性变更许可。
- 不用一次性的 HTML 转换替代默认可读的历史数据支持，除非已提供可验证的数据迁移工具。
