import { SlateEditor } from '@wangeditor-next/editor'

import createEditor from '../../../tests/utils/create-editor'
import { AttachmentElement } from '../src'
import DownloadAttachmentMenu from '../src/module/menu/DownloadAttachment'
import withAttachment from '../src/module/plugin'

describe('download attachment menu', () => {
  const menu = new DownloadAttachmentMenu()

  function genAttachmentElem(): AttachmentElement {
    return {
      type: 'attachment',
      fileName: 'demo.zip',
      link: 'https://example.com/demo.zip',
      children: [{ text: '' }],
    }
  }

  it('getValue should return attachment link', () => {
    const editor = withAttachment(createEditor())

    editor.insertNode(genAttachmentElem())
    editor.select({ path: [0, 1, 0], offset: 0 })

    expect(menu.getValue(editor)).toBe('https://example.com/demo.zip')
  })

  it('isDisabled should be true when selection is not attachment', () => {
    const editor = withAttachment(createEditor())

    editor.select(SlateEditor.start(editor, []))
    expect(menu.isDisabled(editor)).toBe(true)
  })

  it('isDisabled should be false when selection is attachment', () => {
    const editor = withAttachment(createEditor())

    editor.insertNode(genAttachmentElem())
    editor.select({ path: [0, 1, 0], offset: 0 })

    expect(menu.isDisabled(editor)).toBe(false)
  })
})
