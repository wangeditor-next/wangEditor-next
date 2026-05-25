/**
 * @description color menus test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import { isHTMLElememt } from '../../../../packages/core/src/utils/dom'
import createEditor from '../../../../tests/utils/create-editor'
import { preNode } from '../../../code-highlight/__tests__/content'
import BgColorMenu from '../../src/modules/color/menu/BgColorMenu'
import ColorMenu from '../../src/modules/color/menu/ColorMenu'

// jsdom 不支持 getClientRects https://github.com/jsdom/jsdom/issues/3729
document.createRange = () => {
  const range = new Range()

  range.getClientRects = () => ({
    item: () => null,
    length: 0,
    * [Symbol.iterator]() {
      yield* []
    },
  })
  return range
}

describe('color menus', () => {
  let editor: any
  let startLocation: any

  const menus = [
    {
      mark: 'color',
      menu: new ColorMenu(),
    },
    {
      mark: 'bgColor',
      menu: new BgColorMenu(),
    },
  ]

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  // exec 无代码，不用测试

  it('getValue and isActive', () => {
    editor.select(startLocation)

    menus.forEach(({ menu }) => {
      expect(menu.getValue(editor)).toBe('')
      expect(menu.isActive(editor)).toBeFalsy()
    })

    editor.insertText('hello') // 插入文字
    editor.select([]) // 全选
    menus.forEach(({ mark, menu }) => {
      editor.addMark(mark, 'rgb(51, 51, 51)') // 添加 color bgColor
      expect(menu.getValue(editor)).toBe('rgb(51, 51, 51)')
      expect(menu.isActive(editor)).toBeTruthy()
    })
  })

  it('is disabled', () => {
    editor.select(startLocation)
    menus.forEach(({ menu }) => {
      expect(menu.isDisabled(editor)).toBeFalsy()
    })

    editor.insertNode(preNode)
    menus.forEach(({ menu }) => {
      expect(menu.isDisabled(editor)).toBeTruthy()
    })
    // Transforms.removeNodes(editor, { mode: 'highest' }) // 移除 pre/code
  })

  it('get panel content elem', () => {
    menus.forEach(({ menu }) => {
      const elem = menu.getPanelContentElem(editor)

      expect(isHTMLElememt(elem)).toBeTruthy()
    })
  })
  it('should handle click event and add mark to editor', () => {
    const menu = new ColorMenu()
    const textEditor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello', color: '#000' }] }],
    })
    const panelContent = menu.getPanelContentElem(textEditor)

    document.body.appendChild(panelContent)

    const li = panelContent.querySelector('li[data-value="rgb(120, 6, 80)"]') as HTMLLIElement

    textEditor.select([])
    li.click()

    const text: any = textEditor.children[0]
    const color = text.children[0].color

    expect(color).toBe('rgb(120, 6, 80)')
  })

  it('should handle click event and remove mark from editor', () => {
    const menu = new ColorMenu()
    const textEditor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello', color: 'rgb(120, 6, 80)' }] }],
    })

    textEditor.select([])
    editor.addMark('color', 'rgb(120, 6, 80)')
    const panelContent = menu.getPanelContentElem(textEditor)

    document.body.appendChild(panelContent)

    const li = panelContent.querySelector('li[data-value="0"]') as HTMLLIElement

    textEditor.select([])
    li.click()

    const text: any = textEditor.children[0]
    const color = text.children[0].color

    expect(color).toBeUndefined()
  })
})
