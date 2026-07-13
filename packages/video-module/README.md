# wangEditor video-module

Video module built in [wangeditor-next](https://wangeditor-next.github.io/docs/) by default.

Videos are block media nodes and are centered by default. Select a video to align it left,
center, or right from the video hoverbar. The node stores this layout as
`align: 'left' | 'center' | 'right'`; text justification does not apply to videos.

Rendered and exported videos use a full-width flex container, while the `<video>` or `<iframe>`
remains a responsive block element. This keeps media alignment independent from application CSS
resets that change the display mode of replaced elements.
