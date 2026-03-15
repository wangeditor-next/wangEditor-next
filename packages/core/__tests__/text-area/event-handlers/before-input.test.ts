/**
 * @description beforeinput handler test
 */

import { Editor, Range } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import handleBeforeInput from '../../../src/text-area/event-handlers/beforeInput'
import * as helpers from '../../../src/text-area/helpers'
import { EDITOR_TO_CAN_PASTE } from '../../../src/utils/weak-maps'

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
})
