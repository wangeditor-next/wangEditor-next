---
'@wangeditor-next/video-module': major
'@wangeditor-next/basic-modules': minor
'@wangeditor-next/editor': major
---

Redesign built-in video alignment as explicit block-media layout. Video nodes now use
`align: 'left' | 'center' | 'right'`, render and export through a responsive flex-based `<figure>`,
and expose dedicated alignment controls in the video hoverbar. Legacy `text-align` HTML remains
importable and is migrated to the new media alignment model.
