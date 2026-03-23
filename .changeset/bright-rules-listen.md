---
'@wangeditor-next/table-module': patch
---

Fix pasted Excel and WPS tables dropping non-first columns when clipboard HTML uses
`<col span>` to describe repeated column widths.
