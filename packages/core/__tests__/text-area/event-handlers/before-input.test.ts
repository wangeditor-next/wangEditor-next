/**
 * @description beforeinput handler test
 */

import { Editor, Range, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import handleBeforeInput from '../../../src/text-area/event-handlers/beforeInput'
import * as helpers from '../../../src/text-area/helpers'
import * as domUtils from '../../../src/utils/dom'
import {
  EDITOR_TO_CAN_PASTE,
  EDITOR_TO_PENDING_COMPOSITION_END,
} from '../../../src/utils/weak-maps'

vi.mock('../../../src/utils/ua', () => ({
  HAS_BEFORE_INPUT_SUPPORT: true,
}))

const createSelection = (expanded: boolean) => ({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: expanded ? 1 : 0 },
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleBeforeInput', () => {
  it('inserts text for insertText', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const event = {
      inputType: 'insertText',
      data: 'hello',
      dataTransfer: null,
      isComposing: false,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Editor.insertText).toHaveBeenCalledWith(editor, 'hello')
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('flushes DOM selection sync before handling input', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const textarea = {
      flushDOMSelectionChange: vi.fn(),
    } as any
    const event = {
      inputType: 'insertText',
      data: 'hello',
      dataTransfer: null,
      isComposing: false,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleBeforeInput(event, textarea, editor)

    expect(textarea.flushDOMSelectionChange).toHaveBeenCalledTimes(1)
  })

  it('deletes backward for deleteContentBackward', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      inputType: 'deleteContentBackward',
      data: null,
      dataTransfer: null,
      isComposing: false,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteBackward').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Editor.deleteBackward).toHaveBeenCalledWith(editor)
    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('deletes fragment when selection is expanded', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      inputType: 'deleteContentForward',
      data: null,
      dataTransfer: null,
      isComposing: false,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'getSelectedElems').mockReturnValue([{ type: 'paragraph' }] as any)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Range.isExpanded(editor.selection)).toBe(true)
    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor, { direction: 'forward' })
  })

  it('skips insertFromPaste when editor canPaste is false', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      inputType: 'insertFromPaste',
      data: 'blocked',
      dataTransfer: null,
      isComposing: false,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})
    EDITOR_TO_CAN_PASTE.set(editor, false)

    handleBeforeInput(event, {} as any, editor)

    expect(Editor.insertText).not.toHaveBeenCalled()
    EDITOR_TO_CAN_PASTE.delete(editor)
  })

  it('marks insertFromComposition as already handled', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const textarea = {
      flushDOMSelectionChange: vi.fn(),
      isComposing: true,
    } as any
    const event = {
      inputType: 'insertFromComposition',
      data: '拼',
      dataTransfer: null,
      isComposing: true,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleBeforeInput(event, textarea, editor)

    expect(Editor.insertText).toHaveBeenCalledWith(editor, '拼')
    expect(textarea.isComposing).toBe(false)
    expect(EDITOR_TO_PENDING_COMPOSITION_END.get(editor)).toBe(true)

    EDITOR_TO_PENDING_COMPOSITION_END.delete(editor)
  })

  it('returns early when editor is readOnly', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: true }),
    } as any
    const event = {
      inputType: 'insertText',
      data: 'hello',
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(Editor.insertText).not.toHaveBeenCalled()
  })

  it('syncs the target range into editor selection before inserting text', () => {
    const range = createSelection(false)
    const editor = {
      selection: null,
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const targetRange = { startContainer: document.createTextNode('x') }
    const event = {
      inputType: 'insertText',
      data: 'hello',
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [targetRange],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(range as any)
    vi.spyOn(Transforms, 'select').mockImplementation(() => {})
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Transforms.select).toHaveBeenCalledWith(editor, range)
    expect(Editor.insertText).toHaveBeenCalledWith(editor, 'hello')
  })

  it('does not delete when selection partially covers a table', () => {
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      inputType: 'deleteContentBackward',
      data: null,
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'getSelectedElems').mockReturnValue([
      { type: 'table' },
      { type: 'paragraph' },
    ] as any)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Editor.deleteFragment).not.toHaveBeenCalled()
  })

  it('deletes an entire soft line by calling backward and forward line deletion', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      inputType: 'deleteEntireSoftLine',
      data: null,
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteBackward').mockImplementation(() => {})
    vi.spyOn(Editor, 'deleteForward').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Editor.deleteBackward).toHaveBeenCalledWith(editor, { unit: 'line' })
    expect(Editor.deleteForward).toHaveBeenCalledWith(editor, { unit: 'line' })
  })

  it('inserts transfer data for allowed paste events', () => {
    const transfer = new DataTransfer()
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const event = {
      inputType: 'insertFromPaste',
      data: null,
      dataTransfer: transfer,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(domUtils, 'isDataTransfer').mockReturnValue(true)
    EDITOR_TO_CAN_PASTE.set(editor, true)

    handleBeforeInput(event, {} as any, editor)

    expect(editor.insertData).toHaveBeenCalledWith(transfer)

    EDITOR_TO_CAN_PASTE.delete(editor)
  })
})
