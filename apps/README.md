# Demo Apps

统一维护 wangEditor-next 的示例应用，避免 demo 分散在多个仓库或多个 package 内。

## 当前 demo

- `demo-html`: HTML 示例，源码位于 `apps/demo-html/examples`
- `demo-react`: React 单编辑器 demo
- `demo-vue3`: Vue 3 单编辑器 demo
- `demo-yjs-react`: React 协同编辑 demo
- `demo-yjs-vue3`: Vue 3 协同编辑 demo

## 常用命令

```sh
pnpm demo:html
pnpm demo:react
pnpm demo:vue3
pnpm demo:yjs:react
pnpm demo:yjs:vue3
```

## 维护约定

- `apps/*` 是仓库内 demo 的唯一事实来源
- README 和 issue 模板里引用的 StackBlitz 只应视为派生模板，不应直接在沙盒里长期维护
- 如果后续需要同步 StackBlitz，应该从 `apps/*` 导出或同步，而不是反向复制回仓库

## 模板导出

- 可用 `pnpm demo:export-template <app-name> <output-dir>` 导出模板化 demo
- 当前推荐先用于 `demo-react` 和 `demo-vue3`
- 导出时会自动移除 `dist` / `node_modules` / `.turbo`，并把 `workspace:*` 依赖替换为当前包版本
- `demo-html` 的源码现已迁到 `apps/demo-html/examples/`，但它依赖本地 `/dist/*` 映射，暂时不纳入模板导出

## 模板同步 Workflow

- workflow 文件位于 `.github/workflows/export-demo-templates.yml`
- 默认行为：导出 `demo-react` 和 `demo-vue3` 模板并上传为 GitHub Actions artifact
- 若要自动同步到外部模板仓库，需要配置：
- repository variable `DEMO_TEMPLATES_REPO`：目标仓库，格式如 `org/repo`
- repository variable `DEMO_TEMPLATES_BRANCH`：目标分支，默认 `main`
- repository variable `DEMO_TEMPLATES_BASE_DIR`：目标仓库里的子目录，默认仓库根目录
- repository secret `DEMO_TEMPLATES_TOKEN`：具备目标仓库写权限的 token
