---
'@wangeditor-next/table-module': patch
'@wangeditor-next/editor': patch
---

Fix row and column resize handles after `setHtml` when the current selection is outside the table.

Table measurement and resizer state now update the rendered table by its Slate path. Row dragging also
keeps the target table path captured on pointer down, so imported tables expose working resize handles
without first selecting a cell.
