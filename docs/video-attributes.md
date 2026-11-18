# 视频属性（autoplay、controlslist 等）

本文说明视频节点对 `<video>` 播放相关属性的支持方式与行为边界。

## 支持的属性

| 节点字段 | HTML 属性 | 取值 |
| --- | --- | --- |
| `autoplay` | `autoplay` | `true` |
| `loop` | `loop` | `true` |
| `muted` | `muted` | `true` |
| `playsInline` | `playsinline` | `true` |
| `preload` | `preload` | `'none'`、`'metadata'`、`'auto'` |
| `controlsList` | `controlslist` | 以空格分隔的 `nodownload`、`nofullscreen`、`noremoteplayback`、`noplaybackrate` |
| `disablePictureInPicture` | `disablepictureinpicture` | `true` |

- 这些属性只作用于 `<video>` 形式的视频（mp4 等链接、上传的视频），不作用于 `<iframe>` 形式的第三方视频。
- `controls` 仍然始终输出，`controlslist` 与 `disablepictureinpicture` 可用来隐藏播放控件中的下载、全屏、倍速、画中画等按钮。

## 配置项

```ts
const editorConfig = {
  MENU_CONF: {
    insertVideo: {
      // 新插入的视频（含上传视频）默认带上这些属性
      attributes: {
        controlsList: 'nodownload noplaybackrate',
        disablePictureInPicture: true,
        playsInline: true,
        preload: 'metadata',
      },
    },
  },
}
```

- `MENU_CONF.insertVideo.attributes`
  - 默认不设置：不输出上述属性，与之前的行为一致。
  - 作用于“插入网络视频”菜单以及 `uploadVideo` 的所有插入方式（默认上传、`customInsert`、`customUpload`、
    `customBrowseAndUpload`）。
  - 仅影响新插入的视频，不会修改文档中已有的视频。
  - 布尔字段只有值为 `true` 时生效；不支持的 `preload` 值和 `controlsList` token 会被忽略。

## 数据结构与 HTML

视频节点新增上述可选字段：

```ts
{
  type: 'video',
  src: 'https://example.com/a.mp4',
  poster: '',
  align: 'center',
  muted: true,
  playsInline: true,
  controlsList: 'nodownload',
  disablePictureInPicture: true,
  style: {},
  children: [{ text: '' }],
}
```

`editor.getHtml()` 在字段有值时输出对应属性（inline 与 class 模式一致），布尔属性不带属性值：

```html
<video poster="" controls="true" width="auto" height="auto" style="display: block; max-width: 100%;" muted playsinline controlslist="nodownload" disablepictureinpicture><source src="https://example.com/a.mp4" type="video/mp4"/></video>
```

## 回环与兼容

- `editor.setHtml()` 与粘贴 HTML 时保留 `<video>` 上的上述属性。布尔属性按 HTML 规则以“是否存在”判断，
  `preload` 与 `controlslist` 不区分大小写。
- 不支持的取值不会写入节点，也不会输出，因此不会把任意内容拼接进导出的 HTML。
- 编辑区内渲染的 `<video>` 同样带有 `loop`、`muted`、`playsinline`、`preload`、`controlslist`、
  `disablepictureinpicture`，编辑时即可看到隐藏控件后的效果；为避免编辑时视频自动播放，编辑区内不渲染 `autoplay`，
  它只出现在 `getHtml()` 的输出中。
- 修改视频尺寸、链接和对齐方式时会保留节点上已有的这些属性。
