/**
 * @description textarea helpers test
 */

import { Editor } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../src/editor/dom-editor'
import {
  hasEditableTarget,
  hasTarget,
  isDOMEventHandled,
  isRangeEqual,
  isTargetInsideNonReadonlyVoid,
} from '../../src/text-area/helpers'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('text-area helpers', () => {
  it('compares ranges including reversed order', () => {
    const nodeA = {}
    const nodeB = {}
    const rangeA = {
      startContainer: nodeA,
      startOffset: 1,
      endContainer: nodeB,
      endOffset: 2,
    } as any
    const rangeB = {
      startContainer: nodeA,
      startOffset: 1,
      endContainer: nodeB,
      endOffset: 2,
    } as any
    const reversed = {
      startContainer: nodeB,
      startOffset: 2,
      endContainer: nodeA,
      endOffset: 1,
    } as any
    const different = {
      startContainer: nodeA,
      startOffset: 0,
      endContainer: nodeB,
      endOffset: 2,
    } as any

    expect(isRangeEqual(rangeA, rangeB)).toBe(true)
    expect(isRangeEqual(rangeA, reversed)).toBe(true)
    expect(isRangeEqual(rangeA, different)).toBe(false)
  })

  it('checks editable target with dom node', () => {
    const editor = {} as any
    const target = { nodeType: 1 } as any
    const hasNodeSpy = vi.spyOn(DomEditor, 'hasDOMNode').mockReturnValue(true)

    expect(hasEditableTarget(editor, target)).toBe(true)
    expect(hasNodeSpy).toHaveBeenCalledWith(editor, target, { editable: true })
  })

  it('returns false for non-dom target', () => {
    const editor = {} as any
    const hasNodeSpy = vi.spyOn(DomEditor, 'hasDOMNode').mockReturnValue(true)

    expect(hasEditableTarget(editor, null)).toBe(false)
    expect(hasNodeSpy).not.toHaveBeenCalled()
  })

  it('checks target inside editor', () => {
    const editor = {} as any
    const target = { nodeType: 1 } as any
    const hasNodeSpy = vi.spyOn(DomEditor, 'hasDOMNode').mockReturnValue(true)

    expect(hasTarget(editor, target)).toBe(true)
    expect(hasNodeSpy).toHaveBeenCalledWith(editor, target)
  })

  it('checks target inside non-readonly void node', () => {
    const editor = { getConfig: () => ({ readOnly: false }) } as any
    const target = { nodeType: 1 } as any

    vi.spyOn(DomEditor, 'hasDOMNode').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toSlateNode').mockReturnValue({ type: 'void' } as any)
    vi.spyOn(Editor, 'isVoid').mockReturnValue(true)

    expect(isTargetInsideNonReadonlyVoid(editor, target)).toBe(true)
  })

  it('returns false when editor is readonly', () => {
    const editor = { getConfig: () => ({ readOnly: true }) } as any
    const target = { nodeType: 1 } as any
    const isVoidSpy = vi.spyOn(Editor, 'isVoid')

    expect(isTargetInsideNonReadonlyVoid(editor, target)).toBe(false)
    expect(isVoidSpy).not.toHaveBeenCalled()
  })

  it('returns false when target is not in editor', () => {
    const editor = { getConfig: () => ({ readOnly: false }) } as any
    const target = { nodeType: 1 } as any

    vi.spyOn(DomEditor, 'hasDOMNode').mockReturnValue(false)

    expect(isTargetInsideNonReadonlyVoid(editor, target)).toBe(false)
  })

  it('handles dom event with handler return value', () => {
    const event = { defaultPrevented: false } as any

    expect(isDOMEventHandled(event, () => true)).toBe(true)
    expect(isDOMEventHandled(event, () => false)).toBe(false)
  })

  it('handles dom event with default prevention', () => {
    const preventedEvent = { defaultPrevented: true } as any
    const normalEvent = { defaultPrevented: false } as any

    expect(isDOMEventHandled(preventedEvent, () => undefined)).toBe(true)
    expect(isDOMEventHandled(normalEvent, () => undefined)).toBe(false)
    expect(isDOMEventHandled(normalEvent, undefined)).toBe(false)
  })
})
