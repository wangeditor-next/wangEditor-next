/**
 * @description keydown handler test with beforeinput support
 */

import {
  Editor, Element, Node, Transforms,
} from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

const createSelection = () => ({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 0 },
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnKeydown with beforeinput support', () => {
  it('deletes selected void inline node on chrome', async () => {
    vi.resetModules()
    vi.doMock('is-hotkey', () => ({
      isHotkey: () => true,
      isKeyHotkey: () => () => false,
    }))
    vi.doMock('../../../src/utils/ua', () => ({
      HAS_BEFORE_INPUT_SUPPORT: true,
      IS_APPLE: false,
      IS_CHROME: true,
      IS_SAFARI: false,
    }))
    vi.doMock('../../../src/text-area/helpers', () => ({
      hasEditableTarget: () => true,
    }))

    const [{ default: handleOnKeydown }, { default: Hotkeys }] = await Promise.all([
      import('../../../src/text-area/event-handlers/keydown'),
      import('../../../src/utils/hotkeys'),
    ])

    const editor = {
      selection: createSelection(),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any
    const voidNode = { type: 'void' }

    const deleteBackwardSpy = vi.spyOn(Hotkeys, 'isDeleteBackward').mockReturnValue(true)

    vi.spyOn(Node, 'parent').mockReturnValue(voidNode as any)
    vi.spyOn(Element, 'isElement').mockReturnValue(true)
    vi.spyOn(Editor, 'isVoid').mockReturnValue(true)
    vi.spyOn(Editor, 'isInline').mockReturnValue(true)
    vi.spyOn(Transforms, 'delete').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(deleteBackwardSpy).toHaveBeenCalledTimes(1)
    expect(event.preventDefault).toHaveBeenCalled()
    expect(Transforms.delete).toHaveBeenCalledWith(editor, { unit: 'block' })
  })
})
