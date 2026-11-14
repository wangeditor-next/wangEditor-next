---
"@wangeditor-next/basic-modules": minor
"@wangeditor-next/core": minor
"@wangeditor-next/plugin-float-image": minor
---

Support native image lazy loading. Image elements now keep the `<img loading="lazy|eager">` attribute through `setHtml`/paste parsing, editor rendering and `getHtml`, and the new opt-in `MENU_CONF.insertImage.loading` option sets it on newly inserted and uploaded images. Unsupported values are ignored and nothing changes when the option is not set.
