---
'@wangeditor-next/plugin-html-source': minor
---

Add `@wangeditor-next/plugin-html-source`, an optional plugin with an `editHtmlSource` menu that opens a modal for viewing and editing the editor HTML. The modal lists every top-level node on its own line, and confirming applies the edited HTML through `editor.setHtml()`, so unsupported tags are filtered and `sanitizeHtml` still runs. Confirming without changes leaves the content untouched.
