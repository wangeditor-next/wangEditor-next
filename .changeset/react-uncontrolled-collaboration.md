---
'@wangeditor-next/editor-for-react': patch
---

Preserve editor-owned content when `value` is omitted. `defaultHtml` and collaborative updates no longer trigger an implicit `setHtml('')`; explicitly passing `value=""` still clears a controlled editor. The React Yjs demos now let Yjs own the document instead of feeding HTML back through a controlled value.
