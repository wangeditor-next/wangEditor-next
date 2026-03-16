---
"@wangeditor-next/editor": patch
---

Improve paste handling, HTML import correctness, and table stability.

- Improve large plain-text paste performance by inserting lines as a single fragment
- Fix `customPaste` returning `false` not blocking the default paste behaviour
- Fix Word superscript copy introducing extra line breaks
- Sanitize imported HTML by default (editor init, `setHtml`, paste)
- Fix Office/nested inline styles (bold, superscript) incorrectly expanding to the whole text segment
- Preserve consecutive spaces when importing styled inline HTML
- (table) Preserve line breaks when importing cell content from Word-like HTML
- (table) Preserve `colgroup` column widths through `getHtml` / `setHtml` round-trips
