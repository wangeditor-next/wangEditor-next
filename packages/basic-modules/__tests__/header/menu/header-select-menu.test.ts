/**
 * @description header select menu test
 * @author wangfupeng
 */

import { Editor, Transforms } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import HeaderSelectMenu from '../../../src/modules/header/menu/HeaderSelectMenu'

describe('header select menu', () => {
  const editor = createEditor()
  const startLocation = Editor.start(editor, [])
  const menu = new HeaderSelectMenu()

  it('get options', () => {
    editor.select(startLocation)
    expect(menu.isActive(editor)).toBeFalsy()
    const options1 = menu.getOptions(editor)
    const selectedP = options1.some(opt => opt.selected && opt.value === 'paragraph') // 选中“文本”

    expect(selectedP).toBeTruthy()

    Transforms.setNodes(editor, { type: 'header1' })
    const options2 = menu.getOptions(editor)
    const selectedHeader = options2.some(opt => opt.selected && opt.value === 'header1') // 选中“h1”

    expect(selectedHeader).toBeTruthy()
  })

  it('is disabled', () => {
    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('exec', () => {
    editor.select(startLocation)

    menu.exec(editor, 'header1')
    const headers1 = editor.getElemsByTypePrefix('header1')

    expect(headers1.length).toBe(1)
  })
})
