---
'@wangeditor-next/table-module': patch
'@wangeditor-next/editor': patch
---

Fix table column resize after `setHtml` when the current selection is outside the table.

Column drag now captures the target table path on `mousedown` and keeps using
that path during `mousemove`, instead of looking up the table from current
selection state. This keeps full-width table column resize usable after
`setHtml` without requiring an extra click inside a cell first.
