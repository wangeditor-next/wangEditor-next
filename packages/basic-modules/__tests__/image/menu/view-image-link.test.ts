/**
 * @description view image link menu test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import ViewImageLink from '../../../src/modules/image/menu/ViewImageLink'

describe('view image link menu', () => {
  const menu = new ViewImageLink()
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

  it('getValue and isDisabled', () => {
    editor.select(startLocation)
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBeFalsy()
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
    expect(menu.getValue(editor)).toBe(href)
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
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }

    editor.insertNode(elem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })
    expect(() => menu.exec(editor, value)).toThrow(
      `View image link failed, image.href is '${value}'`,
    )
    menu.exec(editor, url)
  })
})
