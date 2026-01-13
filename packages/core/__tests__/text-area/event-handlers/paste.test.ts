/**
 * @description paste handler test
 */

import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import handleOnPaste from '../../../src/text-area/event-handlers/paste'
import * as helpers from '../../../src/text-area/helpers'
import { EDITOR_TO_CAN_PASTE } from '../../../src/utils/weak-maps'

vi.mock('../../../src/utils/ua', () => ({
  HAS_BEFORE_INPUT_SUPPORT: true,
  IS_SAFARI: false,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

const createClipboardData = () => ({
  getData: () => 'text',
  types: ['text/plain'],
})

describe('handleOnPaste', () => {
  it('blocks default paste when customPaste returns false', () => {
    const editor = {
      getConfig: () => ({
        readOnly: false,
        customPaste: () => false,
      }),
      insertData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData: createClipboardData(),
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)

    handleOnPaste(event, {} as any, editor)

    expect(EDITOR_TO_CAN_PASTE.get(editor)).toBe(false)
    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(editor.insertData).not.toHaveBeenCalled()
    EDITOR_TO_CAN_PASTE.delete(editor)
  })

  it('pastes plain text by insertData', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
      insertData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData: createClipboardData(),
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)

    handleOnPaste(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(editor.insertData).toHaveBeenCalledWith(event.clipboardData)
    EDITOR_TO_CAN_PASTE.delete(editor)
  })
})
