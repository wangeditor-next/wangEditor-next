---
'@wangeditor-next/table-module': patch
'@wangeditor-next/editor': patch
---

fix(table): make `tableFullWidth` switch table nodes to responsive `width: 100%` mode instead of one-time pixel recalculation, and add regression coverage for width round-trip plus container-resize behavior.
