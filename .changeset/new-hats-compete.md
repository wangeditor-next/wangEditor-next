---
'@wangeditor-next/core': patch
'@wangeditor-next/editor': patch
---

Fix toolbar object config compatibility for single menus such as `fontSize`.

`toolbarKeys` items like `{ key: 'fontSize', title: '文字大小' }` are now treated
as single-menu configs (instead of menu groups) when `menuKeys` is absent, so
`MENU_CONF.fontSize.fontSizeList` and the select dropdown keep working together.
