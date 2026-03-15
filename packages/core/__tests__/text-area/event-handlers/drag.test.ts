/**
 * @description drag handler test
 */

import { Editor, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import {
  handleOnDragend,
  handleOnDragover,
  handleOnDragstart,
} from '../../../src/text-area/event-handlers/drag'
import * as helpers from '../../../src/text-area/helpers'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('drag handlers', () => {
  it('selects void node and sets fragment data on dragstart', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(),
    } as any
    const textarea = { isDraggingInternally: false } as any
    const event = {
      target: {},
      dataTransfer: { setData: vi.fn() },
    } as any

    const node = { type: 'void', children: [{ text: '' }] }
    const path = [0, 0]
    const range = { anchor: { path, offset: 0 }, focus: { path, offset: 0 } }

    vi.spyOn(helpers, 'hasTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toSlateNode').mockReturnValue(node as any)
    vi.spyOn(DomEditor, 'findPath').mockReturnValue(path as any)
    vi.spyOn(DomEditor, 'getSelectedNodeByType').mockReturnValue(null)
    vi.spyOn(Editor, 'isVoid').mockReturnValue(true)
    vi.spyOn(Editor, 'range').mockReturnValue(range as any)
    vi.spyOn(Transforms, 'select').mockImplementation(() => {})

    handleOnDragstart(event, textarea, editor)

    expect(Transforms.select).toHaveBeenCalledWith(editor, range)
    expect(textarea.isDraggingInternally).toBe(true)
    expect(editor.setFragmentData).toHaveBeenCalledWith(event.dataTransfer)
  })

  it('prevents default on dragover when target is void', () => {
    const editor = {} as any
    const textarea = {} as any
    const event = { target: {}, preventDefault: vi.fn() } as any
    const node = { type: 'void', children: [{ text: '' }] }

    vi.spyOn(helpers, 'hasTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toSlateNode').mockReturnValue(node as any)
    vi.spyOn(Editor, 'isVoid').mockReturnValue(true)

    handleOnDragover(event, textarea, editor)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  it('clears internal drag state on dragend', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = { isDraggingInternally: true } as any
    const event = { target: {} } as any

    vi.spyOn(helpers, 'hasTarget').mockReturnValue(true)

    handleOnDragend(event, textarea, editor)

    expect(textarea.isDraggingInternally).toBe(false)
  })
})
