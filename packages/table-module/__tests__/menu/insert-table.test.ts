import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { isDOMElement } from '../../../core/src/utils/dom'
import { TABLE_SVG } from '../../src/constants/svg'
import locale from '../../src/locale/zh-CN'
import InsertTable from '../../src/module/menu/InsertTable'
import $ from '../../src/utils/dom'

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}
describe('Table Module Insert Table Menu', () => {
  test('it should create InsertTable object', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    expect(typeof insertTableMenu).toBe('object')
    expect(insertTableMenu.tag).toBe('button')
    expect(insertTableMenu.iconSvg).toBe(TABLE_SVG)
    expect(insertTableMenu.title).toBe(locale.tableModule.insertTable)
    expect(insertTableMenu.getValue(editor)).toBe('')
    expect(insertTableMenu.isActive(editor)).toBeFalsy()
  })

  test('isDisabled should get truthy value if editor selection is null', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    editor.selection = null
    expect(insertTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor selection is collapsed', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => false)

    expect(insertTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is contains pre node', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedElems').mockImplementation(() => [
      { type: 'pre', children: [] },
    ])

    expect(insertTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is contains table node', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedElems').mockImplementation(() => [
      { type: 'table', children: [] },
    ])

    expect(insertTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is contains void node', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedElems').mockImplementation(() => [
      { type: 'image', children: [] },
    ])

    vi.spyOn(editor, 'isVoid').mockImplementation(() => true)

    expect(insertTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get falsy value if editor current selected node is valid', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedElems').mockImplementation(() => [
      { type: 'paragraph', children: [] },
    ])

    expect(insertTableMenu.isDisabled(editor)).toBeFalsy()
  })

  test('getPanelContentElem should return table panel dom', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    expect(isDOMElement(insertTableMenu.getPanelContentElem(editor))).toBeTruthy()
    expect(insertTableMenu.getPanelContentElem(editor).className).toBe('w-e-panel-content-table')
  })

  test('it should invoke insertNodes method if click panel td node', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    const tablePanel = insertTableMenu.getPanelContentElem(editor)
    const tdEl = $(tablePanel).find('td')[0]

    const fn = vi.fn()

    vi.spyOn(slate.Transforms, 'insertNodes').mockImplementation(fn)

    tdEl.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    )

    expect(fn).toBeCalled()
  })

  test('it should add active class if mouse enter panel td node', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    const tablePanel = insertTableMenu.getPanelContentElem(editor)
    const tdEl = $(tablePanel).find('td')[0]

    expect(tdEl.className).toBe('')

    tdEl.dispatchEvent(
      new MouseEvent('mouseenter', {
        bubbles: true,
        cancelable: true,
      }),
    )

    expect(tdEl.className).toBe('active')
  })

  test('should create table with row heights when inserting', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    // Mock editor config
    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      minWidth: 80,
      minRowHeight: 40,
    })

    setEditorSelection(editor)

    const insertNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'insertNodes').mockImplementation(insertNodesFn)

    // 模拟点击创建 1x2 表格 (第一行第二列)
    const tablePanel = insertTableMenu.getPanelContentElem(editor)
    const tdEl = $(tablePanel).find('td')[1] // 第一行第二列，创建 1x2 表格

    tdEl.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    )

    // 验证插入的表格包含正确的行高度
    expect(insertNodesFn).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        type: 'table',
        children: expect.arrayContaining([
          expect.objectContaining({
            type: 'table-row',
            height: 40,
            children: expect.any(Array),
          }),
        ]),
        columnWidths: [80, 80],
      }),
      expect.any(Object),
    )
  })

  test('should use default row height when minRowHeight is not configured', () => {
    const insertTableMenu = new InsertTable()
    const editor = createEditor()

    // Mock editor config without minRowHeight
    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      minWidth: 60,
    })

    setEditorSelection(editor)

    const insertNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'insertNodes').mockImplementation(insertNodesFn)

    // 模拟点击创建 1x1 表格
    const tablePanel = insertTableMenu.getPanelContentElem(editor)
    const tdEl = $(tablePanel).find('td')[0]

    tdEl.dispatchEvent(
      new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
      }),
    )

    // 验证使用默认行高度 30px
    expect(insertNodesFn).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        type: 'table',
        children: expect.arrayContaining([
          expect.objectContaining({
            type: 'table-row',
            height: 30,
            children: expect.any(Array),
          }),
        ]),
        columnWidths: [60],
      }),
      expect.any(Object),
    )
  })
})
