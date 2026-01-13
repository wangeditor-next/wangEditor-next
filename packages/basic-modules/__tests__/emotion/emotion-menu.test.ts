/**
 * @description emotion menu test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import { isHTMLElememt } from '../../../../packages/core/src/utils/dom'
import createEditor from '../../../../tests/utils/create-editor'
import EmotionMenu from '../../src/modules/emotion/menu/EmotionMenu'

describe('font family menu', () => {
  const menu = new EmotionMenu()
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
    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeFalsy()

    editor.insertNode({ type: 'pre', children: [{ type: 'code', children: [{ text: 'var' }], language: '' }] })
    expect(menu.isDisabled(editor)).toBeTruthy()
    // Transforms.removeNodes(editor, { mode: 'highest' }) // 移除 pre/code
  })

  it('get panel content elem', () => {
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()

    const elem = menu.getPanelContentElem(editor)

    expect(isHTMLElememt(elem)).toBeTruthy()
    document.body.appendChild(elem)

    const li = elem.querySelector('li') as HTMLLIElement

    editor.select([])
    li.click()

    expect(editor.getText()).toBe('😀')
  })
})
