import { Editor } from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import withMarkdown from '../src/module/plugin'

const createMarkdownEditor = () => createEditor({
  content: [{ type: 'paragraph', children: [{ text: '' }] }],
  plugins: [withMarkdown],
})

describe('plugin-markdown', () => {
  it('converts headings when typing space', () => {
    const editor = createMarkdownEditor()

    editor.select(Editor.start(editor, []))
    editor.insertText('#')
    editor.insertText(' ')

    expect(editor.children[0].type).toBe('header1')
  })

  it('converts divider when pressing enter after ---', () => {
    const editor = createMarkdownEditor()

    editor.select(Editor.start(editor, []))
    editor.insertText('---')
    editor.insertBreak()

    expect(editor.children[0].type).toBe('divider')
  })
})
