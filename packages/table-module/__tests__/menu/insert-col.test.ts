import * as core from '@wangeditor-next/core'
import * as slate from 'slate'
import { afterEach } from 'vitest'

import createEditor from '../../../../tests/utils/create-editor'
import { ADD_COL_SVG } from '../../src/constants/svg'
import locale from '../../src/locale/zh-CN'
import InsertCol from '../../src/module/menu/InsertCol'
import * as utils from '../../src/utils'

vi.mock('../../src/utils', () => ({
  filledMatrix: vi.fn(),
}))
const mockedUtils = utils as vi.Mocked<typeof utils>

afterEach(() => {
  vi.restoreAllMocks()
})

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}
describe('Table Module Insert Col Menu', () => {
  test('it should create InsertCol object', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    expect(typeof insertColMenu).toBe('object')
    expect(insertColMenu.tag).toBe('button')
    expect(insertColMenu.iconSvg).toBe(ADD_COL_SVG)
    expect(insertColMenu.title).toBe(locale.tableModule.insertCol)
    expect(insertColMenu.getValue(editor)).toBe('')
    expect(insertColMenu.isActive(editor)).toBeFalsy()
  })

  test('isDisabled should get truthy value if editor selection is null', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    editor.selection = null
    expect(insertColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor selection is collapsed', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => false)

    expect(insertColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is not table cell', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => null)

    expect(insertColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get falsy value if editor current selected node is table cell', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => ({}) as any)

    // Mock Editor.nodes to return a valid cell entry
    const cellEntryFn = function* () {
      yield [
        { type: 'table-cell', children: [{ text: '' }] } as slate.Element,
        [0, 0, 0],
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockReturnValue(cellEntryFn())

    // Mock filledMatrix to return a valid matrix structure
    mockedUtils.filledMatrix.mockImplementation(() => {
      return [
        [
          [
            [{ type: 'table-cell', children: [{ text: '' }] }, [0, 0, 0]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
        ],
      ]
    })

    expect(insertColMenu.isDisabled(editor)).toBeFalsy()
  })

  test('isDisabled should get truthy value if current column width is smaller than 20px', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => ({
      columnWidths: [10],
    }) as any)

    const cellEntryFn = function* () {
      yield [
        { type: 'table-cell', children: [{ text: '' }] } as slate.Element,
        [0, 0, 0],
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockReturnValue(cellEntryFn())
    mockedUtils.filledMatrix.mockImplementation(() => {
      return [
        [
          [
            [{ type: 'table-cell', children: [{ text: '' }] }, [0, 0, 0]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
        ],
      ]
    })

    expect(insertColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('exec should return directly if menu is disabled', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    setEditorSelection(editor, null)

    expect(insertColMenu.exec(editor, '')).toBeUndefined()
  })

  test('exec should return directly if current selected node parent is null', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    vi.spyOn(insertColMenu, 'isDisabled').mockReturnValue(false)

    const fn = function* () {
      yield [
        {
          type: 'table-cell',
          children: [],
        } as slate.Element,
        [0, 1],
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockReturnValue(fn())
    vi.spyOn(core.DomEditor, 'getParentNode').mockReturnValue(null)

    expect(insertColMenu.exec(editor, '')).toBeUndefined()
  })

  test('exec should return directly if current selected table row parent is null', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    vi.spyOn(insertColMenu, 'isDisabled').mockReturnValue(false)

    const fn = function* () {
      yield [
        {
          type: 'table-cell',
          children: [],
        } as slate.Element,
        [0, 1],
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockReturnValue(fn())
    vi.spyOn(core.DomEditor, 'getParentNode')
      .mockReturnValue({} as any)
      .mockReturnValue(null)

    expect(insertColMenu.exec(editor, '')).toBeUndefined()
  })

  test('exec should return directly if current selected table row parent is null', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor()

    vi.spyOn(insertColMenu, 'isDisabled').mockReturnValue(false)

    const fn = function* () {
      yield [
        {
          type: 'table-cell',
          children: [],
        } as slate.Element,
        [0, 1],
      ] as slate.NodeEntry<slate.Element>
    }

    vi.spyOn(slate.Editor, 'nodes').mockReturnValue(fn())
    vi.spyOn(core.DomEditor, 'getParentNode')
      .mockReturnValue({} as any)
      .mockReturnValue({
        type: 'table',
        children: [
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [],
              },
              {
                type: 'table-cell',
                children: [],
              },
            ],
          },
          {
            type: 'table-row',
            children: [
              {
                type: 'table-cell',
                children: [],
              },
              {
                type: 'table-cell',
                children: [],
              },
            ],
          },
        ],
      } as any)

    vi.spyOn(core.DomEditor, 'findPath').mockReturnValue([0, 1])
    const insertNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'insertNodes').mockImplementation(insertNodesFn)
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

    insertColMenu.exec(editor, '')

    expect(insertNodesFn).toBeCalledWith(
      editor,
      { type: 'table-cell', children: [{ text: '' }] },
      { at: [0, 0, 0] },
    )
  })

  test('exec should split column widths and insert header cells for header tables', () => {
    const insertColMenu = new InsertCol()
    const editor = createEditor({
      content: [
        {
          type: 'table',
          columnWidths: [120, 80],
          children: [
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', isHeader: true, children: [{ text: 'h1' }] },
                { type: 'table-cell', isHeader: true, children: [{ text: 'h2' }] },
              ],
            },
            {
              type: 'table-row',
              children: [
                { type: 'table-cell', children: [{ text: 'a1' }] },
                { type: 'table-cell', children: [{ text: 'a2' }] },
              ],
            },
          ],
        },
      ],
      config: {
        MENU_CONF: {
          insertTable: {
            minWidth: '60',
          },
        },
      },
    })

    editor.selection = {
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    }

    mockedUtils.filledMatrix.mockImplementation(() => {
      return [
        [
          [
            [{ type: 'table-cell', isHeader: true, children: [{ text: 'h1' }] }, [0, 0, 0]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
          [
            [{ type: 'table-cell', isHeader: true, children: [{ text: 'h2' }] }, [0, 0, 1]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
        ],
        [
          [
            [{ type: 'table-cell', children: [{ text: 'a1' }] }, [0, 1, 0]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
          [
            [{ type: 'table-cell', children: [{ text: 'a2' }] }, [0, 1, 1]],
            {
              rtl: 1, ltr: 1, ttb: 1, btt: 1,
            },
          ],
        ],
      ]
    })

    insertColMenu.exec(editor, '')

    const table = editor.children[0] as any

    expect(table.columnWidths).toEqual([60, 60, 80])
    expect(table.children[0].children).toHaveLength(3)
    expect(table.children[0].children[0].isHeader).toBe(true)
    expect(table.children[1].children).toHaveLength(3)
  })
})
