---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
'@wangeditor-next/upload-image-module': patch
'@wangeditor-next/video-module': patch
---

Upgrade the Uppy integration to v5 while keeping upload behavior compatible.

- bump `@uppy/core` and `@uppy/xhr-upload` in `@wangeditor-next/editor` to `^5.0.0`
- extend peer dependency ranges in `core`, `upload-image-module`, and `video-module` to support both Uppy v2 and v5
- normalize upload header values to strings for stricter Uppy v5 XHR typings
- add a guarded `AbortSignal.any` fallback for environments that do not implement it
