/**
 * @description drop handler test
 */

import { Transforms } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import handleOnDrop from '../../../src/text-area/event-handlers/drop'
import * as helpers from '../../../src/text-area/helpers'

vi.mock('../../../src/utils/ua', () => ({
  HAS_BEFORE_INPUT_SUPPORT: true,
  IS_SAFARI: false,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnDrop', () => {
  it('inserts data and focuses editor after internal drag', () => {
    const draggedRange = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    }
    const range = {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    }
    const editor = {
      selection: draggedRange,
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
      isFocused: () => false,
      focus: vi.fn(),
    } as any
    const textarea = { isDraggingInternally: true } as any
    const dataTransfer = { files: [] }
    const event = {
      target: {},
      dataTransfer,
      preventDefault: vi.fn(),
    } as any

    vi.spyOn(helpers, 'hasTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'findEventRange').mockReturnValue(range as any)
    vi.spyOn(Transforms, 'select').mockImplementation(() => {})
    vi.spyOn(Transforms, 'delete').mockImplementation(() => {})

    handleOnDrop(event, textarea, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(Transforms.select).toHaveBeenCalledWith(editor, range)
    expect(Transforms.delete).toHaveBeenCalledWith(editor, { at: draggedRange })
    expect(textarea.isDraggingInternally).toBe(false)
    expect(editor.insertData).toHaveBeenCalledWith(dataTransfer)
    expect(editor.focus).toHaveBeenCalled()
  })
})
