import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import {
  getColumnWidthRatios,
  handleCellBorderHighlight,
  handleCellBorderMouseDown,
  handleCellBorderVisible,
} from '../src/module/column-resize'
import { TableElement } from '../src/module/custom-types'

Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

Object.defineProperty(HTMLElement.prototype, 'closest', {
  value(selector: string) {
    if (selector === '.table') {
      return {
        getBoundingClientRect: () => ({
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          width: 300,
          height: 120,
        }),
      }
    }
    if (selector === '.column-resizer-item') {
      return this
    }
    return null
  },
})

vi.mock('@wangeditor-next/core', async () => {
  const actual = await vi.importActual('@wangeditor-next/core')

  return {
    ...actual,
    isHTMLElememt: vi.fn(() => true),
  }
})

function createTable(columnWidths: number[]): TableElement {
  return {
    type: 'table',
    width: 'auto',
    children: [
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [{ text: 'A' }] },
          { type: 'table-cell', children: [{ text: 'B' }] },
          { type: 'table-cell', children: [{ text: 'C' }] },
        ],
      },
    ],
    columnWidths,
    scrollWidth: columnWidths.reduce((a, b) => a + b, 0),
    height: 40,
  }
}

describe('column resize module', () => {
  let editor: core.IDomEditor

  beforeEach(() => {
    editor = createEditor()
  })

  afterEach(() => {
    document.body.style.cursor = ''
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    vi.restoreAllMocks()
  })

  test('getColumnWidthRatios returns normalized ratios', () => {
    expect(getColumnWidthRatios([100, 200, 100])).toEqual([0.25, 0.5, 0.25])
  })

  test('handleCellBorderVisible does nothing when editor is disabled', () => {
    const table = createTable([80, 120, 100])
    const event = {
      clientX: 80,
      target: document.createElement('div'),
    } as MouseEvent

    vi.spyOn(editor, 'isDisabled').mockReturnValue(true)
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes')

    handleCellBorderVisible(editor, table, event, 300)

    expect(setNodesSpy).not.toHaveBeenCalled()
  })

  test('handleCellBorderVisible highlights the border under the mouse', () => {
    const table = createTable([80, 120, 100])
    const event = {
      clientX: 80,
      target: document.createElement('div'),
    } as MouseEvent

    vi.spyOn(editor, 'isDisabled').mockReturnValue(false)
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes')

    handleCellBorderVisible(editor, table, event, 300)

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { isHoverCellBorder: true, resizingIndex: 0 },
      { mode: 'highest' },
    )
  })

  test('handleCellBorderVisible resets hover state when the mouse leaves borders', () => {
    const table = {
      ...createTable([80, 120, 100]),
      isHoverCellBorder: true,
      resizingIndex: 1,
    }
    const event = {
      clientX: 260,
      target: document.createElement('div'),
    } as MouseEvent

    vi.spyOn(editor, 'isDisabled').mockReturnValue(false)
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes')

    handleCellBorderVisible(editor, table, event, 300)

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { isHoverCellBorder: false, resizingIndex: -1 },
      { mode: 'highest' },
    )
  })

  test('handleCellBorderHighlight toggles resizing state', () => {
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes')

    handleCellBorderHighlight(editor, { type: 'mouseenter' } as MouseEvent)
    handleCellBorderHighlight(editor, { type: 'mouseleave' } as MouseEvent)

    expect(setNodesSpy).toHaveBeenNthCalledWith(
      1,
      editor,
      { isResizing: true },
      { mode: 'highest' },
    )
    expect(setNodesSpy).toHaveBeenNthCalledWith(
      2,
      editor,
      { isResizing: false },
      { mode: 'highest' },
    )
  })

  test('handleCellBorderMouseDown stores resize state without throwing', () => {
    const table = createTable([80, 120, 100])

    expect(() => {
      handleCellBorderMouseDown(editor, table)
    }).not.toThrow()
  })

  test('handleCellBorderVisible skips hover updates during selection operations', () => {
    const table = createTable([80, 120, 100])
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes')
    const cell = document.createElement('div')

    cell.setAttribute('data-block-type', 'table-cell')
    document.body.appendChild(cell)

    cell.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 40 }))
    handleCellBorderVisible(editor, table, {
      clientX: 80,
      target: document.createElement('div'),
    } as MouseEvent, 300)

    expect(setNodesSpy).not.toHaveBeenCalled()
  })

  test('dragging a resize handle updates column widths and clears cursor on mouseup', async () => {
    const table = {
      ...createTable([80, 120, 100]),
      resizingIndex: 1,
    }
    const tableDom = document.createElement('div')
    const innerTable = document.createElement('div')

    innerTable.className = 'table'
    vi.spyOn(innerTable, 'getBoundingClientRect').mockReturnValue({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      width: 300,
      height: 120,
      bottom: 120,
      right: 300,
      toJSON: () => ({}),
    } as DOMRect)
    tableDom.appendChild(innerTable)

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({ minWidth: 90 } as any)
    vi.spyOn(slate.Editor, 'nodes').mockReturnValue((function* () {
      yield [table, [0]] as slate.NodeEntry<slate.Node>
    }()))
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(table as any)
    vi.spyOn(core.DomEditor, 'toDOMNode').mockReturnValue(tableDom)
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes').mockImplementation(() => {})

    handleCellBorderMouseDown(editor, table)

    const resizeHandle = document.createElement('div')

    resizeHandle.className = 'column-resizer-item'
    document.body.appendChild(resizeHandle)
    resizeHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 200 }))
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 260 }))
    await new Promise(resolve => {
      setTimeout(resolve, 120)
    })

    expect(document.body.style.cursor).toBe('col-resize')
    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { columnWidths: [80, 180, 100] } as TableElement,
      { mode: 'highest' },
    )

    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

    expect(document.body.style.cursor).toBe('')
  })

  test('dragging falls back to simple width changes when table DOM is missing', async () => {
    const table = {
      ...createTable([80, 120, 100]),
      resizingIndex: 0,
    }

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({ minWidth: 95 } as any)
    vi.spyOn(slate.Editor, 'nodes').mockReturnValue((function* () {
      yield [table, [0]] as slate.NodeEntry<slate.Node>
    }()))
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(table as any)
    vi.spyOn(core.DomEditor, 'toDOMNode').mockReturnValue(document.createElement('div'))
    const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes').mockImplementation(() => {})

    handleCellBorderMouseDown(editor, table)

    const resizeHandle = document.createElement('div')

    resizeHandle.className = 'column-resizer-item'
    document.body.appendChild(resizeHandle)
    resizeHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 100 }))
    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 20 }))
    await new Promise(resolve => {
      setTimeout(resolve, 120)
    })

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { columnWidths: [95, 120, 100] } as TableElement,
      { mode: 'highest' },
    )
  })
})
