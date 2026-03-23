import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { DEL_ROW_SVG } from '../../src/constants/svg'
import locale from '../../src/locale/zh-CN'
import { TableElement } from '../../src/module/custom-types'
import DeleteRow from '../../src/module/menu/DeleteRow'
import * as utils from '../../src/utils'

vi.mock('../../src/utils', () => ({
  filledMatrix: vi.fn(),
}))
const mockedUtils = utils as vi.Mocked<typeof utils>

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}
describe('Table Module Delete Row Menu', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('it should create DeleteRow object', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    expect(typeof deleteRowMenu).toBe('object')
    expect(deleteRowMenu.tag).toBe('button')
    expect(deleteRowMenu.iconSvg).toBe(DEL_ROW_SVG)
    expect(deleteRowMenu.title).toBe(locale.tableModule.deleteRow)
    expect(deleteRowMenu.getValue(editor)).toBe('')
    expect(deleteRowMenu.isActive(editor)).toBeFalsy()
  })

  test('isDisabled should get truthy value if editor selection is null', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    editor.selection = null
    expect(deleteRowMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor selection is collapsed', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => false)

    expect(deleteRowMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is not table cell', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => null)

    expect(deleteRowMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get falsy value if editor current selected node is table cell', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => ({}) as any)

    expect(deleteRowMenu.isDisabled(editor)).toBeFalsy()
  })

  test('exec should return directly if menu is disabled', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    setEditorSelection(editor, null)

    expect(deleteRowMenu.exec(editor, '')).toBeUndefined()
  })

  test('exec should invoke removeNodes method to remove whole table if menu is not disabled and table row length less than 1', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    vi.spyOn(deleteRowMenu, 'isDisabled').mockImplementation(() => false)
    vi.spyOn(core.DomEditor, 'getParentNode').mockImplementation(() => ({
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [],
        },
      ],
    }))

    const path = [0, 1]
    const fn = function* () {
      yield [
        {
          type: 'table-cell',
          children: [],
        } as slate.Element,
        path,
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockReturnValue(fn())
    const removeNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'removeNodes').mockImplementation(removeNodesFn)

    deleteRowMenu.exec(editor, '')
    expect(removeNodesFn).toBeCalled()
  })

  test('exec should invoke removeNodes method to remove current row if menu is not disabled and table row length greater than 1', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()

    vi.spyOn(deleteRowMenu, 'isDisabled').mockImplementation(() => false)
    vi.spyOn(core.DomEditor, 'getParentNode').mockImplementation(() => ({
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [],
        },
        {
          type: 'table-row',
          children: [],
        },
      ],
    }))

    const path = [0, 0, 0]
    const fn = function* () {
      yield [
        {
          type: 'table-cell',
          children: [],
        } as slate.Element,
        path,
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockImplementation(() => fn())
    mockedUtils.filledMatrix.mockImplementation(() => {
      return [
        [
          [
            [{ type: 'table-cell', children: [{ text: '' }], isHeader: false }, [0, 0, 0]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
          [
            [{ type: 'table-cell', children: [{ text: '' }], isHeader: false }, [0, 0, 1]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
        ],
        [
          [
            [{ type: 'table-cell', children: [{ text: '' }] }, [0, 1, 0]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
          [
            [{ type: 'table-cell', children: [{ text: '' }] }, [0, 1, 1]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
        ],
      ]
    })
    const removeNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'removeNodes').mockImplementation(removeNodesFn)

    deleteRowMenu.exec(editor, '')
    expect(removeNodesFn).toBeCalledWith(editor, { at: path })
  })

  test('exec inserts a carried cell into the next row when deleting the origin row of a rowspan cell', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor({
      content: [
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
                  isHeader: true,
                  backgroundColor: '#eee',
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
          columnWidths: [100, 100],
          scrollWidth: 200,
          height: 60,
        },
      ],
    })

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    }
    mockedUtils.filledMatrix.mockReturnValue([
      [
        [
          [{
            type: 'table-cell',
            rowSpan: 2,
            isHeader: true,
            backgroundColor: '#eee',
            children: [{ text: 'A' }],
          }, [0, 0, 0]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 2,
          },
        ],
        [
          [{ type: 'table-cell', children: [{ text: 'B' }] }, [0, 0, 1]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 1,
          },
        ],
      ],
      [
        [
          [{
            type: 'table-cell',
            rowSpan: 2,
            isHeader: true,
            backgroundColor: '#eee',
            hidden: true,
            children: [{ text: 'A' }],
          }, [0, 0, 0]],
          {
            rtl: 1, ltr: 1, ttb: 2, btt: 1,
          },
        ],
        [
          [{ type: 'table-cell', children: [{ text: 'C' }] }, [0, 1, 0]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 1,
          },
        ],
      ],
    ] as any)

    deleteRowMenu.exec(editor, '')

    const table = editor.children[0] as TableElement
    const [remainingRow] = table.children
    const [insertedCell, originalCell] = remainingRow.children

    expect(table.children).toHaveLength(1)
    expect(insertedCell.children[0].text).toBe('A')
    expect(insertedCell.rowSpan).toBe(1)
    expect(insertedCell.isHeader).toBe(true)
    expect(insertedCell.backgroundColor).toBe('#eee')
    expect(originalCell.children[0].text).toBe('C')
  })

  test('exec falls back to appending a carried cell when inserting at the calculated path fails', () => {
    const deleteRowMenu = new DeleteRow()
    const editor = createEditor()
    const rowPath = [0, 0]
    const targetRowPath = [0, 0]
    const originalCellPath = [0, 0, 0]
    const newCellText = 'Merged A'
    const insertNodesSpy = vi.spyOn(slate.Transforms, 'insertNodes')
      .mockImplementationOnce(() => {
        throw new Error('insert at column failed')
      })
      .mockImplementation(() => {})

    vi.spyOn(deleteRowMenu, 'isDisabled').mockReturnValue(false)
    vi.spyOn(core.DomEditor, 'getParentNode').mockReturnValue({
      type: 'table',
      children: [{ type: 'table-row' }, { type: 'table-row' }],
    } as any)
    vi.spyOn(slate.Editor, 'nodes').mockImplementation(() => (function* () {
      yield [{ type: 'table-row', children: [] } as slate.Element, rowPath] as slate.NodeEntry<slate.Element>
      yield [{ type: 'table-cell', children: [] } as slate.Element, [0, 0, 1]] as slate.NodeEntry<slate.Element>
    }()))
    mockedUtils.filledMatrix.mockReturnValue([
      [
        [
          [{
            type: 'table-cell',
            rowSpan: 2,
            children: [{ text: newCellText }],
          }, originalCellPath],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 2,
          },
        ],
      ],
      [
        [
          [{ type: 'table-cell', hidden: true, children: [{ text: '' }] }, originalCellPath],
          {
            rtl: 1, ltr: 1, ttb: 2, btt: 1,
          },
        ],
      ],
    ] as any)
    vi.spyOn(slate.Editor, 'node').mockReturnValue([
      { type: 'table-row', children: [{ type: 'table-cell' }] },
      targetRowPath,
    ] as any)
    vi.spyOn(slate.Transforms, 'removeNodes').mockImplementation(() => {})

    deleteRowMenu.exec(editor, '')

    expect(insertNodesSpy).toHaveBeenNthCalledWith(
      1,
      editor,
      expect.objectContaining({
        children: [{ text: newCellText }],
        rowSpan: 1,
        hidden: false,
      }),
      { at: [...targetRowPath, 0] },
    )
    expect(insertNodesSpy).toHaveBeenNthCalledWith(
      2,
      editor,
      expect.objectContaining({
        children: [{ text: newCellText }],
        rowSpan: 1,
        hidden: false,
      }),
      { at: [...targetRowPath, 1] },
    )
  })

})
