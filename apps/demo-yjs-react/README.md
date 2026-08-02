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

## WebSocket 地址

本地未配置时默认连接 `ws://localhost:1234`。如需连接远端协作服务，在启动或构建前设置
`VITE_YJS_WEBSOCKET_URL`，例如：

```bash
VITE_YJS_WEBSOCKET_URL=wss://collab.example.com pnpm demo:yjs:react
```

远端地址必须使用 `ws://` 或 `wss://`。生产站点应使用 `wss://`，并在服务端将浏览器站点的
origin 加入 `ALLOWED_ORIGINS`。

公开 demo 在未指定 `?room=` 时会创建浏览器会话隔离的房间。要让多人协作，请让各客户端使用同一个
URL，例如 `https://editor.example/?room=release-review`。
