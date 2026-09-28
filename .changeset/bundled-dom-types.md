---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/editor-for-react': patch
---

Preserve DOM aliases with explicit type/value declarations and keep Babel runtime transforms away from declaration files so React component signatures remain intact. Validate published declarations for unresolved names during builds.
