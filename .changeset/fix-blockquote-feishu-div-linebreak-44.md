---
'@wangeditor-next/basic-modules': patch
---

Fix blockquote HTML parsing for imported content where line breaks are represented by block children (for example `blockquote > div` from Feishu docs). The parser now flattens block children into newline-separated content while preserving inline text marks.
