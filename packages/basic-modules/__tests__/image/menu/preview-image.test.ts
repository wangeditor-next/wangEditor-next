/**
 * @description preview image menu test
 */

import { Editor } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import PreviewImage from '../../../src/modules/image/menu/PreviewImage'

describe('preview image menu', () => {
  const menu = new PreviewImage()
  let editor: any
  let startLocation: any

  const src = 'https://www.wangeditor.com/imgs/logo.png'
  const alt = 'logo'

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('getValue and isDisabled', () => {
    editor.select(startLocation)
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()
    expect(menu.isDisabled(editor)).toBeTruthy()

    const elem = {
      type: 'image',
      src,
      alt,
      href: '',
      style: { width: '100', height: '80' },
      children: [{ text: '' }],
    }

    editor.insertNode(elem)
    editor.select({
      path: [0, 1, 0],
      offset: 0,
    })
    expect(menu.getValue(editor)).toBe(src)
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('exec', () => {
    editor.select(startLocation)
    const value = ''
    const url = 'https://github.com/wangeditor-next/wangEditor-next'

    expect(menu.exec(editor, value)).toBeUndefined()
    const elem = {
      type: 'image',
      src,
      alt,
      href: '',
      style: { width: '100', height: '80' },
      children: [{ text: '' }],
    }

    editor.insertNode(elem)
    editor.select({
      path: [0, 1, 0],
      offset: 0,
    })
    expect(() => menu.exec(editor, value)).toThrow(
      `Preview image failed, image.src is '${value}'`,
    )
    menu.exec(editor, url)
  })
})
