/**
 * @description edit image menu test
 * @author cycleccc
 */

import { fireEvent, waitFor } from '@testing-library/dom'
import { Editor } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import EditImageSize from '../../../src/modules/image/menu/EditImageSizeMenu'

describe('edit image size menu', () => {
  const menu = new EditImageSize()
  let editor: any
  let startLocation: any

  const src = 'https://www.wangeditor.com/imgs/logo.png'
  const alt = 'logo'
  const href = 'https://www.wangeditor.com/'

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('exec', async () => {
    expect(menu.exec(editor, '')).toBeUndefined()
  })

  it('is disabled', () => {
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()

    editor.deselect()
    expect(menu.isDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeTruthy()

    const elem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }

    editor.insertNode(elem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('get modal position node', () => {
    editor.select(startLocation)
    expect(menu.getModalPositionNode(editor)).toBeNull()

    const elem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }

    editor.insertNode(elem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })
    const imageNode = menu.getModalPositionNode(editor)

    expect((imageNode as any).src).toBe(src)
  })

  it('should handle button click and update image', () => {
    const imageElem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }

    editor.select(startLocation)
    editor.insertNode(imageElem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })

    const spy = vi.spyOn(editor, 'hidePanelOrModal')
    const elem = menu.getModalContentElem(editor)

    document.body.appendChild(elem)

    // 使用类型断言访问私有属性
    const widthInputId = document.getElementById((menu as any).widthInputId) as HTMLInputElement
    const heightInputId = document.getElementById((menu as any).heightInputId) as HTMLInputElement
    const button = document.getElementById((menu as any).buttonId) as HTMLButtonElement

    // 模拟用户输入
    widthInputId.value = '100'
    heightInputId.value = '30'

    editor.select(startLocation)
    fireEvent.click(button)
    // 模拟用户输入
    widthInputId.value = '100%'
    heightInputId.value = '30%'

    editor.select(startLocation)
    fireEvent.click(button)
    // 模拟用户输入
    widthInputId.value = '100px'
    heightInputId.value = '30px'

    editor.select(startLocation)
    fireEvent.click(button)
    expect(spy).toHaveBeenCalled()
  })

  it('focus input asynchronously', async () => {
    const imageElem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }],
    }

    editor.select(startLocation)
    editor.insertNode(imageElem)
    editor.select({
      path: [0, 1, 0],
      offset: 0,
    })

    const elem = menu.getModalContentElem(editor)

    document.body.appendChild(elem)
    const inputSrc = elem.querySelector(`#${(menu as any).widthInputId}`) as HTMLInputElement

    vi.spyOn(inputSrc, 'focus')

    await waitFor(() => {
      expect(inputSrc.focus).toHaveBeenCalled()
    })
  })
})
