/**
 * @description decrease indent menu test
 * @author wangfupeng
 */

import { Editor, Transforms } from 'slate'

import createEditor from '../../../../../tests/utils/create-editor'
import DecreaseIndentMenu from '../../../src/modules/indent/menu/DecreaseIndentMenu'

describe('decrease indent menu', () => {
  let editor: any
  let startLocation: any

  const menu = new DecreaseIndentMenu()

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
    expect(menu.isDisabled(editor)).toBeTruthy() // 没有 indent 则 disabled

    Transforms.setNodes(editor, { type: 'header1', children: [] })
    expect(menu.isDisabled(editor)).toBeTruthy() // 没有 indent 则 disabled

    editor.insertNode({ type: 'pre', children: [{ type: 'code', children: [{ text: 'var' }], language: '' }] })
    expect(menu.isDisabled(editor)).toBeTruthy() // 除了 p header 之外，其他 type 不可用 indent
    // Transforms.removeNodes(editor, { mode: 'highest' }) // 移除 pre/code
  })

  // getValue 在 increase menu 已测试过

  it('exec', () => {
    editor.select(startLocation)
    expect(menu.isActive(editor)).toBeFalsy()
    Transforms.setNodes(editor, { type: 'paragraph', indent: '2em', children: [] })

    expect(menu.isDisabled(editor)).toBeFalsy() // 有 indent 则取消 disabled

    menu.exec(editor, '')
    expect(menu.getValue(editor)).toBe('')
  })

  it('exec should only clear indent from paragraph/header nodes', () => {
    editor = createEditor({
      content: [
        { type: 'paragraph', indent: '2em', children: [{ text: 'hello' }] },
        {
          type: 'blockquote',
          indent: '2em',
          children: [{ text: 'quote' }],
        },
      ] as any,
    })

    editor.select([])
    menu.exec(editor, '')

    expect((editor.children[0] as any).indent).toBeFalsy()
    expect((editor.children[1] as any).type).toBe('blockquote')
    expect((editor.children[1] as any).indent).toBe('2em')
  })
})
