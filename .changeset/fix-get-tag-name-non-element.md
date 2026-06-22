---
'@wangeditor-next/basic-modules': patch
---

fix: guard `getTagName` against non-element nodes so parsing HTML with text/comment nodes no longer throws "Cannot read properties of undefined (reading 'toLowerCase')"
