---
"@wangeditor-next/video-module": minor
---

Support resizing videos by dragging. A selected video now shows drag handles on its four corners, like images, and shows the current size while dragging. Resizing keeps the aspect ratio, stays within the editor width, and saves `style.width` / `style.height` in px, so `getHtml` output and parsing are unchanged. Both `<video>` and `<iframe>` videos are supported, and the handles are hidden when the editor is disabled.
