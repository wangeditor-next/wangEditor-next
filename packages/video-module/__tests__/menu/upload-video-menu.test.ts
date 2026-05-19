/**
 * @description video menu test
 * @author luochao
 */

import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import UploadVideoMenu from '../../src/module/menu/UploadVideoMenu'
import $ from '../../src/utils/dom'

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
  describe('module UploadVideoMenu', () => {
    const uploadVideoMenu = new UploadVideoMenu()
    const baseEditor = createEditor()

    test('UploadVideoMenu invoke getValue function should be empty string', () => {
      expect(uploadVideoMenu.getValue(baseEditor)).toBe('')
    })

    test('UploadVideoMenu invoke isActive function should be false', () => {
      expect(uploadVideoMenu.isActive(baseEditor)).toBe(false)
    })

    test('UploadVideoMenu invoke isDisabled if editor selection is null that the function return true', () => {
      setEditorSelection(baseEditor, null)
      expect(uploadVideoMenu.isDisabled(baseEditor)).toBe(true)
    })

    test('UploadVideoMenu invoke isDisabled if editor selection is not collapsed that the function return true', () => {
      setEditorSelection(baseEditor)

      vi.spyOn(slate.Range, 'isCollapsed').mockReturnValue(false)
      expect(uploadVideoMenu.isDisabled(baseEditor)).toBe(true)
    })

    test('UploadVideoMenu invoke isDisabled if editor selection is not null and collapsed that the function return false', () => {
      setEditorSelection(baseEditor)

      vi.spyOn(slate.Range, 'isCollapsed').mockReturnValue(true)
      expect(uploadVideoMenu.isDisabled(baseEditor)).toBe(false)
    })

    test('UploadVideoMenu should remain enabled when current selection is in list-item', () => {
      setEditorSelection(baseEditor)

      vi.spyOn(slate.Range, 'isCollapsed').mockReturnValue(true)
      vi.spyOn(core.DomEditor, 'getSelectedElems').mockReturnValue([{ type: 'list-item' }] as any)
      expect(uploadVideoMenu.isDisabled(baseEditor)).toBe(false)
    })

    test('UploadVideoMenu invoke customBrowseAndUpload if editor give customBrowseAndUpload option', () => {
      const fn = vi.fn()
      const editor = createEditor({
        config: {
          MENU_CONF: {
            uploadVideo: {
              customBrowseAndUpload: fn,
            },
          },
        },
      })

      uploadVideoMenu.exec(editor, '')

      expect(fn).toBeCalled()
    })

    test('it should insert input element to body if invoke exec method', () => {
      const editor = createEditor()

      expect($('input').length).toBe(0)

      uploadVideoMenu.exec(editor, '')

      expect($('input').length).toBeGreaterThan(0)
    })

    test('it should insert input element with accept attr if editor config allowedFileTypes', () => {
      const editor = createEditor({
        config: {
          MENU_CONF: {
            uploadVideo: {
              allowedFileTypes: ['video/*'],
            },
          },
        },
      })

      uploadVideoMenu.exec(editor, '')

      expect($('input')[0].getAttribute('accept')).toBe('video/*')
    })
  })
})
