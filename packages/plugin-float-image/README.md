# [wangEditor-next](https://wangeditor-next.github.io/docs/) 图片浮动 插件

[English Documentation](./README-en.md)

<br/>
<br/>
<a href="https://www.npmjs.com/package/@wangeditor-next/plugin-float-image">
<img src="https://img.shields.io/npm/v/%40wangeditor-next%2Fplugin-float-image" alt=""/>
</a>
<a href="https://www.npmjs.com/package/@wangeditor-next/plugin-float-image">
<img src="https://img.shields.io/npm/dm/%40wangeditor-next%2Fplugin-float-image" alt=""/>
</a>

## 介绍

[wangEditor-next](https://wangeditor-next.github.io/docs/) 图片浮动 插件。

![](./_img/demo-1.png)
![](./_img/demo-2.png)

## 安装

```shell
pnpm add @wangeditor-next/plugin-float-image
```
或者

```shell
npm i @wangeditor-next/plugin-float-image
```

## 使用

### 注册到编辑器

```js
import { Boot } from '@wangeditor-next/editor'
import floatImageModule from '@wangeditor-next/plugin-float-image'
import '@wangeditor-next/plugin-float-image/dist/css/style.css'

// 注册。要在创建编辑器之前注册，且只能注册一次，不可重复注册。
Boot.registerModule(floatImageModule)
```

### 配置

设置 `hoverbarKeys.image.menuKeys` 会替换默认的图片悬浮菜单，以下示例保留默认项并加入浮动选项。

```ts
import { IEditorConfig } from '@wangeditor-next/editor'

const editorConfig: Partial<IEditorConfig> = {
  hoverbarKeys: {
    // 选中图片时显示的菜单
    image: {
      menuKeys: [
        'imageWidth30',
        'imageWidth50',
        'imageWidth100',
        'editorImageSizeMenu',
        '|',               // 分割符
        'imageFloatNone',  // 清除浮动
        'imageFloatLeft',
        'imageFloatRight',
        '|',               // 分割符
        'editImage',
        'previewImage',
        'viewImageLink',
        'deleteImage',
      ],
    },
  },

  // 其他配置...
}
```

然后创建编辑器和工具栏，会用到 `editorConfig` 。具体查看 wangEditor 文档。

### 编辑区 DOM 与导出 HTML

插件沿用 Slate 的行内 `image` 节点。编辑区用 `div.w-e-image-container` 包裹图片，
并在容器上设置宽度和浮动方向。例如，在文字 `before` 和 `after` 之间插入 `a.png`，
将宽度设为 30%，并选择右浮动。

以下示例使用替代文本 `example`。在默认的 `textStyleMode: 'inline'` 模式下，`editor.getHtml()` 将样式写在图片上。

```html
<p>before<img src="a.png" alt="example" data-href="" style="width: 30%;float: right;"/>after</p>
```

使用 `textStyleMode: 'class'` 时，同一段落导出为以下 HTML（属性分行以便阅读）。

```html
<p>before<img src="a.png" alt="example" data-href="" width="30%" height=""
  class="w-e-float-image-right" data-w-e-style-width="30%" data-w-e-style-float="right"/>after</p>
```

展示 class 模式的 HTML 时，加载插件样式表即可应用浮动类。
将任一示例的输出传给 `editor.setHtml()`，会恢复行内图片、30% 宽度和右浮动。
如需让每张上传图片独占一个段落，参见[图片上传配置](../../docs/upload-image.md)。

## 其他

支持 i18n 多语言


## 许可证

[MIT](https://github.com/wangeditor-next/wangEditor-next/blob/master/LICENSE)
