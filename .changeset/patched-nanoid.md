---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/basic-modules': patch
'@wangeditor-next/table-module': patch
'@wangeditor-next/video-module': patch
'@wangeditor-next/plugin-formula': patch
---

Bundle and resolve Nano ID 5.1.16 or newer to include fixes for invalid-size denial of service and integer overflow. Retain the existing ^5.0.0 modular peer contract and no-argument ID generation API; modular consumers should update their installed Nano ID to the patched version.
