# wangEditor ctrl+enter plugin

[中文文档](./README.md)

## Introduction

Use `ctrl+enter` or `cmd+enter` to insert line breaks in [wangEditor-next](https://wangeditor-next.github.io/docs/en/).

## Installation

```sh
pnpm add @wangeditor-next/plugin-ctrl-enter
```

## Usage

You should register plugin before create editor, and register only once (not repeatedly).

```js
import { Boot } from '@wangeditor-next/editor'
import ctrlEnterModule from '@wangeditor-next/plugin-ctrl-enter'

Boot.registerModule(ctrlEnterModule)

// Then create editor and toolbar
```
