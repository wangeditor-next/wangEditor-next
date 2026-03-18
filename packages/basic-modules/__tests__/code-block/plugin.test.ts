/**
 * @description code-block plugin test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import withCodeBlock from '../../src/modules/code-block/plugin'

// 模拟 DataTransfer
class MyDataTransfer {
  private values: object = {}

  setData(type: string, value: string) {
    this.values[type] = value
  }

  getData(type: string): string {
    return this.values[type]
  }
}

describe('code-block plugin', () => {
  let editor: any
  let startLocation: any

  const codeElem = {
    type: 'code',
    children: [{ text: ' var' }],
    language: '',
  }
  const preElem = {
    type: 'pre',
    children: [codeElem],
  }

  beforeEach(() => {
    editor = withCodeBlock(createEditor())
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('insert break', () => {
    // 无 codeNode 换行
    editor.deselect()
    editor.insertBreak()

    editor.select(startLocation)
    editor.insertNode(preElem) // 插入 code-block

    // code-block 前后会自动生成两个 p
    const pList1 = editor.getElemsByTypePrefix('paragraph')

    expect(pList1.length).toBe(2)

    editor.select({
      path: [1, 0, 0], // 选中 code-block
      offset: 3,
    })

    // 换行都在 code-block 内部
    editor.insertBreak()
    editor.insertBreak()
    expect(editor.getText()).toBe('\n va\n \n r\n')

    // 不会再生成新的 p
    const pList2 = editor.getElemsByTypePrefix('paragraph')

    expect(pList2.length).toBe(2)
  })

  it('insert break - norm insertText', () => {
    // 无 codeNode 换行
    editor.deselect()
    editor.insertBreak()
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const codeElem = {
      type: 'code',
      children: [{ text: 'var' }],
      language: '',
    }
    // eslint-disable-next-line @typescript-eslint/no-shadow
    const preElem = {
      type: 'pre',
      children: [codeElem],
    }

    editor.select(startLocation)
    editor.insertNode(preElem) // 插入 code-block

    // code-block 前后会自动生成两个 p
    const pList1 = editor.getElemsByTypePrefix('paragraph')

    expect(pList1.length).toBe(2)

    editor.select({
      path: [1, 0, 0], // 选中 code-block
      offset: 3,
    })

    // 换行都在 code-block 内部
    editor.insertBreak()
    expect(editor.getText()).toBe('\nvar\n\n')
  })

  it('insert data', () => {
    const data = new MyDataTransfer()

    data.setData('text/plain', ' hello')

    // 无 codeNode 换行
    editor.deselect()
    editor.insertData(data)

    editor.select(startLocation)
    editor.insertNode(preElem) // 插入 code node
    editor.select({
      path: [1, 0, 0], // 选中 code node
      offset: 3,
    })

    editor.insertData(data)
    expect(editor.getText()).toBe('\n va hellor\n')
  })

  it('normalizeNode - code node 不能是顶级元素，否则替换为 p', () => {
    editor.select(startLocation)
    editor.insertNode(codeElem)

    const pList = editor.getElemsByTypePrefix('paragraph')

    expect(pList.length).toBe(2)
  })

  it('normalizeNode - pre node 不能是第一个节点，否则前面插入 p', () => {
    editor.select(startLocation)
    editor.insertNode({ type: 'pre', children: [{ type: 'code', children: [{ text: 'var' }], language: '' }] })

    const pList = editor.getElemsByTypePrefix('paragraph')

    expect(pList.length).toBe(2)

    const preList = editor.getElemsByTypePrefix('pre')

    expect(preList.length).toBe(1)
  })

  it('normalizeNode - pre 下面必须是 code', () => {
    editor.select(startLocation)
    editor.insertNode({ type: 'pre', children: [{ type: 'text', children: [{ text: 'var' }] }] })

    const pList = editor.getElemsByTypePrefix('paragraph')

    expect(pList.length).toBe(2)

    const preList = editor.getElemsByTypePrefix('pre')

    expect(preList.length).toBe(0)
  })

  it('deleteFragment resets a full-document code block selection to an empty paragraph', () => {
    editor = withCodeBlock(createEditor({
      content: [{ type: 'pre', children: [{ type: 'code', children: [{ text: 'const a = 1' }], language: '' }] }],
    }))

    editor.select([])
    editor.deleteFragment()

    expect(editor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    })
  })
})
