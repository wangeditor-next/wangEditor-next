import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { DEL_COL_SVG } from '../../src/constants/svg'
import locale from '../../src/locale/zh-CN'
import DeleteCol from '../../src/module/menu/DeleteCol'
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
describe('Table Module Delete Col Menu', () => {
  test('it should create DeleteCol object', () => {
    const deleteColMenu = new DeleteCol()

    expect(typeof deleteColMenu).toBe('object')
    expect(deleteColMenu.tag).toBe('button')
    expect(deleteColMenu.iconSvg).toBe(DEL_COL_SVG)
    expect(deleteColMenu.title).toBe(locale.tableModule.deleteCol)
  })

  test('it should get empty string if invoke getValue method', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    expect(deleteColMenu.getValue(editor)).toBe('')
  })

  test('it should get falsy value if invoke isActive method', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    expect(deleteColMenu.isActive(editor)).toBeFalsy()
  })

  test('isDisabled should get truthy value if editor selection is null', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    editor.selection = null
    expect(deleteColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor selection is collapsed', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => false)

    expect(deleteColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is not table cell', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => null)

    expect(deleteColMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get falsy value if editor current selected node is table cell', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(slate.Range, 'isCollapsed').mockImplementation(() => true)
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => ({}) as any)

    expect(deleteColMenu.isDisabled(editor)).toBeFalsy()
  })

  test('exec should return directly if menu is disabled', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    setEditorSelection(editor, null)

    expect(deleteColMenu.exec(editor, '')).toBeUndefined()
  })

  test('exec should invoke removeNodes method to remove whole table if menu is not disabled and table col length less than 1', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    vi.spyOn(deleteColMenu, 'isDisabled').mockImplementation(() => false)
    vi.spyOn(core.DomEditor, 'getParentNode').mockImplementation(() => ({
      type: 'table-col',
      children: [],
    }))

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
    const removeNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'removeNodes').mockImplementation(removeNodesFn)

    deleteColMenu.exec(editor, '')
    expect(removeNodesFn).toBeCalled()
  })

  test('exec should invoke removeNodes method to remove all table cells if menu is not disabled and table col length greater than 1', () => {
    const deleteColMenu = new DeleteCol()
    const editor = createEditor()

    vi.spyOn(deleteColMenu, 'isDisabled').mockImplementation(() => false)
    vi.spyOn(core.DomEditor, 'getParentNode').mockImplementation(() => ({
      type: 'table-row',
      children: [
        {
          type: 'table-col',
          children: [{ type: 'table-cell', children: [] }],
        },
        {
          type: 'table-col',
          children: [{ type: 'table-cell', children: [] }],
        },
      ],
    }))

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

    vi.spyOn(slate.Editor, 'hasPath').mockReturnValue(true)
    const removeNodesFn = vi.fn()

    vi.spyOn(slate.Transforms, 'removeNodes').mockImplementation(removeNodesFn)

    deleteColMenu.exec(editor, '')
    expect(removeNodesFn).toBeCalledTimes(2)
  })
})
