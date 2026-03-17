# wangEditor markdown plugin

[中文文档](./README.md)

## Introduction

Use basic markdown syntax in [wangEditor-next](https://wangeditor-next.github.io/docs/en/).

- Header
  - `#`
  - `##`
  - `###`
  - `####`
  - `#####`
- List `-` `+` `*`
- Blockquote `>`
- Divider `---`
- Codeblock ```js

## Installation

```sh
pnpm add @wangeditor-next/plugin-markdown
```

## Usage

You should register plugin before create editor, and register only once (not repeatedly).

```js
import { Boot } from '@wangeditor-next/editor'
import markdownModule from '@wangeditor-next/plugin-markdown'


Boot.registerModule(markdownModule)

// Then create editor and toolbar
```
