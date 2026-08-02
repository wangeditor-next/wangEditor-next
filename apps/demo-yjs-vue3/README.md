# demo

## 启动demo

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动完整 Vue 3 协同 demo

```bash
pnpm demo:yjs:vue3
```

该命令会同时启动：

- `@wangeditor-next/editor`
- `@wangeditor-next/yjs`
- `@wangeditor-next/yjs-for-vue`
- `y-websocket` 服务
- Vite 开发服务器

### 3. 打开浏览器输入链接查看效果

打开命令行输出的本地地址。

协作文档的初始空段落由 `apps/demo-yjs-server/server.js` 在服务端创建一次，客户端不应各自写入初始内容，否则多人同时进入空房间时会产生重复节点。

## 代码讲解

### 1. 基础协同编辑版本

代码位于`demo/src/components/Simple.vue`

在`apps/demo-yjs-vue3/src/App.vue`中使用

```html
<template>
  <simple></simple>
</template>
```

### 2. 协同编辑-光标版本

代码位于`demo/src/components/RemoteCursorsOverlayPage.vue`

在`apps/demo-yjs-vue3/src/App.vue`中使用

```html
<template>
  <remote-cursors-overlay-page></remote-cursors-overlay-page>
</template>
```

## WebSocket 地址

本地未配置时默认连接 `ws://localhost:1234`。如需连接远端协作服务，在启动或构建前设置
`VITE_YJS_WEBSOCKET_URL`，例如：

```bash
VITE_YJS_WEBSOCKET_URL=wss://collab.example.com pnpm demo:yjs:vue3
```

远端地址必须使用 `ws://` 或 `wss://`。生产站点应使用 `wss://`，并在服务端将浏览器站点的
origin 加入 `ALLOWED_ORIGINS`。

公开 demo 在未指定 `?room=` 时会创建浏览器会话隔离的房间。要让多人协作，请让各客户端使用同一个
URL，例如 `https://editor.example/?room=release-review`。
