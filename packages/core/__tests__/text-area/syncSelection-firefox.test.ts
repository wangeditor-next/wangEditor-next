/**
 * @description syncSelection firefox branch test
 */

import scrollIntoView from 'scroll-into-view-if-needed'
import {
  describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../src/editor/dom-editor'
import { editorSelectionToDOM } from '../../src/text-area/syncSelection'
import { EDITOR_TO_ELEMENT } from '../../src/utils/weak-maps'

vi.mock('scroll-into-view-if-needed', () => ({
  default: vi.fn(),
}))

vi.mock('../../src/utils/ua', () => ({
  IS_FIREFOX: true,
}))

describe('editorSelectionToDOM firefox', () => {
  it('focuses element after selection update', () => {
    vi.useFakeTimers()

    const selection = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    }
    const editor = {
      selection,
      getConfig: () => ({ scroll: false }),
      isFocused: () => true,
    } as any
    const textarea = { isComposing: false, isUpdatingSelection: false } as any

    const editorElement = document.createElement('div')

    editorElement.focus = vi.fn()
    const leaf = document.createElement('span')
    const textNode = document.createTextNode('hello')

    leaf.appendChild(textNode)
    editorElement.appendChild(leaf)
    EDITOR_TO_ELEMENT.set(editor, editorElement)

    const domSelection = {
      type: 'Range',
      anchorNode: textNode,
      focusNode: textNode,
      anchorOffset: 0,
      focusOffset: 1,
      setBaseAndExtent: vi.fn(),
      removeAllRanges: vi.fn(),
    }
    const root = { getSelection: () => domSelection }
    const domRange = {
      startContainer: textNode,
      endContainer: textNode,
      startOffset: 0,
      endOffset: 1,
      getBoundingClientRect: () => ({
        top: 1,
        right: 1,
        bottom: 1,
        left: 1,
        height: 1,
        width: 1,
      }),
    } as any

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(null as any)
    vi.spyOn(DomEditor, 'hasRange').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue(domRange as any)

    editorSelectionToDOM(textarea, editor)

    vi.runAllTimers()

    expect(editorElement.focus).toHaveBeenCalled()
    expect(scrollIntoView).toHaveBeenCalled()

    vi.useRealTimers()
  })
})
