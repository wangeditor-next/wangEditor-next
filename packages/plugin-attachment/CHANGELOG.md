# @wangeditor-next/plugin-attachment

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

- 0835b1a: Replace the remaining package Rollup builds with tsdown/Rolldown while preserving ESM, UMD, CSS, multi-entry, and declaration entrypoints.
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

- 133819f: Fix published package entrypoint metadata and validate generated artifact paths.
- f035f0d: Use the documented public globals for internal UMD dependencies.
- Updated dependencies [2090ba7]
  - @wangeditor-next/editor@6.2.0

## 6.1.1

### Patch Changes

- Updated dependencies [05984bf]
  - @wangeditor-next/editor@6.1.1

## 3.0.3

### Patch Changes

- 17638db: fix(release): allow compatible minor peer dependency versions

  Internal peer dependencies now use bounded compatible ranges instead of exact release versions.
  This prevents an editor or basic-modules minor release from unnecessarily forcing a major release of
  these unaffected packages.

## 3.0.2

### Patch Changes

- @wangeditor-next/editor@6.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [96541bb]
  - @wangeditor-next/editor@6.0.1

## 3.0.0

### Patch Changes

- Updated dependencies [79cf24b]
- Updated dependencies [f60d3a7]
- Updated dependencies [588b6d3]
  - @wangeditor-next/editor@6.0.0

## 2.0.16

### Patch Changes

- @wangeditor-next/editor@5.7.16

## 2.0.15

### Patch Changes

- @wangeditor-next/editor@5.7.15

## 2.0.14

### Patch Changes

- Updated dependencies [1e4c59f]
  - @wangeditor-next/editor@5.7.14

## 2.0.13

### Patch Changes

- @wangeditor-next/editor@5.7.13

## 2.0.12

### Patch Changes

- @wangeditor-next/editor@5.7.12

## 2.0.11

### Patch Changes

- @wangeditor-next/editor@5.7.11

## 2.0.10

### Patch Changes

- Updated dependencies [8201b0e]
  - @wangeditor-next/editor@5.7.10

## 2.0.9

### Patch Changes

- Updated dependencies [e512013]
  - @wangeditor-next/editor@5.7.9

## 2.0.8

### Patch Changes

- @wangeditor-next/editor@5.7.8

## 2.0.7

### Patch Changes

- 68a65d3: feat(plugin): add attachment and ctrl-enter plugin packages
- Updated dependencies [8a8ae86]
  - @wangeditor-next/editor@5.7.7
