import * as core from '@wangeditor-next/core'
import { Transforms } from 'slate'
import {
  afterEach, describe, expect, test, vi,
} from 'vitest'

import createEditor from '../../../../tests/utils/create-editor'
import EditVideoSizeMenu from '../../src/module/menu/EditVideoSizeMenu'
import EditVideoSrcMenu from '../../src/module/menu/EditVideoSrcMenu'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
  vi.useRealTimers()
})

function createVideoEditor(videoNode = {
  type: 'video',
  src: 'https://video.test/demo.mp4',
  poster: 'https://video.test/poster.png',
  style: {
    width: '320px',
    height: '180px',
  },
  children: [{ text: '' }],
}) {
  const editor = createEditor()

  editor.selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  }
  editor.restoreSelection = vi.fn()
  editor.hidePanelOrModal = vi.fn()

  vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockImplementation((_editor, type) => {
    if (type === 'video') {
      return videoNode as any
    }
    return null
  })

  return editor
}

describe('edit video menus', () => {
  test('EditVideoSizeMenu updates width and height styles from modal inputs', () => {
    vi.useFakeTimers()
    const editor = createVideoEditor()
    const menu = new EditVideoSizeMenu()

    const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
    const content = menu.getModalContentElem(editor) as HTMLDivElement
    const inputs = content.querySelectorAll('input')
    const button = content.querySelector('button') as HTMLButtonElement

    expect(menu.isDisabled(editor)).toBe(false)
    expect(inputs).toHaveLength(2)
    expect((inputs[0] as HTMLInputElement).value).toBe('320px')
    expect((inputs[1] as HTMLInputElement).value).toBe('180px');
    (inputs[0] as HTMLInputElement).value = '80';
    (inputs[1] as HTMLInputElement).value = '50%'
    button.click()

    expect(editor.restoreSelection).toHaveBeenCalled()
    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      {
        style: {
          width: '80px',
          height: '50%',
        },
      },
      expect.objectContaining({ match: expect.any(Function) }),
    )
    expect(editor.hidePanelOrModal).toHaveBeenCalled()

    vi.runAllTimers()
  })

  test('EditVideoSizeMenu falls back to auto for invalid values', () => {
    const editor = createVideoEditor()
    const menu = new EditVideoSizeMenu()
    const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
    const content = menu.getModalContentElem(editor) as HTMLDivElement
    const inputs = content.querySelectorAll('input')
    const button = content.querySelector('button') as HTMLButtonElement;

    (inputs[0] as HTMLInputElement).value = 'bad-width';
    (inputs[1] as HTMLInputElement).value = 'bad-height'
    button.click()

    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      {
        style: {
          width: 'auto',
          height: 'auto',
        },
      },
      expect.objectContaining({ match: expect.any(Function) }),
    )
  })

  test('EditVideoSrcMenu updates src, poster and key from modal inputs', () => {
    vi.useFakeTimers()
    const editor = createVideoEditor()
    const menu = new EditVideoSrcMenu()
    const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
    const content = menu.getModalContentElem(editor) as HTMLDivElement
    const inputs = content.querySelectorAll('input')
    const button = content.querySelector('button') as HTMLButtonElement

    expect(menu.isDisabled(editor)).toBe(false)
    expect((inputs[0] as HTMLInputElement).value).toBe('https://video.test/demo.mp4')
    expect((inputs[1] as HTMLInputElement).value).toBe('https://video.test/poster.png');
    (inputs[0] as HTMLInputElement).value = 'https://video.test/updated.mp4';
    (inputs[1] as HTMLInputElement).value = 'https://video.test/updated.png'
    button.click()

    expect(editor.restoreSelection).toHaveBeenCalled()
    expect(setNodesSpy).toHaveBeenCalledWith(
      editor,
      expect.objectContaining({
        src: 'https://video.test/updated.mp4',
        poster: 'https://video.test/updated.png',
        key: expect.stringContaining('video-'),
      }),
      expect.objectContaining({ match: expect.any(Function) }),
    )
    expect(editor.hidePanelOrModal).toHaveBeenCalled()

    vi.runAllTimers()
  })

  test('edit video menus are disabled when there is no video selection', () => {
    const editor = createEditor()
    const sizeMenu = new EditVideoSizeMenu()
    const srcMenu = new EditVideoSrcMenu()

    editor.selection = null

    expect(sizeMenu.isDisabled(editor)).toBe(true)
    expect(srcMenu.isDisabled(editor)).toBe(true)
  })
})
