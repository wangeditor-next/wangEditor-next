# 开发

## 准备工作

- 了解 slate.js
- 了解 vdom 和 snabbdom.js
- 了解 turbo 和 changeset
- 已安装 pnpm

## 本地启动

### 打包

- 下载代码到本地，进入 `wangEditor-next` 目录
- 安装 pnpm (node 18.x 以上)
~~~ shell
# 全局安装 pnpm
npm install -g pnpm@latest

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

- 进入 `packages/editor` 目录，运行 `pnpm example` ，浏览器打开 `http://localhost:8881/examples/`

## 注意事项

- 修改代码、重新打包后，要**强制刷新**浏览器
- 如果本地包依赖有问题，试试 `lerna link` 关联内部包
- 如果运行 `pnpm dev` 报错，请检查是否正确安装了 pnpm

## 记录

全局安装一个插件 `pnpm add xxx --dev -W`

注意合理使用 `peerDependencies` 和 `dependencies` ，不要重复打包一个第三方库

执行 `lerna add ...` 之后，需要重新 `lerna link` 建立内部连接

分析包体积
- 命令行，进入某个 package ，如 `cd packages/editor`
- 执行 `pnpm size-stats` ，等待执行完成
- 结果会记录在 `packages/editor/stats.html` 用浏览器打开
