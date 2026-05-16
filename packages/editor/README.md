# wangEditor editor

[English](./README-en.md)

开源 Web 富文本编辑器，开箱即用，配置简单。支持 JS Vue React 。

- [文档](https://wangeditor-next.github.io/docs/)
- [demo](https://wangeditor-next.github.io/demo/)

![](../../docs/images/editor.png)

## 体积优化（按需模块）

默认入口 `@wangeditor-next/editor` 会自动注册全部内置模块（表格、上传、代码高亮等）。
如果业务只用到部分能力，建议使用同包轻量入口 `@wangeditor-next/editor/core`。
该入口不会自动注册内置模块，且不包含上传运行时代码；如需二次开发上传能力，可从
`@wangeditor-next/editor/upload`
引入 `createUploader`。

```ts
import { createEditorFactory } from '@wangeditor-next/editor/core'
import basicModules from '@wangeditor-next/basic-modules'
import wangEditorListModule from '@wangeditor-next/list-module'

const factory = createEditorFactory({
  // tiptap-like：按 extensions 组合功能
  extensions: [...basicModules, wangEditorListModule],
  toolbarConfig: {
    toolbarKeys: [
      'headerSelect',
      'bold',
      'italic',
      '|',
      'bulletedList',
      'numberedList',
      '|',
      'undo',
      'redo',
    ],
  },
})

const { editor, toolbar } = factory.create({
  editor: {
    selector: '#editor',
    config: {
      hoverbarKeys: {},
    },
  },
  toolbar: {
    selector: '#toolbar',
  },
})
```

```ts
import { createUploader } from '@wangeditor-next/editor/upload'
```

交流
- [提交问题和建议](https://github.com/wangeditor-next/wangEditor-next/issues)
