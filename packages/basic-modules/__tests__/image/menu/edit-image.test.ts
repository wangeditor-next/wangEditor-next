/**
 * @description edit image menu test
 * @author wangfupeng
 */

import { fireEvent, waitFor } from '@testing-library/dom'
import { Editor } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import EditImage from '../../../src/modules/image/menu/EditImage'

describe('edit image menu', () => {
  const menu = new EditImage()
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

  it('get modal content elem', () => {
    const imageElem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }

    expect(() => menu.getModalContentElem(editor)).toThrow('Not found selected image node')
    editor.select(startLocation)
    editor.insertNode(imageElem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })

    const elem = menu.getModalContentElem(editor)

    expect(elem.tagName).toBe('DIV')

    // updateImage 在 helper.test.ts 中测试
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

    const elem = menu.getModalContentElem(editor)

    document.body.appendChild(elem)

    // 使用类型断言访问私有属性
    const inputSrc = document.getElementById((menu as any).srcInputId) as HTMLInputElement
    const inputAlt = document.getElementById((menu as any).altInputId) as HTMLInputElement
    const inputHref = document.getElementById((menu as any).hrefInputId) as HTMLInputElement
    const button = document.getElementById((menu as any).buttonId) as HTMLButtonElement

    // 模拟用户输入
    inputSrc.value = 'https://example.com/new-image.jpg'
    inputAlt.value = 'new alt text'
    inputHref.value = 'https://example.com/new-link'

    // 设置 spy 监听 updateImage 方法
    const spy = vi.spyOn(menu as any, 'updateImage')

    // 模拟点击事件
    editor.deselect()
    fireEvent.click(button)

    // 检查 updateImage 方法是否被调用
    expect(spy).toHaveBeenCalledWith(
      expect.any(Object), // editor 对象
      'https://example.com/new-image.jpg',
      'new alt text',
      'https://example.com/new-link',
    )

    editor.select(startLocation)
    fireEvent.click(button)
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
    const inputSrc = elem.querySelector(`#${(menu as any).srcInputId}`) as HTMLInputElement

    vi.spyOn(inputSrc, 'focus')

    await waitFor(() => {
      expect(inputSrc.focus).toHaveBeenCalled()
    })
  })
})
