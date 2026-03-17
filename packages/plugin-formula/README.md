# wangEditor 公式

[English Documentation](./README-en.md)

## 介绍

[wangEditor-next](https://wangeditor-next.github.io/docs/) 公式插件，使用 [LateX](https://baike.baidu.com/item/LaTeX/1212106) 语法。

![](./_img/demo.png)

## 安装

```shell
pnpm add katex
pnpm add @wangeditor-next/plugin-formula
```

## 使用

### 注册到编辑器

```js
import { Boot, IEditorConfig, IToolbarConfig } from '@wangeditor-next/editor'
import formulaModule from '@wangeditor-next/plugin-formula'

// 注册。要在创建编辑器之前注册，且只能注册一次，不可重复注册。
Boot.registerModule(formulaModule)
```

### 配置

```js
// 编辑器配置
const editorConfig: Partial<IEditorConfig> = {
  // 选中公式时的悬浮菜单
  hoverbarKeys: {
    formula: {
      menuKeys: ['editFormula'], // “编辑公式”菜单
    },
  },

  // 其他...
}

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 0,
    keys: [
      'insertFormula', // “插入公式”菜单
      // 'editFormula' // “编辑公式”菜单
    ],
  },

  // 其他...
}
```

然后创建编辑器和工具栏，会用到 `editorConfig` 和 `toolbarConfig` 。具体查看 wangEditor 文档。

### 显示 HTML

公式获取的 HTML 格式如下

```html
<span data-w-e-type="formula" data-w-e-is-void data-w-e-is-inline data-value="c = \\pm\\sqrt{a^2 + b^2}"></span>
```

其中 `data-value` 就是 LateX 格式的值，可使用第三方工具把 `<span>` 渲染成公式卡片，如 [KateX](https://katex.org/)。

## 其他

支持 i18n 多语言
