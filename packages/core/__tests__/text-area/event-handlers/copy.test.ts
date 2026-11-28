/**
 * @description copy handler test
 */

import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { ClipboardFragmentEvents } from '../../../src/editor/clipboard'
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

  it('keeps calling customCopy for a legacy false writer result', () => {
    const clipboardData = { setData: vi.fn() }
    const customCopy = vi.fn()
    const editor = {
      getConfig: () => ({ readOnly: false, customCopy }),
      setFragmentData: vi.fn(() => false),
    } as any
    const event = {
      target: {},
      preventDefault: vi.fn(),
      clipboardData,
    } as any

    vi.spyOn(helpers, 'hasEditableTarget').mockReturnValue(true)

    handleOnCopy(event, {} as any, editor)

    expect(customCopy).toHaveBeenCalledWith(editor, event)
  })

  it('calls customCopy without binding it to the editor', () => {
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

    expect(customCopy).toHaveBeenCalledWith(editor, event)
    expect(customCopy.mock.contexts[0]).toBeUndefined()
  })

  it('skips customCopy when an internal participant rejects the transfer', () => {
    const listeners = new Map<string, Function>()
    const clipboardData = { setData: vi.fn() }
    const customCopy = vi.fn()
    const editor = {
      getConfig: () => ({ readOnly: false, customCopy }),
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

    handleOnCopy(event, {} as any, editor)

    expect(customCopy).not.toHaveBeenCalled()
  })

  it('does not stop native event propagation', () => {
    const clipboardData = { setData: vi.fn() }
    const editor = {
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

    handleOnCopy(event, {} as any, editor)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(event.stopPropagation).not.toHaveBeenCalled()
    expect(event.stopImmediatePropagation).not.toHaveBeenCalled()
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
