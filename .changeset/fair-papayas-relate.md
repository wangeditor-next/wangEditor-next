---
'@wangeditor-next/editor': patch
'@wangeditor-next/core': patch
---

Add a lightweight subpath `@wangeditor-next/editor/core` for on-demand module composition,
and a separate `@wangeditor-next/editor/upload` entry for uploader APIs. The core subpath avoids
auto-registering built-in modules and does not include upload runtime code.

Align Babel transpilation targets with the repository browserslist (drop hardcoded `ie 11`
target) to reduce bundle size.

Add a tiptap-like composition API for the `@wangeditor-next/editor/core` subpath via extensions
and factory-based creation helpers.

Mark Uppy peer dependencies in `@wangeditor-next/core` as optional so lightweight installs do not
need upload runtime packages unless upload APIs are used.
