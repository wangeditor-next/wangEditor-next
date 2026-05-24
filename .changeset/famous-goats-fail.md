---
'@wangeditor-next/basic-modules': patch
'@wangeditor-next/code-highlight': patch
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/list-module': patch
'@wangeditor-next/plugin-float-image': patch
'@wangeditor-next/plugin-link-card': patch
'@wangeditor-next/plugin-markdown': patch
'@wangeditor-next/table-module': patch
'@wangeditor-next/upload-image-module': patch
'@wangeditor-next/video-module': patch
'@wangeditor-next/yjs': patch
'@wangeditor-next/yjs-for-react': patch
'@wangeditor-next/yjs-for-vue': patch
---

Align Slate to `^0.124.0` across the monorepo to avoid mixed Slate type sources.

- upgrade all internal `slate` dependency and peer dependency ranges from `^0.123.0` to `^0.124.0`
- remove dual installation of `slate@0.123.x` and `slate@0.124.x` in workspace builds
- fix `@wangeditor-next/yjs-for-react` build failures caused by cross-version Slate type incompatibilities
