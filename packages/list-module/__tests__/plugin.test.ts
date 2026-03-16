/**
 * @description list plugin test
 * @author wangfupeng
 */

import createEditor from '../../../tests/utils/create-editor'
import withList from '../src/module/plugin'

describe('list plugin test', () => {
  it('insert tab - increase level', () => {
    const listItem = { type: 'list-item', children: [{ text: 'hello' }] }
    const textItem = { type: 'paragraph', children: [{ text: '' }] }
    let editor = createEditor({
      content: [listItem, listItem],
    })
    let textEditor = createEditor({
      content: [textItem],
    })

    editor = withList(editor) // 使用插件
    textEditor = withList(textEditor) // 使用插件

    // 测试没有选区
    textEditor.handleTab() // tab

    // 测试选区没有 list-item
    textEditor.select({ path: [0, 0], offset: 0 })
    textEditor.handleTab() // tab
    const textChildren = textEditor.children

    expect(textChildren).toEqual([{ type: 'paragraph', children: [{ text: '    ' }] }])

    editor.select({ path: [1, 0], offset: 0 }) // 选中 list-item 开头

    editor.handleTab() // tab

    const children = editor.children

    expect(children[1]).toEqual({
      ...listItem,
      level: 1, // 增加 level
    })
  })

  it('insert tab - select all and one list', () => {
    // 全选单个 list-item
    const listItem = { type: 'list-item', children: [{ text: 'hello' }] }
    let editor = createEditor({
      content: [listItem],
    })

    editor = withList(editor) // 使用插件
    editor.select([]) // 全选
    editor.handleTab() // tab
    const children = editor.children

    expect(children).toEqual([{ children: [{ text: '    ' }], type: 'list-item' }])
  })
  it('insert tab - select all and other item', () => {
    // 全选 包含其它元素
    const textItem = { type: 'paragraph', children: [{ text: '' }] }
    const listItem = { type: 'list-item', children: [{ text: 'hello' }] }
    let editor = createEditor({
      content: [textItem, listItem],
    })

    editor = withList(editor) // 使用插件
    editor.select([]) // 全选
    editor.handleTab() // tab
    const children = editor.children

    expect(children).toEqual([{ children: [{ text: '    ' }], type: 'paragraph' }])
  })

  it('insert tab - select all and multi list', () => {
    const listItem = { type: 'list-item', children: [{ text: 'hello' }] }
    const listItem1 = { type: 'list-item', children: [{ text: 'world' }] }
    let editor = createEditor({
      content: [listItem, listItem1],
    })

    editor = withList(editor) // 使用插件
    editor.select([]) // 全选
    editor.handleTab() // tab
    const children = editor.children

    expect(children).toEqual([
      { children: [{ text: 'hello' }], level: 1, type: 'list-item' },
      { children: [{ text: 'world' }], level: 1, type: 'list-item' },
    ])
  })

  it('insert delete - decrease level', () => {
    // 测试没有选区
    let emptyEditor = createEditor()

    emptyEditor = withList(emptyEditor) // 使用插件
    emptyEditor.deleteBackward('character')
    expect(emptyEditor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])

    // 没有 list
    emptyEditor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头
    emptyEditor.deleteBackward('character')
    expect(emptyEditor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])

    // 单个 list
    const listItem = { type: 'list-item', children: [{ text: 'hello' }], level: 1 }
    let editor = createEditor({
      content: [listItem],
    })

    editor = withList(editor) // 使用插件
    editor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头
    editor.deleteBackward('character') // delete
    expect(editor.children).toEqual([
      {
        ...listItem,
        level: 0, // 减少 level
      },
    ])

    // 选区为 expanded
    editor.select([]) // 全选
    editor.deleteBackward('character') // delete
    expect(editor.children).toEqual([
      {
        ...listItem,
        level: 0,
      },
    ])

    // 删除list变为空行
    editor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头
    editor.deleteBackward('character')
    expect(emptyEditor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])
  })

  it('insert enter - empty', () => {
    // 没有 list
    const emptyEditor = createEditor()

    emptyEditor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头
    emptyEditor.insertBreak()
    expect(emptyEditor.children).toEqual([
      { type: 'paragraph', children: [{ text: '' }] },
      { type: 'paragraph', children: [{ text: '' }] },
    ])
  })

  it('insert delete - decrease level multi list', () => {
    // 测试没有同级 list
    const textItem = { type: 'paragraph', children: [{ text: '' }] }
    const listItem = { type: 'list-item', children: [{ text: 'hello' }], level: 1 }
    const listItem1 = { type: 'list-item', children: [{ text: 'hello' }], level: 1 }
    let editor = createEditor({
      content: [textItem, listItem, listItem1],
    })

    editor = withList(editor) // 使用插件
    editor.select({ path: [2, 0], offset: 0 }) // 选中 list-item 开头
    editor.deleteBackward('character') // delete
    expect(editor.children[2]).toEqual({
      ...listItem,
      level: 0, // 减少 level
    })

    // 测试有同级 list
    const listOrderedItem = { type: 'list-item', ordered: true, children: [{ text: '' }] }
    const listUnOrderedItem = {
      type: 'list-item',
      children: [{ text: 'hello' }],
      ordered: false,
      level: 1,
    }

    editor = createEditor({
      content: [listOrderedItem, listUnOrderedItem],
    })
    editor = withList(editor) // 使用插件
    editor.select({ path: [1, 0], offset: 0 }) // 选中 list-item 开头
    editor.deleteBackward('character') // delete
    expect(editor.children[1]).toEqual({
      ...listUnOrderedItem,
      ordered: true, // 更改 ordered
      level: 0, // 减少 level
    })
  })

  it('insert enter - delete empty list', () => {
    const listItem = { type: 'list-item', children: [{ text: '' }] }
    let editor = createEditor({
      content: [listItem],
    })

    editor = withList(editor) // 使用插件
    editor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头

    editor.insertBreak()
    expect(editor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])
  })

  it('insert enter - wraps around', () => {
    const listItem = { type: 'list-item', children: [{ text: 'hello' }] }
    let editor = createEditor({
      content: [listItem],
    })

    editor = withList(editor) // 使用插件
    editor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头

    editor.insertBreak()
    expect(editor.children).toEqual([
      { type: 'list-item', children: [{ text: '' }] },
      { type: 'list-item', children: [{ text: 'hello' }] },
    ])
  })

  it('insert enter - delete empty list', () => {
    const listItem = { type: 'list-item', children: [{ text: '' }] }
    let editor = createEditor({
      content: [listItem],
    })

    editor = withList(editor) // 使用插件
    editor.select({ path: [0, 0], offset: 0 }) // 选中 list-item 开头

    editor.insertBreak()
    expect(editor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])
  })
})
