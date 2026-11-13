---
"@wangeditor-next/basic-modules": minor
"@wangeditor-next/upload-image-module": minor
"@wangeditor-next/core": minor
---

Add opt-in `MENU_CONF.uploadImage.insertAsBlock` so each uploaded image is inserted in its own paragraph instead of flowing inline next to the previous one. The default stays inline; `insertImageNode` accepts a new `{ block }` option for custom integrations.
