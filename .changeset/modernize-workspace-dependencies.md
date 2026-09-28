---
'@wangeditor-next/basic-modules': major
'@wangeditor-next/code-highlight': major
'@wangeditor-next/core': major
'@wangeditor-next/editor': major
'@wangeditor-next/editor-for-react': major
'@wangeditor-next/editor-for-vue': major
'@wangeditor-next/editor-for-vue2': major
'@wangeditor-next/list-module': major
'@wangeditor-next/plugin-attachment': major
'@wangeditor-next/plugin-float-image': major
'@wangeditor-next/plugin-formula': major
'@wangeditor-next/plugin-link-card': major
'@wangeditor-next/plugin-markdown': major
'@wangeditor-next/plugin-mention': major
'@wangeditor-next/table-module': major
'@wangeditor-next/upload-image-module': major
'@wangeditor-next/video-module': major
'@wangeditor-next/yjs': major
'@wangeditor-next/yjs-for-react': major
'@wangeditor-next/yjs-for-vue': major
---

Modernize the workspace toolchain and runtime integrations: upgrade Vite, Vitest, TypeScript, React, Vue, Slate, Uppy, Yjs, i18next, and related tooling; migrate the Yjs demos from WindiCSS to UnoCSS; and apply the compatibility fixes required by the newer Slate and Vitest releases.

This is a major release: modular consumers must use Slate ^0.126.2, Uppy core/xhr-upload ^6.0.0, and Snabbdom ^3.6.4. Vue 3 adapter consumers must use Vue ^3.5.43; Yjs adapter consumers must use Yjs ^13.6.33. React adapters retain their >=17.0.2 peer range, with demos and tests now using React 19. Upgrade all official packages together. See docs/dependency-modernization.md for migration and rollback guidance.
