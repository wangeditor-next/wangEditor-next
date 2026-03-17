---
"@wangeditor-next/core": patch
"@wangeditor-next/table-module": patch
---

fix(table): Ctrl+A twice then Delete now fully clears a table-first document

Previously, pressing Ctrl+A inside a table cell would only select the cell's
text. A second Ctrl+A had no effect, so the full-document delete path was
never triggered and the table structure remained after pressing Delete.

- table plugin: escalate to full-document selection when cell content is
  already fully selected (double Ctrl+A, matching Word / Plate.js behaviour)
- core: deleteFragment now directly replaces all content with an empty
  paragraph when the entire document is selected, correctly handling tables
  and other non-text block structures that deleteFragment cannot atomically
  remove in one pass
