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

