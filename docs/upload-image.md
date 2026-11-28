# 上传图片与逐行插入

`MENU_CONF.uploadImage.insertAsBlock` 用于让上传图片分别放在独立段落中。默认值为 `false`，
在普通段落中一次选择多张图片或接连上传时，图片都在光标处行内插入，宽度允许时可以并排显示。

## 配置

```ts
const editorConfig = {
  MENU_CONF: {
    uploadImage: {
      server: '/api/upload-image',
      insertAsBlock: true,
    },
  },
}
```

原生接入时，将配置传给 `createEditor`：

```ts
import { createEditor } from '@wangeditor-next/editor'
import '@wangeditor-next/editor/dist/css/style.css'

const editor = createEditor({
  selector: '#editor',
  config: editorConfig,
})
```

React 的 `Editor` 组件使用 `defaultConfig={editorConfig}`，Vue 2 / Vue 3 的 `Editor`
组件使用 `:defaultConfig="editorConfig"`。同一份 `MENU_CONF` 配置适用于这些接入方式，
应在创建编辑器前设置。

## 上传图片的插入位置

开启 `insertAsBlock` 后，单张上传、多选上传和分次连续上传都遵循相同的段落规则。

- 光标所在段落为空时，直接在该段落插入图片。
- 光标所在段落非空时，在整个段落之后新建图片段落；不会在光标处拆分原有文字。
  连续插入的每张图片分别位于一个段落中，光标停留在最后一张图片后的文本位置。
- 当前块为 `list-item` 等非段落类型时，回退到原有 inline 插入。标题、引用、代码块、
  链接等原本禁用插图的位置仍然禁用。
- 富表格单元格中，如果光标位于一个段落内，上述规则在该单元格内生效：新图片段落仍然
  属于当前单元格，不会插到表格外。其他单元格内容按当前块类型处理。

在普通段落中逐行上传时，作为块节点的是每张图片的父段落。以空段落为起点，依次调用
`insertFn('a.png', 'a', '')` 和 `insertFn('b.png', 'b', '')` 后，默认样式模式下的
`editor.getHtml()` 会生成以下两个段落（按段落分行）。

```html
<p><img src="a.png" alt="a" data-href="" width="" height="" style=""/></p>
<p><img src="b.png" alt="b" data-href="" width="" height="" style=""/></p>
```

用 `editor.setHtml()` 回读这段 HTML，每张图仍在自己的段落里。展示时应保留段落的块级布局。

“插入网络图片”菜单使用独立的插入入口。即使开启上述上传配置，在同一段落的
`A` 和 `B` 之间插入网络图片，结果仍是同一段落里的文字、行内图片、文字。

若需要图片左浮动或右浮动，可使用[浮动图片插件](../packages/plugin-float-image/README.md)。
逐行上传与图片浮动都沿用行内 `image` 节点，`editor.isInline(image)` 均为 `true`。

## 自定义上传与顺序

该配置适用于 base64 插入、默认上传返回的对象或旧版数组，以及 `customInsert`、
`customUpload`、`customBrowseAndUpload` 提供的 `insertFn`。

同一个编辑器按 `insertFn` 的调用顺序完成插入，异步 `checkImage` / `parseImageSrc` 不会
让后一次调用抢先插入；一次插入失败也不会阻断后续调用。这不表示按原始文件选择顺序或
网络请求完成顺序重新排列图片。如果并行请求的响应顺序不同，需要业务方先按所需顺序
组织结果，再调用 `insertFn`。

例如，`customUpload` 可以等待每次插入完成：

```js
const customUploadConfig = {
  insertAsBlock: true,
  async customUpload(file, insertFn) {
    const { url, alt = '', href = '' } = await uploadToYourServer(file)

    await insertFn(url, alt, href)
  },
}
```

在创建编辑器前，将此对象设为 `MENU_CONF.uploadImage`。`uploadToYourServer` 由业务方实现。
`insertAsBlock` 只控制插入布局，不改变上传接口或响应格式。

## 本地示例与回环检查

构建后运行 `pnpm --filter @wangeditor-next/demo-html serve`，打开：

- [逐段落插图示例](http://localhost:8881/examples/upload-image-block.html)
- [默认 inline 对照](http://localhost:8881/examples/upload-image-block.html?inline=1)

示例通过 `customUpload` 在浏览器中读取本地图片，不需要上传服务器。点击工具栏的上传
图片按钮，选择多张较小图片，观察逐段落与 inline 两种结果。也可先将光标移到非空段落、
列表或表格单元格，再观察对应的插入位置。

图片插入完成后，点击“检查 HTML 回环”，示例会执行下列过程并显示结果及导出 HTML：

```ts
const htmlBefore = editor.getHtml()

editor.setHtml(htmlBefore)

const htmlAfter = editor.getHtml()

console.assert(htmlAfter === htmlBefore, 'HTML round-trip changed the output')
```

该检查覆盖当前编辑器内容的 `toHtml`、`parseHtml` 和 `setHtml(getHtml())` 路径。验证时还应
观察回读后的图片和段落布局；HTML 字符串相等不能替代视觉检查。
