---
'@wangeditor-next/editor-for-vue': patch
---

Fix Vue 3 editor model synchronization so the first external clear applies to nonempty initial content and the latest model update made during creation takes effect when the editor is ready. Skip replacing editor content when the incoming HTML already matches.
