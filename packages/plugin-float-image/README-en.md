# [wangEditor-next](https://wangeditor-next.github.io/docs/en/) float-image plugin

[中文文档](./README.md)

<br/>
<br/>
<a href="https://www.npmjs.com/package/@wangeditor-next/plugin-float-image">
<img src="https://img.shields.io/npm/v/%40wangeditor-next%2Fplugin-float-image" alt=""/>
</a>
<a href="https://www.npmjs.com/package/@wangeditor-next/plugin-float-image">
<img src="https://img.shields.io/npm/dm/%40wangeditor-next%2Fplugin-float-image" alt=""/>
</a>

## Introduction

[wangEditor-next](https://wangeditor-next.github.io/docs/en/) float-image plugin.

![](./_img/demo-1.png)
![](./_img/demo-2.png)

## Installation

```shell
pnpm add @wangeditor-next/plugin-float-image
```
or

```shell
npm i @wangeditor-next/plugin-float-image
```

## Usage

### Register to editor

```js
import { Boot } from '@wangeditor-next/editor'
import floatImageModule from '@wangeditor-next/plugin-float-image'
import '@wangeditor-next/plugin-float-image/dist/css/style.css'

// Register
// You should register this before create editor, and register only once (not repeatedly).
Boot.registerModule(floatImageModule)
```

### Configuration

Setting `hoverbarKeys.image.menuKeys` replaces the default image hoverbar menu, so this example
keeps all default items and adds the float controls.

```ts
import { IEditorConfig } from '@wangeditor-next/editor'

const editorConfig: Partial<IEditorConfig> = {
  hoverbarKeys: {
    // Menus shown when an image is selected
    image: {
      menuKeys: [
        'imageWidth30',
        'imageWidth50',
        'imageWidth100',
        'editorImageSizeMenu',
        '|',
        'imageFloatNone', // clear the float
        'imageFloatLeft',
        'imageFloatRight',
        '|',
        'editImage',
        'previewImage',
        'viewImageLink',
        'deleteImage',
      ],
    },
  },

  // others...
}
```

Then create editor and toolbar, you will use `editorConfig`.

### Editor DOM and exported HTML

The plugin keeps the inline Slate `image` node. In the editor, `div.w-e-image-container`
wraps the image and carries its width and float direction. For example, place `a.png`
between the text `before` and `after`, give it the alt text `example`, set its width to 30%
and float it right.

With the default `textStyleMode: 'inline'`, `editor.getHtml()` writes the styles on the image.

```html
<p>before<img src="a.png" alt="example" data-href="" style="width: 30%;float: right;"/>after</p>
```

With `textStyleMode: 'class'`, the same paragraph exports as shown below (line wrapped for readability).

```html
<p>before<img src="a.png" alt="example" data-href="" width="30%" height=""
  class="w-e-float-image-right" data-w-e-style-width="30%" data-w-e-style-float="right"/>after</p>
```

Load the plugin stylesheet when displaying class-mode HTML to apply the float class.
Passing either output to `editor.setHtml()` restores the inline image, its 30% width and its
right float. To put each uploaded image in its own paragraph, see the
[upload image configuration](../../docs/upload-image.md).

## Others

Support i18n.


## LICENSE

[MIT](https://github.com/wangeditor-next/wangEditor-next/blob/master/LICENSE)
