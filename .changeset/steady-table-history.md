---
'@wangeditor-next/core': patch
'@wangeditor-next/table-module': patch
'@wangeditor-next/yjs': patch
---

Keep automatic table size measurements out of undo and redo, including in collaborative editors. Measured dimensions still update and sync. Manual column and row size changes remain undoable.
