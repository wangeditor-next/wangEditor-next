/**
 * @description keypress handler test
 */

import { Editor } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import handleKeypress from '../../../src/text-area/event-handlers/keypress'
import * as helpers from '../../../src/text-area/helpers'

vi.mock('../../../src/utils/ua', () => ({
  HAS_BEFORE_INPUT_SUPPORT: false,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleKeypress', () => {
  it('inserts text when beforeInput is unsupported', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      key: 'a',
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(Editor, 'insertText').mockImplementation(() => {})

    handleKeypress(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(Editor.insertText).toHaveBeenCalledWith(editor, 'a')
  })
})
