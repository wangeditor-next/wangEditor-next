---
'@wangeditor-next/basic-modules': minor
'@wangeditor-next/code-highlight': minor
'@wangeditor-next/core': minor
'@wangeditor-next/editor': minor
'@wangeditor-next/editor-for-react': minor
'@wangeditor-next/editor-for-vue': minor
'@wangeditor-next/editor-for-vue2': minor
'@wangeditor-next/list-module': minor
'@wangeditor-next/plugin-attachment': minor
'@wangeditor-next/plugin-float-image': minor
'@wangeditor-next/plugin-formula': minor
'@wangeditor-next/plugin-link-card': minor
'@wangeditor-next/plugin-markdown': minor
'@wangeditor-next/plugin-mention': minor
'@wangeditor-next/table-module': minor
'@wangeditor-next/upload-image-module': minor
'@wangeditor-next/video-module': minor
'@wangeditor-next/yjs': minor
'@wangeditor-next/yjs-for-react': minor
'@wangeditor-next/yjs-for-vue': minor
---

Modernize the workspace toolchain and expand Slate support to ^0.124.0 || ^0.126.2 while retaining the existing Vue, React, Uppy, Yjs and Snabbdom consumer peer ranges. Keep the release in the 6.x product line without a content-schema migration.

The Vue adapter keeps Vue 3.0-compatible runtime helpers and declarations, and table resize flags retain their nullable public types. Uppy 6 and i18next 26 are deferred; the full editor continues to use Uppy 5 and i18next 23. Development tooling and collaboration demos use the newer Vite, Vitest, TypeScript, React, Vue, Yjs, y-websocket and UnoCSS integrations. See docs/dependency-modernization.md for supported versions, validation and rollback.
