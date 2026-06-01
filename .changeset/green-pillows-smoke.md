---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

fix IME composition commit after undo by recovering selection when editor selection is null to avoid placeholder overlap and dropped CJK input in demo flows
