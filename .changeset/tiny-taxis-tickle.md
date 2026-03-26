---
'@wangeditor-next/table-module': patch
---

Normalize table-cell soft line breaks to use standard `\n` handling so pressing `Enter` in a cell
keeps the caret visible, serializes back to `<br>`, and avoids leaking `\r` into editor content.
