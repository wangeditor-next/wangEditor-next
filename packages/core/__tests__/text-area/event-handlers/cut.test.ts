/**
 * @description cut handler test
 */

import { Editor, Node, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { ClipboardFragmentEvents } from '../../../src/editor/clipboard'
import handleOnCut from '../../../src/text-area/event-handlers/cut'
import * as helpers from '../../../src/text-area/helpers'

afterEach(() => {
  vi.restoreAllMocks()
})

const createSelection = (expanded: boolean) => ({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: expanded ? 1 : 0 },
})

describe('handleOnCut', () => {
  it('deletes fragment for expanded selection', () => {
    const clipboardData = { setData: vi.fn() }
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnCut(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(editor.setFragmentData).toHaveBeenCalledWith(clipboardData)
    expect(Editor.deleteFragment).toHaveBeenCalledWith(editor)
  })

  it('cancels deletion when the writer returns false', () => {
    const clipboardData = { setData: vi.fn() }
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(() => false),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnCut(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(editor.setFragmentData).toHaveBeenCalledWith(clipboardData)
    expect(Editor.deleteFragment).not.toHaveBeenCalled()
  })

  it('cancels deletion when the internal completion rejects the transfer', () => {
    const listeners = new Map<string, Function>()
    const clipboardData = { setData: vi.fn() }
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(),
      on: (type: string, listener: Function) => { listeners.set(type, listener) },
      emit: (type: string, context: any) => listeners.get(type)?.(context),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData,
    } as any

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, (context: any) => {
      context.handled = true
      context.setCompletion(() => { context.cancel = true })
    })
    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnCut(event, {} as any, editor)

    expect(Editor.deleteFragment).not.toHaveBeenCalled()
  })

  it('does not stop native event propagation', () => {
    const clipboardData = { setData: vi.fn() }
    const editor = {
      selection: createSelection(true),
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
      stopImmediatePropagation: vi.fn(),
      clipboardData,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'deleteFragment').mockImplementation(() => {})

    handleOnCut(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(event.stopImmediatePropagation).not.toHaveBeenCalled()
  })

  it('deletes void node for collapsed selection', () => {
    const clipboardData = { setData: vi.fn() }
    const voidNode = { type: 'void', children: [{ text: '' }] }
    const editor = {
      selection: createSelection(false),
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Node, 'parent').mockReturnValue(voidNode as any)
    vi.spyOn(Editor, 'isVoid').mockReturnValue(true)
    vi.spyOn(Transforms, 'delete').mockImplementation(() => {})

    handleOnCut(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(Transforms.delete).toHaveBeenCalledWith(editor)
  })
})
