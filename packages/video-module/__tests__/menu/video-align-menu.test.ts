import * as core from '@wangeditor-next/core'
import { Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import {
  VIDEO_ALIGN_CENTER_SVG,
  VIDEO_ALIGN_LEFT_SVG,
  VIDEO_ALIGN_RIGHT_SVG,
} from '../../src/constants/svg'
import VideoAlignMenu from '../../src/module/menu/VideoAlignMenu'

describe('video alignment menus', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses center as the active default and updates only video nodes', () => {
    const editor = createEditor()
    const video = { type: 'video', src: 'test.mp4', children: [{ text: '' }] }

    editor.selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    }
    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(video as any)
    const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
    const centerMenu = new VideoAlignMenu(
      'center',
      'videoModule.alignCenter',
      VIDEO_ALIGN_CENTER_SVG
    )
    const rightMenu = new VideoAlignMenu('right', 'videoModule.alignRight', VIDEO_ALIGN_RIGHT_SVG)

    expect(centerMenu.isDisabled(editor)).toBe(false)
    expect(centerMenu.isActive(editor)).toBe(true)
    expect(rightMenu.isActive(editor)).toBe(false)

    rightMenu.exec(editor, '')

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      { align: 'right' },
      { match: expect.any(Function) }
    )
  })

  it('is disabled without a selected video', () => {
    const editor = createEditor()
    const leftMenu = new VideoAlignMenu('left', 'videoModule.alignLeft', VIDEO_ALIGN_LEFT_SVG)

    vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(null)

    expect(leftMenu.isDisabled(editor)).toBe(true)
    expect(leftMenu.isActive(editor)).toBe(false)
  })
})
