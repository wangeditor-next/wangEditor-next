# wangEditor list-module

List module built in [wangeditor-next](https://wangeditor-next.github.io/docs/) by default.

## Semantic heading outlines

Heading outlines preserve the historical list-item JSON shape. The existing `type`, `ordered`,
`level`, and text children remain unchanged; outline-specific fields are optional metadata.

```ts
{
  type: 'list-item',
  ordered: true,
  level: 1,
  headingType: 'header2',
  listMode: 'outline',
  children: [{ text: 'Scope' }],
}
```

- `headingType`: optional original heading type (`'header1'` through `'header6'`)
- `listMode`: optional `'outline'` marker for a semantic heading outline
- `listRestart`: optional restart value for an outline item

The default numbered-list menu applies `listMode: 'outline'` to headings. The visible marker is
derived from heading levels, so `h1`, `h2`, and `h3` render as `1.`, `1.1`, and `1.1.1` without
writing a number into the heading text. Clicking an outline marker provides continue and restart
actions.

## HTML contract

An outline exports semantic `ol > li > hN` HTML, with nested `ol` elements reflecting heading
depth:

```html
<ol data-w-e-list-mode="outline">
  <li data-w-e-list-indent="0" data-w-e-outline-number="1.">
    <h1>Overview</h1>
    <ol data-w-e-list-mode="outline">
      <li data-w-e-list-indent="1" data-w-e-outline-number="1.1"><h2>Scope</h2></li>
    </ol>
  </li>
</ol>
```

`data-w-e-list-indent` preserves a source heading's depth when semantic HTML cannot express a
missing parent level. `data-w-e-outline-number` is derived display metadata. Import recomputes it
from the retained heading level and optional `data-w-e-list-restart`; it is not part of the heading
text. Ordered standard lists carry `data-w-e-list-mode="standard"` so a semantic heading in a
non-outline list round-trips without being reclassified as an outline.

When an outline continues after a separate top-level HTML fragment, its new `ol` receives the
derived `start` value needed for correct rendering outside the editor. Because that fragment also
carries `data-w-e-outline-number`, parsing retains the original implicit continuation rather than
turning it into an explicit restart.

Historical `list-item` JSON and ordinary `<ol><li>text</li></ol>` HTML remain supported. Consumers
that inspect editor JSON can continue using `type: 'list-item'`, `ordered`, `level`, and text
children; they may ignore the optional outline metadata when that feature is not needed.
