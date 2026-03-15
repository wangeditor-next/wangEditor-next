/**
 * @description insert link menu test
 * @author wangfupeng
 */

import { waitFor } from '@testing-library/dom'
import { Editor } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import InsertLinkMenu from '../../../src/modules/link/menu/InsertLink'

describe('insert link menu', () => {
  let editor: any
  let startLocation: any
  const menu = new InsertLinkMenu()

  const linkNode = {
    type: 'link',
    url: 'https://wangeditor-next.github.io/docs/',
    children: [{ text: 'xxx' }],
  }

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })
  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('get modal position node', () => {
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()
    expect(menu.getModalPositionNode(editor)).toBeNull()
  })

  it('is disable', () => {
    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('get modal content elem', () => {
    const spy = vi.spyOn(editor, 'hidePanelOrModal')
    const elem = menu.getModalContentElem(editor)

    editor.select(startLocation)
    editor.insertText('test')
    document.body.appendChild(elem)

    const textInputId = document.getElementById((menu as any).textInputId) as HTMLInputElement
    const urlInputId = document.getElementById((menu as any).urlInputId) as HTMLInputElement
    const button = document.getElementById((menu as any).buttonId) as HTMLButtonElement
    // 模拟用户输入

    textInputId.value = 'hello'
    urlInputId.value = 'https://wangeditor-next.github.io/docs/'
    editor.select(startLocation)
    button.click()

    expect(elem.tagName).toBe('DIV')
    expect(spy).toHaveBeenCalled()
  })

  it('focus input asynchronously', async () => {
    editor.select(startLocation)
    editor.insertNode(linkNode)
    editor.select([])

    const elem = menu.getModalContentElem(editor)

    document.body.appendChild(elem)
    const inputSrc = elem.querySelector(`#${(menu as any).textInputId}`) as HTMLInputElement

    vi.spyOn(inputSrc, 'focus')

    await waitFor(() => {
      expect(inputSrc.focus).toHaveBeenCalled()
    })
  })
})
