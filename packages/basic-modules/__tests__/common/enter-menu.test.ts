/**
 * @description enter menu test
 * @author cycleccc
 */

import { Editor } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import EnterMenu from '../../src/modules/common/menu/EnterMenu'

describe('enter menu', () => {
  const menu = new EnterMenu()
  let editor: any
  let startLocation: any

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('is disabled', () => {
    editor.deselect()
    expect(menu.isDisabled(editor)).toBeTruthy()
    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeFalsy()
    editor.insertText('hello')
    editor.select([])
    expect(menu.isDisabled(editor)).toBeTruthy()
  })

  it('exec', () => {
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()
    editor.deselect()
    expect(menu.exec(editor, '')).toBeUndefined()
    editor.select(startLocation)
    menu.exec(editor, '')
    expect(editor.children).toStrictEqual([
      { children: [{ text: '' }], type: 'paragraph' },
      { children: [{ text: '' }], type: 'paragraph' },
    ])
  })
})
