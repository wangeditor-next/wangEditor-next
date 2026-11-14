# 图片懒加载（loading 属性）

本文说明图片节点对浏览器原生 `<img loading>` 属性的支持方式与行为边界。

## 配置项

```ts
const editorConfig = {
  MENU_CONF: {
    insertImage: {
      // 新插入的图片（含上传图片）输出 loading="lazy"
      loading: 'lazy',
    },
  },
}
```

- `MENU_CONF.insertImage.loading`
  - 可选值：`'lazy'`、`'eager'`。
  - 默认不设置：不输出 `loading` 属性，与之前的行为一致。
  - 作用于“插入网络图片”菜单以及 `uploadImage` 的所有插入方式（默认上传、base64、
    `customInsert`、`customUpload`、`customBrowseAndUpload`）。
  - 仅影响新插入的图片，不会修改文档中已有的图片。

## 数据结构与 HTML

图片节点新增可选字段 `loading`：

```ts
{
  type: 'image',
  src: 'https://example.com/a.png',
  alt: '',
  href: '',
  loading: 'lazy',
  style: {},
  children: [{ text: '' }],
}
```

`editor.getHtml()` 在 `loading` 有值时输出该属性（inline 与 class 模式一致）：

```html
<img src="https://example.com/a.png" alt="" data-href="" width="" height="" style="" loading="lazy"/>
```

## 回环与兼容

- `editor.setHtml()` 与粘贴 HTML 时保留 `<img>` 上的 `loading="lazy"` / `loading="eager"`（大小写不敏感），
  因此已有内容中的懒加载属性不会在编辑后丢失。
- 其他取值（如 `auto` 或空值）会被忽略，不写入节点，也不会输出。
- 编辑区内渲染的 `<img>` 同样带有该属性，长文档中屏幕外的图片会延迟加载。
- 编辑图片（`editImage`）、调整尺寸等操作会保留节点上已有的 `loading`。
- `@wangeditor-next/plugin-float-image` 的解析、渲染与导出同样支持该属性。
