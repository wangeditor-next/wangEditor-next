/**
 * @description cut handler test
 */

import { Editor, Node, Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

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

  it('deletes void node for collapsed selection', () => {
    const clipboardData = { setData: vi.fn() }
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
    vi.spyOn(Node, 'parent').mockReturnValue({ type: 'void' } as any)
    vi.spyOn(Editor, 'isVoid').mockReturnValue(true)
    vi.spyOn(Transforms, 'delete').mockImplementation(() => {})

    handleOnCut(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(Transforms.delete).toHaveBeenCalledWith(editor)
  })
})
