---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/table-module': patch
---

feat(table): add configurable width export mode for table html

- Added `insertTable.widthExportMode` with `adaptive | explicit`.
- Default mode remains `explicit` for backward compatibility.
- `adaptive` mode can be enabled to keep `width:auto` on table export.
