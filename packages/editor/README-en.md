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

## Image resize units and validation

Use `imageResize` to configure all built-in image resize actions. With `resizeUnit: 'px'`, the size dialog, preset buttons, and drag resizing all use pixels:

```ts
const editorConfig: Partial<IEditorConfig> = {
  imageResize: {
    resizeUnit: 'px',
    resizeOptions: [
      { label: '200px', value: '200px' },
    ],
    checkImageSize({ width, height, source }) {
      if (Number.parseFloat(width) > 1200) return 'Image width cannot exceed 1200px'
      return true
    },
  },
}
```

Leaving `imageResize` unset preserves the historical behavior. HTML import keeps its existing parsing rules so size information remains round-trip compatible.

You can [commit an issue](https://github.com/wangeditor-next/wangEditor-next/issues) if you have any question.
