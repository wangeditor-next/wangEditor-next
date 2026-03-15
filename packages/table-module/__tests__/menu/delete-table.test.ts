import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import locale from '../../src/locale/zh-CN'
import DeleteTable from '../../src/module/menu/DeleteTable'

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}
describe('Table Module Delete Table Menu', () => {
  test('it should create DeleteTable object', () => {
    const deleteTableMenu = new DeleteTable()
    const editor = createEditor()

    expect(typeof deleteTableMenu).toBe('object')
    expect(deleteTableMenu.tag).toBe('button')
    expect(deleteTableMenu.title).toBe(locale.tableModule.deleteTable)
    expect(deleteTableMenu.getValue(editor)).toBe('')
    expect(deleteTableMenu.isActive(editor)).toBeFalsy()
  })

  test('isDisabled should get truthy value if editor selection is null', () => {
    const deleteTableMenu = new DeleteTable()
    const editor = createEditor()

    editor.selection = null
    expect(deleteTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get truthy value if editor current selected node is not table cell', () => {
    const deleteTableMenu = new DeleteTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => null)

    expect(deleteTableMenu.isDisabled(editor)).toBeTruthy()
  })

  test('isDisabled should get falsy value if editor current selected node is table cell', () => {
    const deleteTableMenu = new DeleteTable()
    const editor = createEditor()

    setEditorSelection(editor)

    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation(() => ({}) as any)

    expect(deleteTableMenu.isDisabled(editor)).toBeFalsy()
  })

  test('exec should return directly if menu is disabled', () => {
    const deleteTableMenu = new DeleteTable()
    const editor = createEditor()

    setEditorSelection(editor, null)

    expect(deleteTableMenu.exec(editor, '')).toBeUndefined()
  })

  test('exec should invoke removeNodes method to remove whole table if menu is not disabled', () => {
    const deleteTableMenu = new DeleteTable()
    const editor = createEditor()

    vi.spyOn(deleteTableMenu, 'isDisabled').mockReturnValue(false)
    const fn = vi.fn()

    vi.spyOn(slate.Transforms, 'removeNodes').mockImplementation(fn)

    deleteTableMenu.exec(editor, '')
    expect(fn).toBeCalled()
  })
})
