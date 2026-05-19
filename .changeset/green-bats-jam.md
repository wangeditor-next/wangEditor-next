---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

Fix clipped first-line rendering when large-font superscript or subscript appears
at the top of the editor content.

`sup` and `sub` in the editor area now inherit line-height, preventing browser
default `line-height: 0` behavior from being cut by the scroll container.
