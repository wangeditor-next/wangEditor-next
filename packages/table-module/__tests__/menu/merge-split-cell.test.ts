import { Editor, Node } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { TableElement } from '../../src/module/custom-types'
import MergeCell from '../../src/module/menu/MergeCell'
import SplitCell from '../../src/module/menu/SplitCell'
import { TableCursor } from '../../src/module/table-cursor'
import { EDITOR_TO_SELECTION } from '../../src/module/weak-maps'
import { NodeEntryWithContext } from '../../src/utils'

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
})
