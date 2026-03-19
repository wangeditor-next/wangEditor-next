# 开发

## 准备工作

- 了解 slate.js
- 了解 vdom 和 snabbdom.js
- 了解 turbo 和 changeset
- 已安装 Node.js `^22.13.0`
- 已安装 pnpm `9.15.0`

## 本地启动

### 打包

- 下载代码到本地，进入 `wangEditor-next` 目录
- 安装 pnpm
~~~ shell
# 全局安装 pnpm
npm install -g pnpm@9.15.0

# 检查版本
pnpm -v
~~~
- 安装依赖
~~~  shell
pnpm install
~~~
- 打包所有模块
~~~ shell
 # （调试使用 pnpm dev 即可）
pnpm dev
# 正式包使用 pnpm build
pnpm build
~~~

### 运行 demo

- 在仓库根目录执行 `pnpm example`，浏览器打开 `http://localhost:8881/examples/`
- React demo：`pnpm demo:react`
- Vue 3 demo：`pnpm demo:vue3`
- React 协同 demo：`pnpm demo:yjs:react`
- Vue 3 协同 demo：`pnpm demo:yjs:vue3`
- 统一维护入口在仓库根目录的 `apps/`
- 如需导出给外部模板仓库，可使用 `pnpm demo:export-template demo-react <output-dir>` 或 `pnpm demo:export-template demo-vue3 <output-dir>`
- 如需自动同步模板仓库，可配置 `.github/workflows/export-demo-templates.yml` 使用的 `DEMO_TEMPLATES_REPO`、`DEMO_TEMPLATES_BRANCH`、`DEMO_TEMPLATES_BASE_DIR` 和 `DEMO_TEMPLATES_TOKEN`

## 注意事项

- 修改代码、重新打包后，要**强制刷新**浏览器
- 本仓库使用 `pnpm workspace` 管理包之间的本地依赖，执行 `pnpm install` 后会自动建立 workspace 链接，不需要再执行 `lerna link`
- 如果运行 `pnpm dev` / `pnpm build` 报错，请优先检查 `Node.js` 和 `pnpm` 版本是否符合要求

## 记录

给整个 workspace 添加开发依赖：`pnpm add xxx -D -w`

注意合理使用 `peerDependencies` 和 `dependencies` ，不要重复打包一个第三方库

给某个 package 单独添加依赖时，优先使用 `pnpm --filter <package-name> add <dep>`，例如 `pnpm --filter @wangeditor-next/editor add lodash`

分析包体积
- 命令行，进入某个 package ，如 `cd packages/editor`
- 执行 `pnpm size-stats` ，等待执行完成
- 结果会记录在 `packages/editor/stats.html` 用浏览器打开
