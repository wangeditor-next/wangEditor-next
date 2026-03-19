/**
 * @description code-block menu test
 * @author wangfupeng
 */

import { Editor, Element, Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { content } from '../../../code-highlight/__tests__/content'
import CodeBlockMenu from '../../src/modules/code-block/menu/CodeBlockMenu'

describe('code-block menu', () => {
  const menu = new CodeBlockMenu()
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

  it('getValue and isActive', async () => {
    const editor1 = createEditor({
      content,
    })

    editor.select(startLocation)
    editor1.select({
      path: [1, 0, 0], // 选中 code node
      offset: 0,
    })
    expect(menu.isActive(editor1)).toBeTruthy()
    expect(menu.getValue(editor1)).toBe('javascript')
    expect(menu.isActive(editor)).toBeFalsy()
    expect(menu.getValue(editor)).toBe('')
  })

  it('uses selected code language as the default menu value and inserted language', () => {
    const editor1 = createEditor({
      config: {
        MENU_CONF: {
          codeSelectLang: {
            codeLangs: [
              { text: 'Plain text', value: '' },
              { text: 'Javascript', value: 'javascript', selected: true },
              { text: 'Typescript', value: 'typescript' },
            ],
          },
        },
      },
    })

    editor1.select(Editor.start(editor1, []))

    expect(menu.isActive(editor1)).toBeFalsy()
    expect(menu.getValue(editor1)).toBe('javascript')

    menu.exec(editor1, menu.getValue(editor1))

    const codeList = editor1.getElemsByTypePrefix('code') as any[]

    expect(codeList.length).toBe(1)
    expect(codeList[0].language).toBe('javascript')
  })

  it('is disabled', () => {
    editor.select(startLocation)
    expect(menu.isDisabled(editor)).toBeFalsy()

    Transforms.setNodes(editor, { type: 'header1' } as Partial<Element>)
    expect(menu.isDisabled(editor)).toBeTruthy() // 非 p pre ，则禁用

    editor.insertNode({ type: 'pre', children: [{ type: 'code', children: [{ text: 'var' }], language: 'javascript' }] })
    expect(menu.isDisabled(editor)).toBeFalsy()
    // Transforms.removeNodes(editor, { mode: 'highest' }) // 移除 pre/code
  })

  it('exec - to code-block', () => {
    editor.select(startLocation)

    menu.exec(editor, 'javascript') // 生成 code-block
    const preList = editor.getElemsByTypePrefix('pre')

    expect(preList.length).toBe(1)
    const codeLis = editor.getElemsByTypePrefix('code')

    expect(codeLis.length).toBe(1)
  })

  it('exec - to paragraph', () => {
    const editor1 = createEditor({
      content,
    })

    editor1.select({
      path: [1, 0, 0], // 选中 code node
      offset: 3,
    })

    menu.exec(editor1, '') // 取消 code-block
    const preList = editor1.getElemsByTypePrefix('pre')

    expect(preList.length).toBe(0)
    const codeLis = editor1.getElemsByTypePrefix('code')

    expect(codeLis.length).toBe(0)
  })
})
