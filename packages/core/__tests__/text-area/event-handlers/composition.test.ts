/**
 * @description composition handlers test
 */

import { Editor, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import flushPromises from '../../../../../tests/utils/flush-promises'
import { DomEditor } from '../../../src/editor/dom-editor'
import {
  handleCompositionEnd,
  handleCompositionStart,
  handleCompositionUpdate,
} from '../../../src/text-area/event-handlers/composition'
import * as helpers from '../../../src/text-area/helpers'
import { hidePlaceholder } from '../../../src/text-area/place-holder'
import { editorSelectionToDOM } from '../../../src/text-area/syncSelection'
import {
  EDITOR_TO_PENDING_COMPOSITION_END,
  EDITOR_TO_PENDING_SELECTION,
} from '../../../src/utils/weak-maps'

vi.mock('../../../src/utils/ua', () => ({
  IS_CHROME: true,
  IS_FIREFOX: false,
  IS_SAFARI: false,
}))

vi.mock('../../../src/text-area/place-holder', () => ({
  hidePlaceholder: vi.fn(),
}))

vi.mock('../../../src/text-area/syncSelection', () => ({
  editorSelectionToDOM: vi.fn(),
}))

afterEach(() => {
  vi.restoreAllMocks()
})

const createSelection = (expanded: boolean) => ({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: expanded ? 1 : 0 },
})

describe('composition handlers', () => {
  it('handles composition start on expanded selection', async () => {
    const editor = {
      selection: createSelection(true),
    } as any
    const textarea = { isComposing: false } as any
    const event = { target: {} } as any
    const startContainer = { textContent: 'old' }

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})
    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue({ startContainer } as any)

    handleCompositionStart(event, textarea, editor)
    await flushPromises()

    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor)
    expect(textarea.isComposing).toBe(true)
    expect(hidePlaceholder).toHaveBeenCalledWith(textarea, editor)
    expect(editorSelectionToDOM).toHaveBeenCalledWith(textarea, editor, true)
  })

  it('marks composing state on update', () => {
    const editor = {} as any
    const textarea = { isComposing: false } as any
    const event = { target: {} } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)

    handleCompositionUpdate(event, textarea, editor)

    expect(textarea.isComposing).toBe(true)
  })

  it('handles composition end with maxLength', () => {
    const paragraph = { type: 'paragraph', children: [{ text: 'x' }] }
    const codeNode = { type: 'code', children: [{ text: 'y' }] }
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ maxLength: 2 }),
    } as any
    const textarea = { changeViewState: vi.fn() } as any
    const event = { target: {}, data: 'abc' } as any
    const startContainer = { nodeType: Node.TEXT_NODE, textContent: 'before' }

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'cleanExposedTexNodeInSelectionBlock').mockImplementation(() => {})
    vi.spyOn(DomEditor, 'setNewKey').mockImplementation(() => {})
    vi.spyOn(DomEditor, 'getLeftLengthOfMaxLength').mockReturnValue(1)
    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue({ startContainer } as any)
    vi.spyOn(Editor, 'node').mockImplementation((_ed, path) => {
      if (path.length === 1) {
        return [paragraph, path] as any
      }
      return [codeNode, path] as any
    })
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleCompositionEnd(event, textarea, editor)

    expect(DomEditor.cleanExposedTexNodeInSelectionBlock).toHaveBeenCalledWith(editor)
    expect(DomEditor.setNewKey).toHaveBeenCalledWith(paragraph)
    expect(Editor.insertText).toHaveBeenCalledWith(editor, 'a')
    expect(textarea.changeViewState).toHaveBeenCalled()
  })

  it('skips duplicate insert when beforeinput already handled composition commit', () => {
    const paragraph = { type: 'paragraph', children: [{ text: 'x' }] }
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ maxLength: 0 }),
    } as any
    const textarea = { changeViewState: vi.fn() } as any
    const event = { target: {}, data: '拼' } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'cleanExposedTexNodeInSelectionBlock').mockImplementation(() => {})
    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue({ getSelection: () => null } as any)
    vi.spyOn(Editor, 'node').mockImplementation((_ed, path) => {
      if (path.length === 1) {
        return [paragraph, path] as any
      }

      return [{ text: 'x' }, path] as any
    })
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})
    EDITOR_TO_PENDING_COMPOSITION_END.set(editor, true)

    handleCompositionEnd(event, textarea, editor)

    expect(DomEditor.cleanExposedTexNodeInSelectionBlock).toHaveBeenCalledWith(editor)
    expect(Editor.insertText).not.toHaveBeenCalled()
    expect(EDITOR_TO_PENDING_COMPOSITION_END.has(editor)).toBe(false)
  })

  it('does not restore pending selection before inserting committed composition text', () => {
    const paragraph = { type: 'paragraph', children: [{ text: 'x' }] }
    const pendingSelection = {
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    }
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ maxLength: 0 }),
    } as any
    const textarea = { changeViewState: vi.fn() } as any
    const event = { target: {}, data: '拼' } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'cleanExposedTexNodeInSelectionBlock').mockImplementation(() => {})
    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue({ getSelection: () => null } as any)
    vi.spyOn(Editor, 'node').mockImplementation((_ed, path) => {
      if (path.length === 1) {
        return [paragraph, path] as any
      }

      return [{ text: 'x' }, path] as any
    })
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})
    const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {})

    EDITOR_TO_PENDING_SELECTION.set(editor, pendingSelection as any)

    handleCompositionEnd(event, textarea, editor)

    expect(selectSpy).not.toHaveBeenCalled()
    expect(Editor.insertText).toHaveBeenCalledWith(editor, '拼')
    expect(EDITOR_TO_PENDING_SELECTION.has(editor)).toBe(false)
  })
})
