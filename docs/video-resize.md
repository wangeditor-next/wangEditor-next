# 拖拽调整视频尺寸

在编辑区中选中视频后，视频四个角会出现拖拽触手，拖拽即可调整视频宽高，与图片的拖拽调整一致。

## 行为

- `<video>` 形式（mp4 等链接、上传的视频）和 `<iframe>` 形式（第三方视频）都支持拖拽。
- 拖拽时按视频当前的宽高比缩放，并在视频右上角实时显示宽高（px）。
- 宽度不会超过视频所在区域的宽度，宽、高最小为 15px。
- 居中对齐的视频两侧同时伸缩，触手会跟随鼠标移动。
- 编辑器禁用（`editor.disable()` 或 `readOnly`）时不显示拖拽触手。
- 只点击触手、没有拖动时，不会修改视频尺寸。

## 数据结构

松开鼠标后，尺寸以 px 写入视频节点的 `style`，与“修改视频尺寸”菜单（`editVideoSize`）
写入的字段相同：

```ts
{
  type: 'video',
  src: 'https://example.com/a.mp4',
  style: { width: '480px', height: '270px' },
  children: [{ text: '' }],
}
```

因此 `getHtml` 输出和 HTML 解析没有变化，例如：

```html
<video poster="" controls="true" width="auto" height="auto" style="display: block; max-width: 100%; width: 480px; height: 270px;">
  <source src="https://example.com/a.mp4" type="video/mp4"/>
</video>
```

class 模式下尺寸仍输出为 `data-w-e-style-width` / `data-w-e-style-height`，见
[class 模式与 CSP 配置](./class-style-mode.md)。

## 编辑区 DOM 结构

为了放置拖拽触手，编辑区中的 `<video>` / `<iframe>` 外层增加了一个
`.w-e-video-resize-container` 容器，视频的 `style` 宽高设置在该容器上，`<video>` /
`<iframe>` 撑满容器。选中视频时不会重新创建 `<video>` / `<iframe>`，正在播放的视频不会被打断。
该容器只存在于编辑区，不会出现在 `getHtml` 的结果中。如果自定义样式依赖
`.w-e-video > video` 这样的编辑区选择器，需要改为 `.w-e-video video`。
