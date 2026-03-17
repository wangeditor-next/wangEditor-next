---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/basic-modules': patch
'@wangeditor-next/list-module': patch
'@wangeditor-next/table-module': patch
'@wangeditor-next/code-highlight': patch
'@wangeditor-next/video-module': patch
'@wangeditor-next/upload-image-module': patch
'@wangeditor-next/plugin-markdown': patch
'@wangeditor-next/plugin-link-card': patch
'@wangeditor-next/plugin-float-image': patch
'@wangeditor-next/yjs': patch
'@wangeditor-next/yjs-for-react': patch
'@wangeditor-next/yjs-for-vue': patch
---

Upgrade the Slate dependency line to `slate@^0.123.0` and `slate-history@^0.115.0`, and realign wangEditor's DOM bridge, selection sync, and composition handling with current Slate behavior.

This release also fixes regressions around full-document delete normalization, selectionchange handling in `Document | ShadowRoot`, and related list / paste / image / code-block flows covered by the workspace E2E suite.
