import createEditor from '../../../tests/utils/create-editor'
import { AttachmentElement } from '../src'
import withAttachment from '../src/module/plugin'

describe('plugin-attachment', () => {
  const editor = withAttachment(createEditor())
  const elem: AttachmentElement = {
    type: 'attachment',
    fileName: 'a.zip',
    link: 'https://example.com/a.zip',
    children: [{ text: '' }],
  }

  it('marks attachment as inline', () => {
    expect(editor.isInline(elem)).toBe(true)
  })

  it('marks attachment as void', () => {
    expect(editor.isVoid(elem)).toBe(true)
  })
})
