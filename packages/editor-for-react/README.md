# wangEditor for React

<!-- Badge -->
![MIT License](https://img.shields.io/badge/License-MIT-blue)
![jest badge](https://img.shields.io/badge/unit%20test-jest-yellowgreen)

## 介绍
基于[wangEditor-next](https://wangeditor-next.github.io/docs/) 封装的React组件。

## 安装

1. 安装组件包

```shell
pnpm add @wangeditor-next/editor-for-react
# 或者npm install @wangeditor-next/editor-for-react --save

```

2. 安装核心包

```shell
pnpm add @wangeditor-next/editor

# 或者 npm install @wangeditor-next/editor --save
```
3. 导入组件

```ts
import { Editor, Toolbar } from '@wangeditor-next/editor-for-react'
```

## 使用

详情参考[wangEditor react使用文档](https://wangeditor-next.github.io/docs/guide/for-frame#react)。

### Editor 内置 loading

为避免外层 `Spin/Loader` 包裹导致编辑器节点结构变化，可直接使用内置 `loading` 覆盖层：

```tsx
<Editor
  defaultConfig={editorConfig}
  onChange={setEditorState}
  loading={uploading}
  loadingText="Uploading..."
/>
```

`loading` 只控制可视化遮罩，不会重建 editor 实例。

### 在Next.js下使用
```js
import dynamic  from 'next/dynamic'
const WangEditor = dynamic(
  // 引入对应的组件 设置的组件参考上面的wangEditor react使用文档
  () => import('../components/myEditor'),
  {ssr: false}
)

export default function Home() {
  return <WangEditor />
}
```
使用案例可以参考[wangeditorV5-nextjs-demo](https://github.com/hahaaha/wangeditorV5-nextjs-demo)
