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
    FormatPainter.attrs.formatBlockStyle = null
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
    expect(FormatPainter.attrs.formatBlockStyle).toBeNull()
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
    expect(FormatPainter.attrs.formatBlockStyle).toBeNull()

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

  it('copies and applies heading block format', () => {
    editor = createEditor({
      content: [
        { type: 'header2', children: [{ text: 'Heading source' }] },
        { type: 'paragraph', children: [{ text: 'Paragraph target' }] },
      ],
    })

    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 7 },
    })

    menu.exec(editor)
    expect(FormatPainter.attrs.formatBlockStyle).toEqual({ type: 'header2' })

    editor.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 9 },
    })
    menu.setFormatHtml(editor)

    expect((editor.children[1] as any).type).toBe('header2')
  })

  it('copies and applies list block format', () => {
    editor = createEditor({
      content: [
        {
          type: 'list-item',
          ordered: true,
          orderType: 'a',
          children: [{ text: 'List source' }],
        },
        { type: 'paragraph', children: [{ text: 'Paragraph target' }] },
      ],
    })

    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 4 },
    })

    menu.exec(editor)
    expect(FormatPainter.attrs.formatBlockStyle).toEqual({
      type: 'list-item',
      ordered: true,
      orderType: 'a',
    })

    editor.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [1, 0], offset: 9 },
    })
    menu.setFormatHtml(editor)

    expect(editor.children[1]).toMatchObject({
      type: 'list-item',
      ordered: true,
      orderType: 'a',
    })
  })

  it('applies captured block format to multi-block selection', () => {
    editor = createEditor({
      content: [
        { type: 'blockquote', children: [{ text: 'Quote source' }] },
        { type: 'paragraph', children: [{ text: 'Target one' }] },
        { type: 'paragraph', children: [{ text: 'Target two' }] },
      ],
    })

    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })
    menu.exec(editor)

    editor.select({
      anchor: { path: [1, 0], offset: 0 },
      focus: { path: [2, 0], offset: 6 },
    })
    menu.setFormatHtml(editor)

    expect((editor.children[1] as any).type).toBe('blockquote')
    expect((editor.children[2] as any).type).toBe('blockquote')
  })

  it('skips unsupported target blocks when applying block format', () => {
    editor = createEditor({
      content: [
        { type: 'header3', children: [{ text: 'Heading source' }] },
        {
          type: 'table',
          width: 'auto',
          children: [
            {
              type: 'table-row',
              children: [{ type: 'table-cell', children: [{ text: 'cell' }], isHeader: true }],
            },
          ],
        },
      ],
    })

    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 7 },
    })
    menu.exec(editor)

    editor.select({
      anchor: { path: [1, 0, 0, 0], offset: 0 },
      focus: { path: [1, 0, 0, 0], offset: 4 },
    })
    menu.setFormatHtml(editor)

    expect((editor.children[1] as any).type).toBe('table')
  })
})
