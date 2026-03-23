import { Editor, Node, Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { TableElement } from '../../src/module/custom-types'
import MergeCell from '../../src/module/menu/MergeCell'
import SplitCell from '../../src/module/menu/SplitCell'
import { TableCursor } from '../../src/module/table-cursor'
import { EDITOR_TO_SELECTION } from '../../src/module/weak-maps'
import { NodeEntryWithContext } from '../../src/utils'
import * as utils from '../../src/utils'

function createTableContent() {
  return [
    {
      type: 'table',
      width: 'auto',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'A' }] },
            { type: 'table-cell', children: [{ text: 'B' }] },
          ],
        },
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'C' }] },
            { type: 'table-cell', children: [{ text: 'D' }] },
          ],
        },
      ],
      columnWidths: [60, 60],
      scrollWidth: 120,
      height: 62,
    },
  ]
}

function createMergedTableContent() {
  return [
    {
      type: 'table',
      width: 'auto',
      children: [
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              isHeader: true,
              rowSpan: 2,
              colSpan: 2,
              children: [{ text: 'Merged' }],
            },
          ],
        },
        {
          type: 'table-row',
          children: [],
        },
      ],
      columnWidths: [60, 60],
      scrollWidth: 120,
      height: 62,
    },
  ]
}

function createContextSelection(editor, rows: number[][][]): NodeEntryWithContext[][] {
  return rows.map(row => row.map(path => [
    [Node.get(editor, path as any) as any, path as any],
    {
      rtl: 0,
      ltr: 1,
      ttb: 1,
      btt: 0,
    },
  ]))
}

describe('table merge and split menus', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('MergeCell merges selected cells into the base cell and clears the batch selection', () => {
    const editor = createEditor({ content: createTableContent() })
    const menu = new MergeCell()
    const unselectSpy = vi.spyOn(TableCursor, 'unselect').mockImplementation(() => {})

    EDITOR_TO_SELECTION.set(
      editor,
      createContextSelection(editor, [
        [
          [0, 0, 0],
          [0, 0, 1],
        ],
        [
          [0, 1, 0],
          [0, 1, 1],
        ],
      ]),
    )

    menu.exec(editor, '')

    const table = editor.children[0] as TableElement
    const baseCell = table.children[0].children[0]

    expect(baseCell.rowSpan).toBe(2)
    expect(baseCell.colSpan).toBe(2)
    expect(baseCell.children.map(child => child.text).join('')).toBe('ABCD')
    expect(table.children[0].children).toHaveLength(1)
    expect(Editor.hasPath(editor, [0, 0, 1])).toBe(false)
    expect(unselectSpy).toHaveBeenCalledWith(editor)
  })

  test('MergeCell is disabled without a valid common table selection and tolerates move failures', () => {
    const editor = createEditor({ content: createTableContent() })
    const menu = new MergeCell()

    expect(menu.isDisabled(editor)).toBe(true)

    EDITOR_TO_SELECTION.set(
      editor,
      createContextSelection(editor, [
        [
          [0, 0, 0],
          [0, 0, 1],
        ],
      ]),
    )
    vi.spyOn(utils, 'hasCommon').mockReturnValue(false)

    expect(menu.isDisabled(editor)).toBe(true)

    vi.restoreAllMocks()
    const moveSpy = vi.spyOn(Transforms, 'moveNodes').mockImplementation(() => {
      throw new Error('move failed')
    })
    const removeSpy = vi.spyOn(Transforms, 'removeNodes').mockImplementation(() => {})
    const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})

    EDITOR_TO_SELECTION.set(
      editor,
      createContextSelection(editor, [
        [
          [0, 0, 0],
          [0, 0, 1],
        ],
      ]),
    )

    expect(() => menu.merge(editor)).not.toThrow()
    expect(moveSpy).toHaveBeenCalled()
    expect(removeSpy).not.toHaveBeenCalled()
    expect(setNodesSpy).toHaveBeenCalledWith(editor, { rowSpan: 1, colSpan: 2 }, { at: [0, 0, 0] })
  })

  test('SplitCell splits a merged header cell back into normal cells', () => {
    const editor = createEditor({ content: createMergedTableContent() })
    const menu = new SplitCell()

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    }

    expect(menu.isDisabled(editor)).toBe(false)

    menu.exec(editor, '')

    const table = editor.children[0] as TableElement
    const firstRow = table.children[0]
    const secondRow = table.children[1]

    expect(firstRow.children).toHaveLength(2)
    expect(secondRow.children).toHaveLength(2)
    expect(firstRow.children[0].rowSpan).toBe(1)
    expect(firstRow.children[0].colSpan).toBe(1)
    expect(firstRow.children[1].isHeader).toBe(true)
    expect(secondRow.children.every(cell => !cell.isHeader)).toBe(true)
  })

  test('SplitCell is disabled for normal cells and no-ops without a table selection', () => {
    const editor = createEditor({ content: createTableContent() })
    const menu = new SplitCell()

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    }

    expect(menu.isDisabled(editor)).toBe(true)
    vi.spyOn(Editor, 'nodes').mockReturnValue((function* () {
      yield* []
    }()) as any)

    expect(() => menu.split(editor, {})).not.toThrow()
  })

  test('SplitCell falls back to row-end insertion and warns when later rows are missing', () => {
    const editor = createEditor({ content: createMergedTableContent() })
    const menu = new SplitCell()
    const nodeSpy = vi.spyOn(Editor, 'node')
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    }

    let insertCall = 0

    vi.spyOn(Transforms, 'insertNodes').mockImplementation((_editor, _node, options: any) => {
      insertCall += 1
      if (insertCall === 1 && JSON.stringify(options.at) === JSON.stringify([0, 0, 1])) {
        throw new Error('insert at original position failed')
      }
    })
    nodeSpy.mockImplementation((_editor, path: any) => {
      if (JSON.stringify(path) === JSON.stringify([0, 1])) {
        throw new Error('row missing')
      }
      return [{ type: 'table-row', children: [{ type: 'table-cell' }] } as any, path]
    })

    menu.exec(editor, '')

    expect(warnSpy).toHaveBeenCalled()
  })

  test('SplitCell appends to the end of a shorter target row when the computed column is out of range', () => {
    const editor = createEditor({ content: createMergedTableContent() })
    const menu = new SplitCell()
    const insertSpy = vi.spyOn(Transforms, 'insertNodes').mockImplementation(() => {})
    const nodeSpy = vi.spyOn(Editor, 'node')

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    }

    nodeSpy.mockImplementation((_editor, path: any) => {
      if (JSON.stringify(path) === JSON.stringify([0, 1])) {
        return [{ type: 'table-row', children: [] } as any, path]
      }

      return [Node.get(editor, path as any) as any, path]
    })

    menu.split(editor, {})

    expect(insertSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({ type: 'table-cell' }),
      { at: [0, 1, 0] },
    )
  })
})
