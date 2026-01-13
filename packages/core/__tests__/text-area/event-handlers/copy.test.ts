/**
 * @description copy handler test
 */

import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import handleOnCopy from '../../../src/text-area/event-handlers/copy'
import * as helpers from '../../../src/text-area/helpers'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnCopy', () => {
  it('sets fragment data and calls customCopy', () => {
    const clipboardData = { setData: vi.fn() }
    const customCopy = vi.fn()
    const editor = {
      getConfig: () => ({ readOnly: false, customCopy }),
      setFragmentData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)

    handleOnCopy(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(editor.setFragmentData).toHaveBeenCalledWith(clipboardData)
    expect(customCopy).toHaveBeenCalledWith(editor, event)
  })

  it('returns when clipboardData is null', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
      setFragmentData: vi.fn(),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData: null,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)

    handleOnCopy(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(editor.setFragmentData).not.toHaveBeenCalled()
  })
})
