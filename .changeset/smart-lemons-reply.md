---
'@wangeditor-next/table-module': patch
---

Fix regression in table full-width workflow: `tableFullWidth` now toggles between `100%` and `auto`, and manual column resize in `100%` mode switches table width back to `auto` while applying rendered-width-based column updates.
