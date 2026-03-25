---
'@wangeditor-next/table-module': patch
---

Export fixed-layout tables with an explicit table width when column widths are known, so `colgroup`
constraints continue to work after rendering the HTML outside the editor.
