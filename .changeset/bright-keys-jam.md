---
'@wangeditor-next/core': patch
---

Preserve SVG namespace (`data.ns`) during vnode data normalization so custom renderers using `h('svg')` keep valid SVG rendering semantics.
