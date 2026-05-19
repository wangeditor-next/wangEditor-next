import { DomEditor } from '@wangeditor-next/editor'
import { Editor } from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import withMarkdown from '../src/module/plugin'

const createMarkdownEditor = () => withMarkdown(createEditor({
  content: [{ type: 'paragraph', children: [{ text: '' }] }],
}))

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

  it('skips markdown trigger while composing', () => {
    const editor = createMarkdownEditor()
    const textarea = DomEditor.getTextarea(editor)

    editor.select(Editor.start(editor, []))
    editor.insertText('#')

    textarea.isComposing = true
    editor.insertText(' ')
    textarea.isComposing = false

    expect(editor.children[0].type).toBe('paragraph')
    expect(Editor.string(editor, [0])).toBe('# ')
  })
})
