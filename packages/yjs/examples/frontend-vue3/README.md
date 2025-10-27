# demo

> 注意，在`package.json`中`@wangeditor-next/yjs-for-vue": "portal:../../../yjs-for-vue/`是为了方便本地调试使用
>
> 实际项目中，应该改为指定的版本

## 启动demo

### 依赖安装

直接不使用外层的node_modules
```shell
cd packages/yjs/examples/frontend-vue3/

pnpm run install:ignore-workspace
```


### 启动yjs-for-vue的build监听

`/examples/frontend-vue3/`依赖build成功后的js文件运行

```shell
pnpm run yjs-for-vue:watch
```

### 运行webSocket服务器和本地编辑器

```shell
pnpm run dev:all
```


### 打开浏览器输入链接查看效果
打开多个`http://localhost:3000/`


## 代码讲解

### 1. 基础协同编辑版本

代码位于`demo/src/components/Simple.vue`

在`packages/yjs/examples/frontend-vue3/src/App.vue`中使用
```html
<template>
    <simple></simple>
</template>
```

### 2. 协同编辑-光标版本

代码位于`demo/src/components/RemoteCursorsOverlayPage.vue`

在`packages/yjs/examples/frontend-vue3/src/App.vue`中使用
```html
<template>
    <remote-cursors-overlay-page></remote-cursors-overlay-page>
</template>
```



