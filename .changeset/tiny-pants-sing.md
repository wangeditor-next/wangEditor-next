---
'@wangeditor-next/core': patch
'@wangeditor-next/basic-modules': patch
'@wangeditor-next/editor': patch
---

Fix nested span style parsing so explicit child style values correctly override inherited parent marks during HTML import.

This resolves issue #608 where a mixed bold span (`font-weight:700` parent with `font-weight:400` child) was imported as fully bold text instead of preserving the non-bold subrange.
