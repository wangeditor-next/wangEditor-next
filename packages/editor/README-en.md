# wangEditor editor

[中文](./README.md)

Open source web rich text editor, run right out of the box. Support JS Vue React.

- [Document](https://www.wangeditor.com/en/)
- [Demo](https://www.wangeditor.com/demo/?lang=en)

![](../../docs/images/editor-en.png)

## Bundle Size Optimization (On-Demand Modules)

The default entry `@wangeditor-next/editor` auto-registers all built-in modules (table, upload,
code highlight, etc).
If you only need part of the features, use the lightweight subpath
`@wangeditor-next/editor/core`.
This entry does not auto-register built-in modules and does not include upload runtime code.
If you need the uploader API for custom
integrations, import `createUploader` from `@wangeditor-next/editor/upload`.

```ts
import { createEditorFactory } from '@wangeditor-next/editor/core'
import basicModules from '@wangeditor-next/basic-modules'
import wangEditorListModule from '@wangeditor-next/list-module'

const factory = createEditorFactory({
  // tiptap-like composition with extensions
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

You can [commit an issue]((https://github.com/wangeditor-next/wangeditor-next/issues)) if you have any question.
