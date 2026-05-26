# wangEditor 附件插件

[English Documentation](./README-en.md)

## 介绍

[wangEditor-next](https://wangeditor-next.github.io/docs/) 附件插件，支持上传附件并插入为可下载节点。

## 安装

```shell
pnpm add @wangeditor-next/plugin-attachment
```

## 使用

### 注册到编辑器

```js
import { Boot } from '@wangeditor-next/editor'
import attachmentModule from '@wangeditor-next/plugin-attachment'

Boot.registerModule(attachmentModule)
```

### 配置

编辑器配置

```ts
import { IEditorConfig } from '@wangeditor-next/editor'
import { AttachmentElement, IUploadConfigForAttachment } from '@wangeditor-next/plugin-attachment'

const editorConfig: Partial<IEditorConfig> = {
  hoverbarKeys: {
    attachment: {
      menuKeys: ['downloadAttachment'],
    },
  },
  MENU_CONF: {
    uploadAttachment: {
      server: '/api/upload',
      fieldName: 'file',
      maxFileSize: 10 * 1024 * 1024,
      allowedFileTypes: ['*'],
      onInsertedAttachment(elem: AttachmentElement) {
        console.log('inserted attachment', elem)
      },
    } satisfies Partial<IUploadConfigForAttachment>,
  },
}
```

工具栏配置

```ts
import { IToolbarConfig } from '@wangeditor-next/editor'

const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 0,
    keys: ['uploadAttachment'],
  },
}
```

### 服务端返回格式

成功

```json
{
  "errno": 0,
  "data": {
    "url": "附件下载链接"
  }
}
```

失败（会触发 `onFailed`）

```json
{
  "errno": 1,
  "message": "错误信息"
}
```

### HTML 格式

附件节点输出如下 HTML，可直接保存和回显：

```html
<a data-w-e-type="attachment" data-w-e-is-void data-w-e-is-inline href="https://example.com/test.zip" download="test.zip">test.zip</a>
```
