---
'@wangeditor-next/core': minor
'@wangeditor-next/table-module': minor
'@wangeditor-next/list-module': patch
---

Allow table cells to contain block descendants such as paragraphs and lists while preserving legacy text-only cells through normalization and HTML round trips. Core now exposes HTML-to-content conversion and a composable initial-content transform hook for modules that need boundary migrations.
