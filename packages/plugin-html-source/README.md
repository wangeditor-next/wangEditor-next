# wangEditor HTML 源码编辑

[English Documentation](./README-en.md)

## 介绍

[wangEditor-next](https://wangeditor-next.github.io/docs/) HTML 源码编辑插件。点击菜单后在弹窗中查看并编辑编辑器当前的 HTML ，点击“确定”后用修改后的 HTML 替换编辑器内容。

## 安装

```shell
pnpm add @wangeditor-next/plugin-html-source
```

## 使用

### 注册到编辑器

```js
import { Boot } from '@wangeditor-next/editor'
import htmlSourceModule from '@wangeditor-next/plugin-html-source'

// 注册。要在创建编辑器之前注册，且只能注册一次，不可重复注册。
Boot.registerModule(htmlSourceModule)
```

### 配置

```ts
import { IToolbarConfig } from '@wangeditor-next/editor'

// 工具栏配置
const toolbarConfig: Partial<IToolbarConfig> = {
  insertKeys: {
    index: 0,
    keys: [
      'editHtmlSource', // “HTML 源码”菜单
    ],
  },

  // 其他...
}
```

然后创建编辑器和工具栏，会用到 `toolbarConfig` 。具体查看 wangEditor 文档。

## 行为说明

- 弹窗中的内容来自 `editor.getHtml()` ，每个顶级节点单独一行。
- 点击“确定”时，修改后的内容通过 `editor.setHtml()` 写回编辑器，因此和 `setHtml` 的规则一致：
  - 只会保留编辑器支持的标签、属性和样式，不支持的内容会在解析时被过滤（例如 `<script>`）。
  - 如果配置了 `sanitizeHtml` ，会先经过它处理。
  - 如果需要支持更多标签，请注册对应的模块或插件（参考 `parseElemsHtml` / `parseStyleHtml`）。
- 内容未修改时点击“确定”不会重新设置编辑器内容。
- 编辑器只读或未选中时，菜单和其他菜单一样处于禁用状态。

## 其他

支持 i18n 多语言
