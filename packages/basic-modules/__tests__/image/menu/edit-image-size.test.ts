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

  it('should restore the image selection and update its size repeatedly', async () => {
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
    await Promise.resolve()

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

    editor.deselect()
    fireEvent.click(button)
    expect(editor.getElemsByTypePrefix('image')[0].style).toEqual({ width: '100px', height: '30px' })
    // 模拟用户输入
    widthInputId.value = '100%'
    heightInputId.value = '30%'

    editor.deselect()
    fireEvent.click(button)
    expect(editor.getElemsByTypePrefix('image')[0].style).toEqual({ width: '100%', height: '30%' })
    // 模拟用户输入
    widthInputId.value = '100px'
    heightInputId.value = '30px'

    editor.deselect()
    fireEvent.click(button)
    expect(editor.getElemsByTypePrefix('image')[0].style).toEqual({ width: '100px', height: '30px' })

    widthInputId.value = 'auto'
    heightInputId.value = 'auto'
    editor.deselect()
    fireEvent.click(button)
    expect(editor.getElemsByTypePrefix('image')[0].style).toEqual({ width: '', height: '' })
    expect(spy).toHaveBeenCalledTimes(4)
  })

  it.each([false, true])('resizes the current image when first saved is %s', async firstSaved => {
    const sizeMenu = new EditImageSize()
    const firstImage = {
      type: 'image', src, alt, href,
      style: { width: '100px', height: '80px' }, children: [{ text: '' }],
    }
    const secondImage = {
      ...firstImage, src: 'https://example.com/second.png', alt: 'second', href: '',
      style: { width: '101px', height: '33px' },
    }

    editor = createEditor({
      content: [firstImage, secondImage].map(image => ({
        type: 'paragraph', children: [{ text: '' }, image, { text: '' }],
      })),
    })
    editor.select({ path: [0, 1, 0], offset: 0 })
    await Promise.resolve()
    const elem = sizeMenu.getModalContentElem(editor)

    document.body.appendChild(elem)

    if (firstSaved) {
      const inputs = elem.querySelectorAll('input')

      inputs[0].value = '120px'
      inputs[1].value = '90px'
      fireEvent.click(elem.querySelector('button')!)
      await Promise.resolve()
    }

    const [firstBefore, secondBefore] = editor.getElemsByTypePrefix('image')

    editor.select({ path: [1, 1, 0], offset: 0 })
    await Promise.resolve()
    expect(sizeMenu.getModalContentElem(editor)).toBe(elem)
    const inputs = elem.querySelectorAll('input')

    expect([...inputs].map(input => input.value)).toEqual(['101px', '33px'])
    inputs[0].value = '200px'
    inputs[1].value = '66px'
    editor.deselect()
    fireEvent.click(elem.querySelector('button')!)

    const [firstAfter, secondAfter] = editor.getElemsByTypePrefix('image')

    expect(firstAfter).toEqual(firstBefore)
    expect(secondAfter).toEqual({ ...secondBefore, style: { width: '200px', height: '66px' } })
  })

  it('does not resize the previous image when the restored selection is not an image', async () => {
    const sizeMenu = new EditImageSize()

    editor = createEditor({
      html: `<p><img src="${src}" style="width: 100px; height: 80px;"></p><p>text</p>`,
    })
    editor.select({ path: [0, 0, 0], offset: 0 })
    await Promise.resolve()
    const elem = sizeMenu.getModalContentElem(editor)

    document.body.appendChild(elem)
    const inputs = elem.querySelectorAll('input')

    inputs[0].value = '200px'
    inputs[1].value = '66px'
    editor.select({ path: [1, 0], offset: 0 })
    await Promise.resolve()
    const before = editor.getHtml()
    const hideSpy = vi.spyOn(editor, 'hidePanelOrModal')

    fireEvent.click(elem.querySelector('button')!)
    expect(editor.getHtml()).toBe(before)
    expect(hideSpy).not.toHaveBeenCalled()
  })

  it('uses imageResize unit and validation before updating the image', () => {
    const checkImageSize = vi.fn(() => true)
    const sizeMenu = new EditImageSize()

    editor = createEditor({ config: { imageResize: { resizeUnit: 'px', checkImageSize } } })

    const imageElem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100px', height: '80px' },
      children: [{ text: '' }],
    }

    editor.select(Editor.start(editor, []))
    editor.insertNode(imageElem)
    editor.select({ path: [0, 1, 0], offset: 0 })

    const hideSpy = vi.spyOn(editor, 'hidePanelOrModal')
    const alertSpy = vi.spyOn(editor, 'alert')
    const elem = sizeMenu.getModalContentElem(editor)

    document.body.appendChild(elem)

    const widthInput = document.getElementById((sizeMenu as any).widthInputId) as HTMLInputElement
    const heightInput = document.getElementById((sizeMenu as any).heightInputId) as HTMLInputElement
    const button = document.getElementById((sizeMenu as any).buttonId) as HTMLButtonElement

    widthInput.value = '100px'
    heightInput.value = '30px'

    fireEvent.click(button)

    expect(checkImageSize).toHaveBeenCalledWith({
      width: '100px',
      height: '30px',
      rawWidth: '100px',
      rawHeight: '30px',
      source: 'modal',
    })
    expect(alertSpy).not.toHaveBeenCalled()
    expect(hideSpy).toHaveBeenCalled()

    const image = editor.getElemsByTypePrefix('image')[0]

    expect(image.style.width).toBe('100px')
    expect(image.style.height).toBe('30px')
  })

  it('rejects non-px input without changing the image', () => {
    const sizeMenu = new EditImageSize()

    editor = createEditor({ config: { imageResize: { resizeUnit: 'px' } } })

    const imageElem = {
      type: 'image',
      src,
      alt,
      href,
      style: { width: '100px', height: '80px' },
      children: [{ text: '' }],
    }

    editor.select(Editor.start(editor, []))
    editor.insertNode(imageElem)
    editor.select({ path: [0, 1, 0], offset: 0 })

    const hideSpy = vi.spyOn(editor, 'hidePanelOrModal')
    const alertSpy = vi.spyOn(editor, 'alert')
    const elem = sizeMenu.getModalContentElem(editor)

    document.body.appendChild(elem)

    const widthInput = document.getElementById((sizeMenu as any).widthInputId) as HTMLInputElement
    const heightInput = document.getElementById((sizeMenu as any).heightInputId) as HTMLInputElement
    const button = document.getElementById((sizeMenu as any).buttonId) as HTMLButtonElement

    widthInput.value = '100%'
    heightInput.value = '30%'
    fireEvent.click(button)

    expect(alertSpy).toHaveBeenCalledWith('图片宽高只能使用 px 单位', 'error')
    expect(hideSpy).not.toHaveBeenCalled()
    const image = editor.getElemsByTypePrefix('image')[0]

    expect(image.style.width).toBe('100px')
    expect(image.style.height).toBe('80px')
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
