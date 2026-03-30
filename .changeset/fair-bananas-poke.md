---
"@wangeditor-next/basic-modules": patch
"@wangeditor-next/core": patch
"@wangeditor-next/list-module": patch
"@wangeditor-next/plugin-float-image": patch
"@wangeditor-next/table-module": patch
"@wangeditor-next/video-module": patch
---

feat(csp): add class-based editor style output mode

Add a new `textStyleMode` editor config (`inline` by default, `class` optional).

When `textStyleMode: 'class'`, style export/import/render paths for:
- `color`, `bgColor`, `fontSize`, `fontFamily`
- `textAlign`, `lineHeight`, `indent`

now use deterministic class names with `data-w-e-*` attributes instead of inline styles.

This preserves existing behavior by default while enabling stricter CSP deployments that avoid inline text style attributes.

Also add CSP class-mode export support for:
- basic `image` elem html export/parse
- `video-module` video/iframe alignment and size export/parse
- `list-module` list marker color export
- `table-module` table/row/cell export/parse fallback (class/data attrs)
- `plugin-float-image` export/parse

These paths now avoid inline `style` attributes when `textStyleMode: 'class'` is enabled.
