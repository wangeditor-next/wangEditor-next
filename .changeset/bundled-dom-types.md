---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/editor-for-react': patch
---

Keep Babel runtime transforms away from declaration files so bundled DOM aliases and React component signatures remain intact. Validate published declarations for unresolved names during builds.
