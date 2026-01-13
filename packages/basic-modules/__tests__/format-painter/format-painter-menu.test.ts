/**
 * @description format painter menu test
 * @author CodePencil
 */

import { Editor } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import FormatPainter from '../../src/modules/format-painter/menu/FormatPainter'

describe('format painter menu', () => {
  let editor: any
  let menu: any

  beforeEach(() => {
    editor = createEditor()
    menu = new FormatPainter()
  })

  afterEach(() => {
    editor = null
    menu = null
    FormatPainter.attrs.isSelect = false
    FormatPainter.attrs.formatStyle = null
  })

  it('is disabled', () => {
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('set format html', () => {
    editor.focus()
    editor.insertText('Hello World')

    // 选中文本
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })

    editor.addMark('bold', true)
    editor.addMark('italic', true)

    // 选中有样式的文本后启用格式刷
    menu.exec(editor)
    expect(FormatPainter.attrs.isSelect).toBeTruthy()

    // 启用了格式刷但是未选中文本
    editor.deselect()
    menu.setFormatHtml(editor)
    expect(FormatPainter.attrs.isSelect).toBeTruthy()
    expect(FormatPainter.attrs.formatStyle).toEqual({ bold: true, italic: true })

    // 启用了格式刷并选中文本
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })
    menu.setFormatHtml(editor)
    expect(Editor.marks(editor)).toEqual({ bold: true, italic: true })
    expect(FormatPainter.attrs.isSelect).toBeFalsy()
    expect(FormatPainter.attrs.formatStyle).toBeNull()
  })

  it('exec', () => {
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBe(FormatPainter.attrs.isSelect)

    editor.focus()

    editor.insertText('Hello World')

    // 取消选中文本
    editor.deselect()
    menu.exec(editor)
    expect(FormatPainter.attrs.isSelect).toBeFalsy()
    expect(FormatPainter.attrs.formatStyle).toBeNull()

    // 选中文本
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })

    menu.exec(editor) // 启用格式刷
    expect(FormatPainter.attrs.isSelect).toBeTruthy()

    menu.exec(editor) // 取消格式刷
    expect(FormatPainter.attrs.isSelect).toBeFalsy()

    // 选中文本
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })

    // 选中有样式的文本后启用格式刷
    editor.addMark('bold', true)
    editor.addMark('italic', true)

    menu.exec(editor)
    expect(FormatPainter.attrs.formatStyle).toEqual({ bold: true, italic: true })
  })
})
