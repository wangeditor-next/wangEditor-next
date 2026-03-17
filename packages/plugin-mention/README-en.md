# wangEditor mention plugin

[中文文档](./README.md)

## Introduction

[wangeditor-next](https://github.com/cycleccc/wangEditor-next) mention plugin, like `@James`.

![](./_img/demo.png)

## Installation

```shell
pnpm add @wangeditor-next/plugin-mention
```

## Usage

[Vue demo source code](https://github.com/wangfupeng1988/vue2-wangeditor-demo/blob/master/src/components/MyEditorWithMention.vue)

### Use in editor

```ts
import { IDomEditor, Boot, IEditorConfig } from '@wangeditor-next/editor'
import mentionModule, { MentionElement } from '@wangeditor-next/plugin-mention'

// Register
// You should register this before create editor, and register only once (not repeatedly).
Boot.registerModule(mentionModule)

// Show your modal
function showModal(editor: IDomEditor) {
  // Get cursor's position info, to set modal position
  const domSelection = document.getSelection()
  const domRange = domSelection.getRangeAt(0)
  if (domRange == null) return
  const selectionRect = domRange.getBoundingClientRect()

  // Get editor container's position info, maybe help to get right modal position
  const containerRect = editor.getEditableContainer().getBoundingClientRect()

  // Show your modal, and set position
  // PS: You must implement the modal yourself, use <div> or Vue React component


  // Insert mention node when emit some event.
  function insertMention() {
    const mentionNode: MentionElement = {
      type: 'mention', // must be 'mention'
      value: 'James', // text
      info: { x: 1, y: 2 }, // extended info
      children: [{ text: '' }], // must have an empty text node in children
    }

    editor.restoreSelection()
    editor.deleteBackward('character') // delete '@'
    editor.insertNode(mentionNode)
    editor.move(1) // move curser
  }
}

// hide your modal
function hideModal(editor: IDomEditor) {
  // hide your modal
}

// editor config
const editorConfig: Partial<IEditorConfig> = {
  EXTEND_CONF: {
    mentionConfig: {
      showModal, // required
      hideModal, // required
    },
  },

  // others...
}

// Then create editor and toolbar, you will use `editorConfig`
```

### Render HTML

You will get a mention's HTML format like this. You need to `decodeURIComponent` the value of `data-info`.

```html
<span data-w-e-type="mention" data-w-e-is-void data-w-e-is-inline data-value="James" data-info="%7B%22x%22%3A10%7D">@James</span>
```

