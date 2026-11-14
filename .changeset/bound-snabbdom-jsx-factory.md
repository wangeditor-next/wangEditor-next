---
'@wangeditor-next/basic-modules': patch
'@wangeditor-next/core': patch
'@wangeditor-next/list-module': patch
'@wangeditor-next/plugin-float-image': patch
'@wangeditor-next/table-module': patch
'@wangeditor-next/video-module': patch
---

Keep the Snabbdom JSX factory in published ESM and UMD builds. Fix `jsx is not defined` when rendering images with the float-image plugin or using the affected modules independently.
