/**
 * @description video menu test
 * @author luochao
 */

import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import { isHTMLElememt } from '../../../../packages/core/src/utils/dom'
import createEditor from '../../../../tests/utils/create-editor'
import InsertVideoMenu from '../../src/module/menu/InsertVideoMenu'

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}

describe('videoModule module', () => {
  describe('module InsertVideoMenu', () => {
    const insertVideoMenu = new InsertVideoMenu()
    const editor = createEditor()

    test('InsertVideoMenu invoke getValue function should be empty string', () => {
      expect(insertVideoMenu.getValue(editor)).toBe('')
    })

    test('InsertVideoMenu invoke isActive function should be false', () => {
      expect(insertVideoMenu.isActive(editor)).toBe(false)
    })

    test('InsertVideoMenu invoke isDisabled if editor selection is null that the function return true', () => {
      setEditorSelection(editor, null)
      expect(insertVideoMenu.isDisabled(editor)).toBe(true)
    })

    test('InsertVideoMenu invoke isDisabled if editor selection is not collapsed that the function return true', () => {
      setEditorSelection(editor)

      vi.spyOn(slate.Range, 'isCollapsed').mockReturnValue(false)
      expect(insertVideoMenu.isDisabled(editor)).toBe(true)
    })

    test('InsertVideoMenu invoke isDisabled if editor selection is not null and collapsed that the function return false', () => {
      setEditorSelection(editor)

      vi.spyOn(slate.Range, 'isCollapsed').mockReturnValue(true)
      expect(insertVideoMenu.isDisabled(editor)).toBe(false)
    })

    test('InsertVideoMenu should remain enabled when current selection is in list-item', () => {
      setEditorSelection(editor)

      vi.spyOn(slate.Range, 'isCollapsed').mockReturnValue(true)
      vi.spyOn(core.DomEditor, 'getSelectedElems').mockReturnValue([{ type: 'list-item' }] as any)
      expect(insertVideoMenu.isDisabled(editor)).toBe(false)
    })

    test('InsertVideoMenu invoke getModalPositionNode should return null', () => {
      expect(insertVideoMenu.getModalPositionNode(editor)).toBeNull()
    })

    test('InsertVideoMenu invoke getModalContentElem should return HTML element', () => {
      expect(isHTMLElememt(insertVideoMenu.getModalContentElem(editor))).toBe(true)
    })
  })
})
