import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import { TableElement, TableRowElement } from '../src/module/custom-types'
import {
  handleRowBorderHighlight,
  handleRowBorderMouseDown,
  handleRowBorderVisible,
} from '../src/module/row-resize'

// Mock DOM methods
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
})

// Mock HTMLElement methods
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
          height: 200,
        }),
      }
    }
    if (selector === '.row-resizer-item') {
      return this
    }
    return null
  },
})

// Mock isHTMLElememt function
vi.mock('@wangeditor-next/core', async () => {
  const actual = await vi.importActual('@wangeditor-next/core')

  return {
    ...actual,
    isHTMLElememt: vi.fn(() => true),
  }
})

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}

function createTableWithRows(rowHeights: number[]): TableElement {
  const rows: TableRowElement[] = rowHeights.map(height => ({
    type: 'table-row',
    height,
    children: [
      {
        type: 'table-cell',
        children: [{ text: 'Cell content' }],
      },
    ],
  }))

  return {
    type: 'table',
    width: 'auto',
    children: rows,
    columnWidths: [100, 150, 200],
  }
}

describe('Row Resize Module', () => {
  let editor: core.IDomEditor

  beforeEach(() => {
    editor = createEditor()
  })

  afterEach(() => {
    document.body.style.cursor = ''
    window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
    vi.restoreAllMocks()
  })

  describe('handleRowBorderVisible', () => {
    test('should not process if editor is disabled', () => {
      const table = createTableWithRows([30, 40, 50])
      const mockEvent = {
        clientY: 35,
        target: document.createElement('div'),
      } as MouseEvent

      vi.spyOn(editor, 'isDisabled').mockReturnValue(true)
      const transformsSpy = vi.spyOn(slate.Transforms, 'setNodes')

      handleRowBorderVisible(editor, table, mockEvent)

      expect(transformsSpy).not.toHaveBeenCalled()
    })

    test('should set hover state when mouse is on row border', () => {
      const table = createTableWithRows([30, 40, 50])

      // Create a mock target with closest method
      const mockTarget = {
        closest: vi.fn((selector: string) => {
          if (selector === '.table') {
            return {
              getBoundingClientRect: () => ({
                x: 0,
                y: 0,
                top: 0,
                left: 0,
                width: 300,
                height: 120, // 30 + 40 + 50
              }),
            }
          }
          return null
        }),
      }

      const mockEvent = {
        clientY: 30, // 在第一行边界位置 (30px)
        target: mockTarget,
      } as MouseEvent

      vi.spyOn(editor, 'isDisabled').mockReturnValue(false)
      const transformsSpy = vi.spyOn(slate.Transforms, 'setNodes')

      handleRowBorderVisible(editor, table, mockEvent)

      expect(transformsSpy).toHaveBeenCalledWith(
        editor,
        { isHoverRowBorder: true, resizingRowIndex: 0 },
        { mode: 'highest' },
      )
    })

    test('should reset hover state when mouse moves away', () => {
      const table: TableElement = {
        ...createTableWithRows([30, 40, 50]),
        isHoverRowBorder: true,
        resizingRowIndex: 0,
      }
      const mockEvent = {
        clientY: 200, // 远离边界
        target: document.createElement('div'),
      } as MouseEvent

      vi.spyOn(editor, 'isDisabled').mockReturnValue(false)
      const transformsSpy = vi.spyOn(slate.Transforms, 'setNodes')

      handleRowBorderVisible(editor, table, mockEvent)

      expect(transformsSpy).toHaveBeenCalledWith(
        editor,
        { isHoverRowBorder: false, resizingRowIndex: -1 },
        { mode: 'highest' },
      )
    })
  })

  describe('handleRowBorderHighlight', () => {
    test('should set resizing state on mouseenter', () => {
      const mockEvent = { type: 'mouseenter' } as MouseEvent
      const transformsSpy = vi.spyOn(slate.Transforms, 'setNodes')

      handleRowBorderHighlight(editor, mockEvent)

      expect(transformsSpy).toHaveBeenCalledWith(
        editor,
        { isResizingRow: true },
        { mode: 'highest' },
      )
    })

    test('should clear resizing state on mouseleave', () => {
      const mockEvent = { type: 'mouseleave' } as MouseEvent
      const transformsSpy = vi.spyOn(slate.Transforms, 'setNodes')

      handleRowBorderHighlight(editor, mockEvent)

      expect(transformsSpy).toHaveBeenCalledWith(
        editor,
        { isResizingRow: false },
        { mode: 'highest' },
      )
    })
  })

  describe('handleRowBorderMouseDown', () => {
    test('should set editor reference for row resizing', () => {
      const table = createTableWithRows([30, 40, 50])

      // 这个函数主要是设置内部状态，我们通过后续的拖动行为来验证
      expect(() => {
        handleRowBorderMouseDown(editor, table)
      }).not.toThrow()
    })

    test('should update the selected row height during drag and reset cursor on mouseup', async () => {
      const table = {
        ...createTableWithRows([30, 40, 50]),
        resizingRowIndex: 1,
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

      vi.spyOn(editor, 'getMenuConfig').mockReturnValue({ minRowHeight: 35 } as any)
      vi.spyOn(slate.Editor, 'nodes').mockReturnValue((function* () {
        yield [table, [0]] as slate.NodeEntry<slate.Node>
      }()))
      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(table as any)
      vi.spyOn(core.DomEditor, 'toDOMNode').mockReturnValue(tableDom)
      vi.spyOn(core.DomEditor, 'findPath').mockReturnValue([0])
      const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes').mockImplementation(() => {})

      handleRowBorderMouseDown(editor, table)

      const resizeHandle = document.createElement('div')

      resizeHandle.className = 'row-resizer-item'
      document.body.appendChild(resizeHandle)
      resizeHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 40 }))
      window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 95 }))
      await new Promise(resolve => {
        setTimeout(resolve, 120)
      })

      expect(document.body.style.cursor).toBe('row-resize')
      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { height: 65 } as TableRowElement,
        { at: [0, 1] },
      )

      window.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))

      expect(document.body.style.cursor).toBe('')
    })

    test('should fall back to simple row height calculation when table DOM is missing', async () => {
      const table = {
        ...createTableWithRows([30, 40, 50]),
        resizingRowIndex: 0,
      }
      const tableDom = document.createElement('div')

      vi.spyOn(editor, 'getMenuConfig').mockReturnValue({ minRowHeight: 45 } as any)
      vi.spyOn(slate.Editor, 'nodes').mockReturnValue((function* () {
        yield [table, [0]] as slate.NodeEntry<slate.Node>
      }()))
      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(table as any)
      vi.spyOn(core.DomEditor, 'toDOMNode').mockReturnValue(tableDom)
      vi.spyOn(core.DomEditor, 'findPath').mockReturnValue([0])
      const setNodesSpy = vi.spyOn(slate.Transforms, 'setNodes').mockImplementation(() => {})

      handleRowBorderMouseDown(editor, table)

      const resizeHandle = document.createElement('div')

      resizeHandle.className = 'row-resizer-item'
      document.body.appendChild(resizeHandle)
      resizeHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 50 }))
      window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 10 }))
      await new Promise(resolve => {
        setTimeout(resolve, 120)
      })

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { height: 45 } as TableRowElement,
        { at: [0, 0] },
      )
    })

    test('should ignore missing row paths during drag updates', async () => {
      const table = {
        ...createTableWithRows([30, 40, 50]),
        resizingRowIndex: 2,
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

      vi.spyOn(editor, 'getMenuConfig').mockReturnValue({ minRowHeight: 30 } as any)
      vi.spyOn(slate.Editor, 'nodes').mockReturnValue((function* () {
        yield [table, [0]] as slate.NodeEntry<slate.Node>
      }()))
      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(table as any)
      vi.spyOn(core.DomEditor, 'toDOMNode').mockReturnValue(tableDom)
      vi.spyOn(core.DomEditor, 'findPath').mockReturnValue([0])
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.spyOn(slate.Transforms, 'setNodes').mockImplementation(() => {
        throw new Error('missing row path')
      })

      handleRowBorderMouseDown(editor, table)

      const resizeHandle = document.createElement('div')

      resizeHandle.className = 'row-resizer-item'
      document.body.appendChild(resizeHandle)
      resizeHandle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientY: 60 }))
      window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientY: 100 }))
      await new Promise(resolve => {
        setTimeout(resolve, 120)
      })

      expect(warnSpy).toHaveBeenCalled()
    })
  })

  describe('Row resize integration', () => {
    test('should handle complete row resize workflow', () => {
      const table = createTableWithRows([30, 40, 50])

      setEditorSelection(editor, {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      })

      // 模拟鼠标悬停
      const mockTarget = {
        closest: vi.fn((selector: string) => {
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
          return null
        }),
      }

      const hoverEvent = {
        clientY: 30, // 在第一行边界位置
        target: mockTarget,
      } as MouseEvent

      vi.spyOn(editor, 'isDisabled').mockReturnValue(false)
      const transformsSpy = vi.spyOn(slate.Transforms, 'setNodes')

      handleRowBorderVisible(editor, table, hoverEvent)

      // 验证悬停状态被设置
      expect(transformsSpy).toHaveBeenCalledWith(
        editor,
        { isHoverRowBorder: true, resizingRowIndex: 0 },
        { mode: 'highest' },
      )

      // 模拟鼠标按下
      handleRowBorderMouseDown(editor, table)

      // 模拟鼠标进入高亮状态
      const enterEvent = { type: 'mouseenter' } as MouseEvent

      handleRowBorderHighlight(editor, enterEvent)

      expect(transformsSpy).toHaveBeenCalledWith(
        editor,
        { isResizingRow: true },
        { mode: 'highest' },
      )
    })
  })
})
