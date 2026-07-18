1. 在仓库根目录安装依赖

```bash
pnpm install
```

2. 启动完整 React 协同 demo

```bash
pnpm demo:yjs:react
```

该命令会同时启动：

- `@wangeditor-next/editor`
- `@wangeditor-next/editor-for-react`
- `@wangeditor-next/yjs`
- `@wangeditor-next/yjs-for-react`
- `y-websocket` 服务
- Vite 开发服务器

3. 打开浏览器，访问命令行输出的本地地址

协作文档的初始空段落由 `apps/demo-yjs-server/server.js` 在服务端创建一次，客户端不应各自写入初始内容，否则多人同时进入空房间时会产生重复节点。
