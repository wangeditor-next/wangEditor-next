---
'@wangeditor-next/core': patch
---

Fix list selection mapping when the browser selection lands on ordered-list reserve markers (`data-w-e-reserve`).

Treat reserve-marker targets as selectable during `selectionchange` sync, and resolve reserve-marker DOM points to nearby Slate text points so `editor.getSelectionText()` stays in sync with visible list-row selections.
