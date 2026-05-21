---
'@wangeditor-next/list-module': patch
---

Fix nested list import/export so standard HTML nesting is preserved. `li > ul/ol` structures are now parsed into list levels correctly, and list serialization outputs nested lists inside their parent `<li>` instead of sibling containers.
