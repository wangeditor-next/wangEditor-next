---
'@wangeditor-next/basic-modules': patch
---

Fix block image insertion leaving an extra empty paragraph in documents with multiple paragraphs or rich table cells. Reuse the selected empty paragraph while keeping existing image paragraphs separate.
