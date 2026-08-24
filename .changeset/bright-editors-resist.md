---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

Scope built-in editable-content styles under the editor root so headings, lists, controls, code,
tables, and media remain stable when host reset styles such as Tailwind Preflight are present.
