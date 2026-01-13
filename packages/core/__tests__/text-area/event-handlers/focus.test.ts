/**
 * @description focus handler test
 */

import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import handleOnFocus from '../../../src/text-area/event-handlers/focus'
import { IS_FOCUSED } from '../../../src/utils/weak-maps'

vi.mock('../../../src/utils/ua', () => ({
  IS_FIREFOX: true,
}))

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnFocus', () => {
  it('forces focus to editor element in Firefox', () => {
    const editor = {} as any
    const textarea = {} as any
    const target = document.createElement('span')
    const event = { target } as any
    const focus = vi.fn()
    const el = { focus } as any
    const root = { activeElement: document.createElement('div') } as any

    vi.spyOn(DomEditor, 'toDOMNode').mockReturnValue(el)
    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root)

    handleOnFocus(event, textarea, editor)

    expect(textarea.latestElement).toBe(root.activeElement)
    expect(focus).toHaveBeenCalled()
    expect(IS_FOCUSED.has(editor)).toBe(false)
  })
})
