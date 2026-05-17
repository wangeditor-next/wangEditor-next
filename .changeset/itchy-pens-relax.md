---
'@wangeditor-next/table-module': patch
'@wangeditor-next/editor': patch
---

Fix table row-resize hotspot alignment after table cell content expands.

The row resize UI now follows real DOM row heights (captured via table resize
observation) instead of stale model defaults, so hovering and dragging the row
bottom border stays accurate even when a cell grows taller from wrapped text.
