/**
 * @description syncSelection tests
 */

import scrollIntoView from 'scroll-into-view-if-needed'
import { Range, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../src/editor/dom-editor'
import * as helpers from '../../src/text-area/helpers'
import { DOMSelectionToEditor, editorSelectionToDOM } from '../../src/text-area/syncSelection'
import { EDITOR_TO_ELEMENT, IS_FOCUSED } from '../../src/utils/weak-maps'

vi.mock('scroll-into-view-if-needed', () => ({
  default: vi.fn(),
}))

vi.mock('../../src/utils/ua', () => ({
  IS_FIREFOX: false,
}))

vi.mock('../../src/text-area/helpers', () => ({
  hasEditableTarget: vi.fn(),
  isTargetInsideNonReadonlyVoid: vi.fn(),
}))

const createSelection = (backward = false) => ({
  anchor: { path: backward ? [1, 0] : [0, 0], offset: 0 },
  focus: { path: backward ? [0, 0] : [0, 0], offset: backward ? 0 : 1 },
})

const createDomSelection = (overrides: Partial<Selection> = {}) => ({
  type: 'Range',
  anchorNode: null,
  focusNode: null,
  anchorOffset: 0,
  focusOffset: 0,
  setBaseAndExtent: vi.fn(),
  removeAllRanges: vi.fn(),
  ...overrides,
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('editorSelectionToDOM', () => {
  it('returns early when dom selection is missing', () => {
    const editor = {
      selection: createSelection(),
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false } as any
    const root = { getSelection: () => null }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    const toDOMRangeSpy = vi.spyOn(DomEditor, 'toDOMRange')

    editorSelectionToDOM(textarea, editor)

    expect(toDOMRangeSpy).not.toHaveBeenCalled()
  })

  it('returns early while composing', () => {
    const editor = {
      selection: createSelection(),
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: true } as any
    const domSelection = createDomSelection()
    const root = { getSelection: () => domSelection }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    const toDOMRangeSpy = vi.spyOn(DomEditor, 'toDOMRange')

    editorSelectionToDOM(textarea, editor)

    expect(toDOMRangeSpy).not.toHaveBeenCalled()
  })

  it('returns early when editor is not focused', () => {
    const editor = {
      selection: createSelection(),
      getConfig: () => ({ scroll: false }),
      isFocused: () => false,
    } as any
    const textarea = { isComposing: false } as any
    const domSelection = createDomSelection()
    const root = { getSelection: () => domSelection }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    const toDOMRangeSpy = vi.spyOn(DomEditor, 'toDOMRange')

    editorSelectionToDOM(textarea, editor)

    expect(toDOMRangeSpy).not.toHaveBeenCalled()
  })

  it('returns when selection is empty and dom selection is none', () => {
    const editor = {
      selection: null,
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false } as any
    const domSelection = createDomSelection({ type: 'None' as any })
    const root = { getSelection: () => domSelection }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    const toDOMRangeSpy = vi.spyOn(DomEditor, 'toDOMRange')

    editorSelectionToDOM(textarea, editor)

    expect(toDOMRangeSpy).not.toHaveBeenCalled()
  })

  it('returns when dom selection matches editor selection', () => {
    const selection = createSelection()
    const editor = {
      selection,
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false } as any

    const editorElement = document.createElement('div')
    const leaf = document.createElement('span')
    const textNode = document.createTextNode('hello')

    leaf.appendChild(textNode)
    editorElement.appendChild(leaf)
    EDITOR_TO_ELEMENT.set(editor, editorElement)

    const domSelection = createDomSelection({
      anchorNode: textNode,
      focusNode: textNode,
    })
    const root = { getSelection: () => domSelection }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(selection as any)
    const toDOMRangeSpy = vi.spyOn(DomEditor, 'toDOMRange')

    editorSelectionToDOM(textarea, editor)

    expect(toDOMRangeSpy).not.toHaveBeenCalled()
  })

  it('syncs selection when editor has no range', () => {
    const selection = createSelection()
    const editor = {
      selection,
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false } as any

    const editorElement = document.createElement('div')
    const textNode = document.createTextNode('hello')

    editorElement.appendChild(textNode)
    EDITOR_TO_ELEMENT.set(editor, editorElement)

    const domSelection = createDomSelection({
      anchorNode: textNode,
      focusNode: textNode,
    })
    const root = { getSelection: () => domSelection }
    const newSelection = createSelection()

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'hasRange').mockReturnValue(false)
    vi.spyOn(DomEditor, 'toSlateRange')
      .mockImplementationOnce(() => null as any)
      .mockImplementationOnce(() => newSelection as any)
    const toDOMRangeSpy = vi.spyOn(DomEditor, 'toDOMRange')

    editorSelectionToDOM(textarea, editor)

    expect(editor.selection).toEqual(newSelection)
    expect(toDOMRangeSpy).not.toHaveBeenCalled()
  })

  it('updates dom selection and scrolls into view', () => {
    vi.useFakeTimers()

    const selection = createSelection(true)
    const editor = {
      selection,
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false, isUpdatingSelection: false } as any

    const editorElement = document.createElement('div')
    const leaf = document.createElement('span')
    const textNode = document.createTextNode('hello')

    leaf.appendChild(textNode)
    editorElement.appendChild(leaf)
    EDITOR_TO_ELEMENT.set(editor, editorElement)

    const domSelection = createDomSelection({
      anchorNode: textNode,
      focusNode: textNode,
    })
    const root = { getSelection: () => domSelection }

    const rangeRect = {
      top: 1,
      right: 1,
      bottom: 1,
      left: 1,
      height: 1,
      width: 1,
    }
    const domRange = {
      startContainer: textNode,
      endContainer: textNode,
      startOffset: 0,
      endOffset: 1,
      getBoundingClientRect: () => rangeRect,
    } as any

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(null as any)
    vi.spyOn(DomEditor, 'hasRange').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue(domRange as any)

    editorSelectionToDOM(textarea, editor)

    expect(textarea.isUpdatingSelection).toBe(true)
    expect(domSelection.setBaseAndExtent).toHaveBeenCalledWith(
      domRange.endContainer,
      domRange.endOffset,
      domRange.startContainer,
      domRange.startOffset,
    )
    expect(scrollIntoView).toHaveBeenCalled()

    vi.runAllTimers()
    expect(textarea.isUpdatingSelection).toBe(false)
    vi.useRealTimers()
  })

  it('removes dom ranges when no dom range exists', () => {
    const selection = createSelection()
    const editor = {
      selection,
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false } as any

    const editorElement = document.createElement('div')
    const textNode = document.createTextNode('hello')

    editorElement.appendChild(textNode)
    EDITOR_TO_ELEMENT.set(editor, editorElement)

    const domSelection = createDomSelection({
      anchorNode: textNode,
      focusNode: textNode,
    })
    const root = { getSelection: () => domSelection }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(null as any)
    vi.spyOn(DomEditor, 'hasRange').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue(null as any)

    editorSelectionToDOM(textarea, editor)

    expect(domSelection.removeAllRanges).toHaveBeenCalled()
  })
})

describe('DOMSelectionToEditor', () => {
  it('returns early when editor is readonly', () => {
    const editor = { getConfig: () => ({ readOnly: true }) } as any
    const textarea = { isComposing: false, isUpdatingSelection: false, isDraggingInternally: false } as any

    const deselectSpy = vi.spyOn(Transforms, 'deselect')

    DOMSelectionToEditor(textarea, editor)

    expect(deselectSpy).not.toHaveBeenCalled()
  })

  it('deselects when editor is not active element', () => {
    const editor = { getConfig: () => ({ readOnly: false }) } as any
    const textarea = { isComposing: false, isUpdatingSelection: false, isDraggingInternally: false } as any

    const root = { activeElement: document.createElement('div'), getSelection: () => null }
    const editorElement = document.createElement('div')

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toDOMNode').mockReturnValue(editorElement as any)
    const deselectSpy = vi.spyOn(Transforms, 'deselect').mockImplementation(() => {})

    IS_FOCUSED.set(editor, true)
    DOMSelectionToEditor(textarea, editor)

    expect(IS_FOCUSED.has(editor)).toBe(false)
    expect(deselectSpy).toHaveBeenCalled()
  })

  it('deselects when dom selection is missing', () => {
    const editor = { getConfig: () => ({ readOnly: false }) } as any
    const textarea = { isComposing: false, isUpdatingSelection: false, isDraggingInternally: false } as any

    const editorElement = document.createElement('div')
    const root = { activeElement: editorElement, getSelection: () => null }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toDOMNode').mockReturnValue(editorElement as any)
    const deselectSpy = vi.spyOn(Transforms, 'deselect').mockImplementation(() => {})

    DOMSelectionToEditor(textarea, editor)

    expect(deselectSpy).toHaveBeenCalled()
  })

  it('selects range when anchor and focus are selectable', () => {
    const editor = { getConfig: () => ({ readOnly: false }) } as any
    const textarea = { isComposing: false, isUpdatingSelection: false, isDraggingInternally: false } as any

    const editorElement = document.createElement('div')
    const domSelection = createDomSelection({
      anchorNode: document.createTextNode('a'),
      focusNode: document.createTextNode('b'),
    })
    const root = { activeElement: editorElement, getSelection: () => domSelection }
    const range = createSelection()

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toDOMNode').mockReturnValue(editorElement as any)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(range as any)

    const hasEditableTarget = helpers.hasEditableTarget as unknown as vi.Mock
    const isTargetInsideNonReadonlyVoid = helpers.isTargetInsideNonReadonlyVoid as unknown as vi.Mock

    hasEditableTarget.mockReturnValue(true)
    isTargetInsideNonReadonlyVoid.mockReturnValue(false)

    const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {})

    DOMSelectionToEditor(textarea, editor)

    expect(selectSpy).toHaveBeenCalledWith(editor, range)
    expect(Range.isCollapsed(range)).toBe(false)
  })

  it('skips selection when nodes are not selectable', () => {
    const editor = { getConfig: () => ({ readOnly: false }) } as any
    const textarea = { isComposing: false, isUpdatingSelection: false, isDraggingInternally: false } as any

    const editorElement = document.createElement('div')
    const domSelection = createDomSelection({
      anchorNode: document.createTextNode('a'),
      focusNode: document.createTextNode('b'),
    })
    const root = { activeElement: editorElement, getSelection: () => domSelection }

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toDOMNode').mockReturnValue(editorElement as any)

    const hasEditableTarget = helpers.hasEditableTarget as unknown as vi.Mock
    const isTargetInsideNonReadonlyVoid = helpers.isTargetInsideNonReadonlyVoid as unknown as vi.Mock

    hasEditableTarget.mockReturnValue(false)
    isTargetInsideNonReadonlyVoid.mockReturnValue(false)

    const selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {})

    DOMSelectionToEditor(textarea, editor)

    expect(selectSpy).not.toHaveBeenCalled()
  })
})
