# @wangeditor-next/editor-for-react

## 6.5.0

### Minor Changes

- 527fcba: Modernize the workspace toolchain and expand Slate support to ^0.124.0 || ^0.126.2 while retaining the existing Vue, React, Uppy, Yjs and Snabbdom consumer peer ranges. Keep the release in the 6.x product line without a content-schema migration.

  The Vue adapter keeps Vue 3.0-compatible runtime helpers and declarations, and table resize flags retain their nullable public types. Uppy 6 and i18next 26 are deferred; the full editor continues to use Uppy 5 and i18next 23. Development tooling and collaboration demos use the newer Vite, Vitest, TypeScript, React, Vue, Yjs, y-websocket and UnoCSS integrations. See docs/dependency-modernization.md for supported versions, validation and rollback.

### Patch Changes

- 0421701: Preserve DOM aliases with explicit type/value declarations and keep Babel runtime transforms away from declaration files so React component signatures remain intact. Validate published declarations for unresolved names during builds.
- c94a9fe: Preserve editor-owned content when `value` is omitted. `defaultHtml` and collaborative updates no longer trigger an implicit `setHtml('')`; explicitly passing `value=""` still clears a controlled editor. The React Yjs demos now let Yjs own the document instead of feeding HTML back through a controlled value.
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

## 3.0.0

### Patch Changes

- Updated dependencies [79cf24b]
- Updated dependencies [f60d3a7]
- Updated dependencies [588b6d3]
  - @wangeditor-next/editor@6.0.0

## 2.0.3

### Patch Changes

- 0224cbd: Keep Editor style and className props on the actual editor root when using the built-in loading overlay.
  - @wangeditor-next/editor@5.7.12

## 2.0.2

### Patch Changes

- a341fd2: chore: relax internal peer dependency ranges to reduce forced lockstep upgrades.
  - @wangeditor-next/editor@5.7.8

## 2.0.1

### Patch Changes

- 6c98f0c: add built-in `loading`/`loadingText` overlay props on `Editor` to avoid wrapper-induced DOM changes
- Updated dependencies [f8d9577]
- Updated dependencies [0459fb2]
  - @wangeditor-next/editor@5.7.6

## 2.0.0

### Patch Changes

- Updated dependencies [fe22817]
- Updated dependencies [d51d961]
  - @wangeditor-next/editor@5.7.0

## 1.0.11

### Patch Changes

- b311b76: fix(for-react): incorrect destruction logic in toolbar
- Updated dependencies [6b823fa]
  - @wangeditor-next/editor@5.6.48

## 1.0.10

### Patch Changes

- a4b6fd8: chore: add rollup package link
- Updated dependencies [e204312]
- Updated dependencies [a4b6fd8]
  - @wangeditor-next/editor@5.6.40

## 1.0.9

### Patch Changes

- 08fbf75: add attr judgment
