# wangEditor HTML source

[中文文档](./README.md)

## Introduction

HTML source editing plugin for [wangEditor-next](https://wangeditor-next.github.io/docs/en/). The menu opens a modal that shows the current HTML of the editor. After editing it, click "OK" to replace the editor content with the edited HTML.

## Installation

```shell
pnpm add @wangeditor-next/plugin-html-source
```

## Usage

### Register to editor

```js
import { Boot } from '@wangeditor-next/editor'
import htmlSourceModule from '@wangeditor-next/plugin-html-source'

// Register. Do it before creating the editor, and only once.
Boot.registerModule(htmlSourceModule)
```

### Configuration

```ts
import { IToolbarConfig } from '@wangeditor-next/editor'

// Toolbar config
const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 0,
    keys: [
      'editHtmlSource', // "HTML source" menu
    ],
  },

  // others...
}
```

Then create the editor and toolbar with `toolbarConfig`. See the wangEditor documentation for details.

## Behavior

- The modal shows the result of `editor.getHtml()`, with every top-level node on its own line.
- Clicking "OK" writes the edited HTML back with `editor.setHtml()`, so the same rules as `setHtml` apply:
  - Only tags, attributes and styles supported by the editor are kept. Unsupported content (such as `<script>`) is dropped while parsing.
  - The `sanitizeHtml` config, if set, runs first.
  - To support more tags, register the modules or plugins that parse them (see `parseElemsHtml` / `parseStyleHtml`).
- Clicking "OK" without changing anything does not reset the editor content.
- Like other menus, the menu is disabled while the editor is read-only or has no selection.

## Others

Supports i18n.
