---
'@wangeditor-next/upload-image-module': patch
'@wangeditor-next/plugin-attachment': patch
'@wangeditor-next/plugin-ctrl-enter': patch
---

fix(release): allow compatible minor peer dependency versions

Internal peer dependencies now use bounded compatible ranges instead of exact release versions.
This prevents an editor or basic-modules minor release from unnecessarily forcing a major release of
these unaffected packages.
