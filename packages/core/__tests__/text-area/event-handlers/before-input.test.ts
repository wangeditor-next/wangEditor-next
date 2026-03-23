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

  it('returns early when the event target is not editable', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      inputType: 'insertText',
      data: 'hello',
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(false)
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

  it('does not reselect when target range already matches editor selection', () => {
    const range = createSelection(false)
    const editor = {
      selection: range,
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const event = {
      inputType: 'insertText',
      data: 'same',
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [{ startContainer: document.createTextNode('x') }],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(range as any)
    vi.spyOn(Transforms, 'select').mockImplementation(() => {})
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleBeforeInput(event, {} as any, editor)

    expect(Transforms.select).not.toHaveBeenCalled()
    expect(Editor.insertText).toHaveBeenCalledWith(editor, 'same')
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

  it('routes deleteByCut and deleteWordForward to the expected editor commands', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const cutEvent = {
      inputType: 'deleteByCut',
      data: null,
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any
    const wordEvent = {
      inputType: 'deleteWordForward',
      data: null,
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})
    vi.spyOn(Editor, 'deleteForward').mockImplementation(() => {})

    handleBeforeInput(cutEvent, {} as any, editor)
    handleBeforeInput(wordEvent, {} as any, editor)

    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor)
    expect(Editor.deleteForward).toHaveBeenCalledWith(editor, { unit: 'word' })
  })

  it('inserts breaks for paragraph input and ignores composition-text mutations', () => {
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
    } as any
    const paragraphEvent = {
      inputType: 'insertParagraph',
      data: null,
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any
    const compositionEvent = {
      inputType: 'insertCompositionText',
      data: '拼',
      dataTransfer: null,
      target: {},
      preventDefault: vi.fn(),
      getTargetRanges: () => [],
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertBreak').mockImplementation(() => {})

    handleBeforeInput(paragraphEvent, {} as any, editor)
    handleBeforeInput(compositionEvent, {} as any, editor)

    expect(Editor.insertBreak).toHaveBeenCalledWith(editor)
    expect(compositionEvent.preventDefault).not.toHaveBeenCalled()
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
