/**
 * @description keydown handler test
 */

import { Editor, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import handleOnKeydown from '../../../src/text-area/event-handlers/keydown'
import * as helpers from '../../../src/text-area/helpers'
import Hotkeys from '../../../src/utils/hotkeys'
import { EDITOR_TO_TOOLBAR } from '../../../src/utils/weak-maps'

vi.mock('is-hotkey', () => ({
  isHotkey: () => true,
  isKeyHotkey: () => () => false,
}))

vi.mock('../../../src/utils/ua', () => ({
  HAS_BEFORE_INPUT_SUPPORT: false,
  IS_APPLE: false,
  IS_CHROME: false,
  IS_SAFARI: false,
}))

const createSelection = (expanded: boolean) => ({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: expanded ? 1 : 0 },
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnKeydown', () => {
  it('handles tab and triggers editor.handleTab', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      handleTab: vi.fn(),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isTab').mockReturnValue(true)

    handleOnKeydown(event, textarea, editor)

    expect(editor.handleTab).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('triggers menu hotkey exec', () => {
    const exec = vi.fn()
    const menu = {
      hotkey: 'mod+b',
      isDisabled: () => false,
      getValue: () => 'ok',
      exec,
    }
    const toolbar = { getMenus: () => ({ bold: menu }) }
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    EDITOR_TO_TOOLBAR.set(editor, toolbar as any)

    handleOnKeydown(event, textarea, editor)

    expect(exec).toHaveBeenCalledWith(editor, 'ok')
    EDITOR_TO_TOOLBAR.delete(editor)
  })

  it('deletes fragment on deleteBackward when selection is expanded', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteBackward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor, { direction: 'backward' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('selects all on selectAll hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      selectAll: vi.fn(),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isSelectAll').mockReturnValue(true)
    vi.spyOn(Transforms, 'move').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(editor.selectAll).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('handles redo hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      redo: vi.fn(),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isRedo').mockReturnValue(true)

    handleOnKeydown(event, textarea, editor)

    expect(editor.redo).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('handles undo hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      undo: vi.fn(),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isUndo').mockReturnValue(true)

    handleOnKeydown(event, textarea, editor)

    expect(editor.undo).toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('moves line backward on hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isMoveLineBackward').mockReturnValue(true)
    vi.spyOn(Transforms, 'move').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Transforms.move).toHaveBeenCalledWith(editor, { unit: 'line', reverse: true })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('extends line forward on hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isExtendLineForward').mockReturnValue(true)
    vi.spyOn(Transforms, 'move').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Transforms.move).toHaveBeenCalledWith(editor, { unit: 'line', edge: 'focus' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('moves backward with collapsed selection', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isMoveBackward').mockReturnValue(true)
    vi.spyOn(Transforms, 'move').mockImplementation(() => {})
    vi.spyOn(Transforms, 'collapse').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Transforms.move).toHaveBeenCalledWith(editor, { reverse: true })
    expect(Transforms.collapse).not.toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('collapses selection when moving backward with expanded selection', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isMoveBackward').mockReturnValue(true)
    vi.spyOn(Transforms, 'move').mockImplementation(() => {})
    vi.spyOn(Transforms, 'collapse').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Transforms.collapse).toHaveBeenCalledWith(editor, { edge: 'start' })
    expect(Transforms.move).not.toHaveBeenCalled()
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('moves word forward and collapses expanded selection', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isMoveWordForward').mockReturnValue(true)
    vi.spyOn(Transforms, 'move').mockImplementation(() => {})
    vi.spyOn(Transforms, 'collapse').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Transforms.collapse).toHaveBeenCalledWith(editor, { edge: 'focus' })
    expect(Transforms.move).toHaveBeenCalledWith(editor, { unit: 'word' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('prevents default for bold hotkey without beforeinput support', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isBold').mockReturnValue(true)

    handleOnKeydown(event, textarea, editor)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('splits block on splitBlock hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isSplitBlock').mockReturnValue(true)
    vi.spyOn(Editor, 'insertBreak').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.insertBreak).toHaveBeenCalledWith(editor)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes backward on collapsed selection without beforeinput support', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteBackward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteBackward').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteBackward).toHaveBeenCalledWith(editor)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes forward fragment on expanded selection', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteForward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor, { direction: 'forward' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes line backward on hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteLineBackward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteBackward').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteBackward).toHaveBeenCalledWith(editor, { unit: 'line' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes line forward fragment on expanded selection', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteLineForward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor, { direction: 'forward' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes word backward on hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteWordBackward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteBackward').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteBackward).toHaveBeenCalledWith(editor, { unit: 'word' })
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes word forward on hotkey', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isComposing: false } as any
    const event = { preventDefault: vi.fn(), target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Hotkeys, 'isDeleteWordForward').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteForward').mockImplementation(() => {})

    handleOnKeydown(event, textarea, editor)

    expect(Editor.deleteForward).toHaveBeenCalledWith(editor, { unit: 'word' })
    expect(event.preventDefault).toHaveBeenCalled()
  })
})
