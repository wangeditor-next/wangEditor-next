---
'@wangeditor-next/core': minor
'@wangeditor-next/basic-modules': minor
'@wangeditor-next/list-module': minor
'@wangeditor-next/editor': minor
---

feat(list): support semantic heading outline numbering for #912

The numbered-list menu can turn headings into semantic outline items. It keeps the established
`type: 'list-item'`, `ordered`, `level`, and text-child JSON shape, and adds optional
`headingType`, `listMode: 'outline'`, and `listRestart` metadata. Headings render with derived
outline markers, support continue/restart actions, and export as semantic `ol > li > hN` HTML.
Existing list JSON and ordinary list HTML keep their historical behavior.

`core` adds an optional module-level `htmlTransform` hook for serializers that need neighboring
top-level blocks. `basic-modules` recognizes an outline item's optional heading metadata in the
header menu.
