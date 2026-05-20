---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

fix: scope Slate DOM mapping lookup to the active editor root so duplicated legacy ids do not break DOM-to-Slate resolution when wangEditor and wangEditor-next coexist.
