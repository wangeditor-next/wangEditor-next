/**
 * @description TextArea test
 */

import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import flushPromises from '../../../../tests/utils/flush-promises'
import { EditorEvents } from '../../src/config/interface'
import { DomEditor } from '../../src/editor/dom-editor'
import * as syncSelection from '../../src/text-area/syncSelection'
import TextArea from '../../src/text-area/TextArea'
import { TEXTAREA_TO_EDITOR } from '../../src/utils/weak-maps'

afterEach(() => {
  document.body.innerHTML = ''
  vi.restoreAllMocks()
})

describe('TextArea', () => {
  it('binds selectionchange to the editor root', async () => {
    document.body.innerHTML = '<div id="box"></div>'
    const root = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any
    const editor = {
      on: vi.fn(),
      getConfig: () => ({ scroll: true }),
      hidePanelOrModal: vi.fn(),
      selection: null,
    } as any

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root)

    const textarea = new TextArea('#box')

    TEXTAREA_TO_EDITOR.set(textarea, editor)
    await flushPromises()

    const selectionChangeHandler = root.addEventListener.mock.calls[0][1]
    const destroyedHandler = editor.on.mock.calls.find(
      ([eventType]) => eventType === EditorEvents.DESTROYED,
    )?.[1]

    expect(root.addEventListener).toHaveBeenCalledWith(
      'selectionchange',
      expect.any(Function),
    )
    expect(destroyedHandler).toEqual(expect.any(Function))

    destroyedHandler()

    expect(root.removeEventListener).toHaveBeenCalledWith(
      'selectionchange',
      selectionChangeHandler,
    )
  })

  it('ignores selectionchange events originating from input and textarea', async () => {
    document.body.innerHTML = '<div id="box"></div>'
    const root = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any
    const editor = {
      on: vi.fn(),
      getConfig: () => ({ scroll: true }),
      hidePanelOrModal: vi.fn(),
      selection: null,
    } as any

    vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue(root)
    const syncSpy = vi.spyOn(syncSelection, 'DOMSelectionToEditor').mockImplementation(() => {})

    const textarea = new TextArea('#box')

    TEXTAREA_TO_EDITOR.set(textarea, editor)
    await flushPromises()

    const selectionChangeHandler = root.addEventListener.mock.calls[0][1]
    const input = document.createElement('input')
    const textareaElem = document.createElement('textarea')
    const div = document.createElement('div')

    selectionChangeHandler({ target: input })
    selectionChangeHandler({ target: textareaElem })
    selectionChangeHandler.flush()

    expect(syncSpy).not.toHaveBeenCalled()

    selectionChangeHandler({ target: div })
    selectionChangeHandler.flush()

    expect(syncSpy).toHaveBeenCalledTimes(1)
  })
})
