---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

fix beforeinput selection recovery after undo on void blocks (e.g. divider and code block) to avoid stale DOM range crashes and dropped input in demo flows
