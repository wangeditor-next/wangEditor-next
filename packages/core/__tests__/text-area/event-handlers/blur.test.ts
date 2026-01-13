/**
 * @description blur handler test
 */

import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import handleOnBlur from '../../../src/text-area/event-handlers/blur'
import * as helpers from '../../../src/text-area/helpers'
import { IS_FOCUSED } from '../../../src/utils/weak-maps'

vi.mock('../../../src/utils/ua', () => ({
  IS_SAFARI: true,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnBlur', () => {
  it('clears selection and unsets focus state', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
    } as any
    const textarea = {
      isUpdatingSelection: false,
      latestElement: null,
    } as any
    const event = {
      target: {},
      relatedTarget: null,
    } as any

    const removeAllRanges = vi.fn()
    const root = {
      activeElement: document.createElement('div'),
      getSelection: () => ({ removeAllRanges }),
    }

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root as any)
    vi.spyOn(DomEditor, 'toDOMNode').mockReturnValue(document.createElement('div') as any)

    IS_FOCUSED.set(editor, true)

    handleOnBlur(event, textarea, editor)

    expect(removeAllRanges).toHaveBeenCalled()
    expect(IS_FOCUSED.has(editor)).toBe(false)
  })
})
