# wangEditor semantic style presets plugin

[中文文档](./README.md)

## Introduction

`@wangeditor-next/plugin-style-presets` adds semantic text and block style presets to wangEditor v6.
Documents persist stable preset keys while application CSS controls presentation, so themes can
change without rewriting stored content.

The plugin is opt-in. It does not change the existing toolbar, nodes, or HTML output by default.

## Installation

```shell
pnpm add @wangeditor-next/plugin-style-presets
```

## Registration

```ts
import { Boot } from '@wangeditor-next/editor'
import stylePresetsModule from '@wangeditor-next/plugin-style-presets'

// Register once before creating any editor.
Boot.registerModule(stylePresetsModule)
```

## Configuration

```ts
const editorConfig = {
  MENU_CONF: {
    stylePreset: {
      presets: [
        {
          key: 'muted-text',
          title: 'Muted text',
          scope: 'text',
          className: 'article-muted',
        },
        {
          key: 'lead-paragraph',
          title: 'Lead paragraph',
          scope: 'block',
          className: 'article-lead',
        },
      ],
    },
  },
}

const toolbarConfig = {
  insertKeys: {
    index: 4,
    keys: ['stylePreset'],
  },
}
```

- `key`: Stable kebab-case identifier persisted in JSON and HTML. Keep it independent of themes.
- `title`: Label displayed in the toolbar menu.
- `scope: 'text'`: Applies to selected text or subsequent input.
- `scope: 'block'`: Applies to selected paragraphs, headings, list items, and other blocks.
- `className`: Optional whitespace-separated business class names.

The plugin always emits `w-e-style-preset-${key}`, so CSS can target a preset without `className`.

## CSS

```css
.article-muted {
  color: var(--article-muted-color, #667085);
  font-size: 0.875rem;
}

.article-lead {
  color: var(--article-lead-color, #344054);
  font-size: 1.125rem;
  line-height: 1.75;
}
```

Load the same business CSS in the editor and in standalone HTML viewers.

## HTML

Text preset:

```html
<span class="w-e-style-preset-muted-text article-muted" data-w-e-style-preset="muted-text"
  >Muted content</span
>
```

Block preset:

```html
<p class="w-e-style-preset-lead-paragraph article-lead" data-w-e-style-preset="lead-paragraph">
  Article lead
</p>
```

Import prefers `data-w-e-style-preset`. When data is absent, configured business classes are also
recognized. Unknown data keys remain in the document so adding configuration later restores their
presentation.

## Command API

```ts
import {
  applyStylePreset,
  getActiveStylePreset,
  removeStylePreset,
} from '@wangeditor-next/plugin-style-presets'

applyStylePreset(editor, 'muted-text')
getActiveStylePreset(editor) // 'muted-text' | null
removeStylePreset(editor, 'text') // 'text' | 'block' | 'all'
```

## Compatibility

- Supports `@wangeditor-next/editor >= 6.0.0`.
- Does not change the existing inline/class style modes.
- Does not enter the default toolbar automatically.
- Covers `Slate -> HTML -> Slate`, `HTML -> Slate -> HTML`, and `setHtml(getHtml())` round trips.
