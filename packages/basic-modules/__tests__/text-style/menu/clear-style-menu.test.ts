/**
 * @description clear style menu test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import ClearStyleMenu from '../../../src/modules/text-style/menu/ClearStyleMenu'

describe('clear style menu', () => {
  const menu = new ClearStyleMenu()
  let editor: ReturnType<typeof createEditor>
  let startLocation: ReturnType<typeof Editor.start>

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })

  it('is disabled', () => {
    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('exec', () => {
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()

    editor.select(startLocation)
    editor.insertText('hello')

    editor.select([])
    editor.addMark('bold', true)
    editor.addMark('italic', true)

    menu.exec(editor, '') // 清空样式

    const marks = Editor.marks(editor) as any

    expect(marks.bold).toBeUndefined()
    expect(marks.italic).toBeUndefined()
  })
})
