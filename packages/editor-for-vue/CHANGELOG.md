# @wangeditor-next/editor-for-vue

## 6.5.0

### Minor Changes

- 527fcba: Modernize the workspace toolchain and expand Slate support to ^0.124.0 || ^0.126.2 while retaining the existing Vue, React, Uppy, Yjs and Snabbdom consumer peer ranges. Keep the release in the 6.x product line without a content-schema migration.

  The Vue adapter keeps Vue 3.0-compatible runtime helpers and declarations, and table resize flags retain their nullable public types. Uppy 6 and i18next 26 are deferred; the full editor continues to use Uppy 5 and i18next 23. Development tooling and collaboration demos use the newer Vite, Vitest, TypeScript, React, Vue, Yjs, y-websocket and UnoCSS integrations. See docs/dependency-modernization.md for supported versions, validation and rollback.

### Patch Changes

- Updated dependencies [0421701]
- Updated dependencies [527fcba]
- Updated dependencies [80d52cb]
  - @wangeditor-next/editor@6.5.0

## 6.4.3

### Patch Changes

- Updated dependencies [a60cb9f]
- Updated dependencies [89843da]
- Updated dependencies [0835b1a]
  - @wangeditor-next/editor@6.4.3

## 6.4.2

### Patch Changes

- Updated dependencies [12f4986]
  - @wangeditor-next/editor@6.4.2

## 6.4.1

### Patch Changes

- @wangeditor-next/editor@6.4.1

## 6.4.0

### Patch Changes

- @wangeditor-next/editor@6.4.0

## 6.3.0

### Patch Changes

- Updated dependencies [8f210be]
  - @wangeditor-next/editor@6.3.0

## 6.2.0

### Patch Changes

- Updated dependencies [2090ba7]
  - @wangeditor-next/editor@6.2.0

## 6.1.1

### Patch Changes

- 05984bf: Unify official packages in one monorepo and release them at the same product version.
  Vue 2 and Vue 3 adapters now use the shared release, provenance, and framework regression workflow.
- Updated dependencies [05984bf]
  - @wangeditor-next/editor@6.1.1

## 5.1.14

Historical releases were published from `wangeditor-next/wangEditor-for-vue3`.
Future releases are published from this monorepo.
