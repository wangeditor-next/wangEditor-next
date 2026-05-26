# wangEditor attachment plugin

[中文文档](./README.md)

## Introduction

Attachment plugin for [wangEditor-next](https://wangeditor-next.github.io/docs/en/), supporting upload and download attachment nodes.

## Installation

```shell
pnpm add @wangeditor-next/plugin-attachment
```

## Usage

### Register to editor

```js
import { Boot } from '@wangeditor-next/editor'
import attachmentModule from '@wangeditor-next/plugin-attachment'

Boot.registerModule(attachmentModule)
```

### Configuration

Editor config

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

Toolbar config

```ts
import { IToolbarConfig } from '@wangeditor-next/editor'

const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 0,
    keys: ['uploadAttachment'],
  },
}
```

### Server response format

Success

```json
{
  "errno": 0,
  "data": {
    "url": "Attachment download URL"
  }
}
```

Failed (`onFailed` will be triggered)

```json
{
  "errno": 1,
  "message": "Error message"
}
```

### HTML format

Attachment nodes output HTML like this:

```html
<a data-w-e-type="attachment" data-w-e-is-void data-w-e-is-inline href="https://example.com/test.zip" download="test.zip">test.zip</a>
```
