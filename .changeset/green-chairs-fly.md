---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

Fix IME composition after select-all so `compositionstart/compositionend` no longer throw
`Cannot resolve a DOM node from Slate node` in transient Slate-DOM sync windows.

Align selection syncing with Slate behavior by tolerating temporary DOM mapping lag, and
add an E2E regression case for issue #813 (`select all -> composition input`).
