import createEditor from '../../../../tests/utils/create-editor'
import { TableElement } from '../../src/module/custom-types'
import DeleteCol from '../../src/module/menu/DeleteCol'
import DeleteRow from '../../src/module/menu/DeleteRow'

function createRowSpanTable() {
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
              rowSpan: 2,
              children: [{ text: 'A' }],
            },
            {
              type: 'table-cell',
              children: [{ text: 'B' }],
            },
          ],
        },
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: 'C' }],
            },
          ],
        },
      ],
      columnWidths: [60, 60],
      scrollWidth: 120,
      height: 62,
    },
  ]
}

function createColSpanTable() {
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
              colSpan: 2,
              children: [{ text: 'A' }],
            },
          ],
        },
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [{ text: 'B' }],
            },
            {
              type: 'table-cell',
              children: [{ text: 'C' }],
            },
          ],
        },
      ],
      columnWidths: [60, 60],
      scrollWidth: 120,
      height: 62,
    },
  ]
}

describe('table delete menus with merged cells', () => {
  test('DeleteRow reduces rowspan when removing a row covered by a merged cell', () => {
    const editor = createEditor({ content: createRowSpanTable() })
    const menu = new DeleteRow()

    editor.selection = {
      anchor: { path: [0, 1, 0, 0], offset: 0 },
      focus: { path: [0, 1, 0, 0], offset: 0 },
    }

    menu.exec(editor, '')

    const table = editor.children[0] as TableElement

    expect(table.children).toHaveLength(1)
    expect(table.children[0].children[0].rowSpan).toBe(1)
  })

  test('DeleteCol reduces colspan and updates column widths when removing a covered column', () => {
    const editor = createEditor({ content: createColSpanTable() })
    const menu = new DeleteCol()

    editor.selection = {
      anchor: { path: [0, 1, 1, 0], offset: 0 },
      focus: { path: [0, 1, 1, 0], offset: 0 },
    }

    menu.exec(editor, '')

    const table = editor.children[0] as TableElement

    expect(table.columnWidths).toEqual([60])
    expect(table.children[0].children[0].colSpan).toBe(1)
    expect(table.children[1].children).toHaveLength(1)
  })
})
