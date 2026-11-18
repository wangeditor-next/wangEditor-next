---
"@wangeditor-next/core": minor
"@wangeditor-next/video-module": minor
---

Support more `<video>` attributes. Video elements now keep `autoplay`, `loop`, `muted`, `playsinline`, `preload`, `controlslist` and `disablepictureinpicture` through `setHtml`/paste parsing, editor rendering and `getHtml`, and the new opt-in `MENU_CONF.insertVideo.attributes` option sets them on newly inserted and uploaded videos. Unsupported values are ignored, the editor does not autoplay videos while editing, and nothing changes when the option is not set.
