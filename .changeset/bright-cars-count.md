---
'@wangeditor-next/core': patch
'@wangeditor-next/table-module': patch
'@wangeditor-next/editor': patch
---

Fix first-node table lifecycle by removing the prepended empty paragraph workaround and making `clear()` reliably reset content when table is the first top-level node.

Add regressions for issue #47 to ensure first inserted table can be removed via select-all delete/cut and that setHtml fully replaces previous table content.
