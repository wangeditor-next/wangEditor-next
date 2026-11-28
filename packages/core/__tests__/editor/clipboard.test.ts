import {
  ClipboardFragmentEvents,
  IClipboardFragmentContext,
  writeClipboardFragment,
} from '../../src/editor/clipboard'

type Listener = (context: IClipboardFragmentContext) => void

function createEditor(setFragmentData: (data: any) => unknown = () => undefined) {
  const listeners = new Map<string, Listener[]>()
  const emitted: string[] = []
  const editor = {
    setFragmentData,
    on: (type: string, listener: Listener) => {
      const current = listeners.get(type) || []

      current.push(listener)
      listeners.set(type, current)
    },
    emit: (type: string, context: IClipboardFragmentContext) => {
      emitted.push(type)
      const current = listeners.get(type) || []

      current.forEach(listener => listener(context))
    },
  } as any

  return { editor, emitted, listeners }
}

function createData() {
  const values = new Map<string, string>()

  return {
    get types() { return Array.from(values.keys()) },
    getData: (type: string) => values.get(type) || '',
    setData: (type: string, value: string) => { values.set(type, value) },
  }
}

describe('writeClipboardFragment', () => {
  it('preserves undefined and other legacy writer results', () => {
    const data = createData()
    const { editor } = createEditor(() => undefined)

    expect(writeClipboardFragment(editor, data, 'copy').cancel).toBe(false)

    const truthy = createEditor(() => ({ ok: true }))

    expect(writeClipboardFragment(truthy.editor, createData(), 'cut').cancel).toBe(false)
  })

  it('treats a strict false writer result as cancellation for Cut', () => {
    const { editor } = createEditor(() => false)

    expect(writeClipboardFragment(editor, createData(), 'cut').cancel).toBe(true)
  })

  it('keeps an ordinary Copy alive for a legacy false writer result', () => {
    const { editor } = createEditor(() => false)

    expect(writeClipboardFragment(editor, createData(), 'copy').cancel).toBe(false)
  })

  it('cancels a Copy that an internal participant took ownership of', () => {
    const { editor } = createEditor(() => false)

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => { context.handled = true })

    expect(writeClipboardFragment(editor, createData(), 'copy').cancel).toBe(true)
  })

  it('calls the writer with the editor as this', () => {
    const data = createData()
    const receivers: unknown[] = []
    const editor: any = {
      setFragmentData(this: unknown) { receivers.push(this) },
    }

    writeClipboardFragment(editor, data, 'copy')

    expect(receivers).toEqual([editor])
  })

  it('passes the same native transfer through the whole writer chain', () => {
    const data = createData()
    const received: any[] = []
    const { editor } = createEditor(transfer => { received.push(transfer) })

    writeClipboardFragment(editor, data, 'copy')

    expect(received).toEqual([data])
  })

  it('rethrows a writer error when no participant handles the transfer', () => {
    const { editor } = createEditor(() => { throw new Error('legacy writer failed') })

    expect(() => writeClipboardFragment(editor, createData(), 'copy')).toThrow('legacy writer failed')
  })

  it('lets a participant opt in and turn a writer error into cancellation', () => {
    const { editor } = createEditor(() => { throw new Error('writer failed') })

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => { context.handled = true })

    const result = writeClipboardFragment(editor, createData(), 'cut')

    expect(result.cancel).toBe(true)
    expect(result.error).toBeInstanceOf(Error)
  })

  it('skips the writer chain but still runs the registered completion', () => {
    const setFragmentData = vi.fn()
    const complete = vi.fn()
    const { editor } = createEditor(setFragmentData)

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.handled = true
      context.skipWrite = true
      context.setCompletion(complete)
    })

    const result = writeClipboardFragment(editor, createData(), 'cut')

    expect(setFragmentData).not.toHaveBeenCalled()
    expect(complete).toHaveBeenCalledTimes(1)
    expect(result.cancel).toBe(false)
  })

  it('lets the registered completion cancel the transfer', () => {
    const complete = vi.fn()
    const { editor } = createEditor()

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.handled = true
      context.setCompletion(() => {
        complete()
        context.cancel = true
      })
    })

    expect(writeClipboardFragment(editor, createData(), 'cut').cancel).toBe(true)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('runs completion after the writer and emits nothing afterwards', () => {
    const calls: string[] = []
    const { editor, emitted } = createEditor(() => { calls.push('writer') })

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      calls.push('before')
      context.handled = true
      context.setCompletion(() => {
        calls.push('complete')
        expect(emitted).toEqual([ClipboardFragmentEvents.BEFORE_WRITE])
      })
    })

    writeClipboardFragment(editor, createData(), 'copy')

    expect(calls).toEqual(['before', 'writer', 'complete'])
  })

  it('keeps only the first registered completion', () => {
    const calls: string[] = []
    const { editor } = createEditor()

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.handled = true
      context.setCompletion(() => { calls.push('first') })
    })
    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.setCompletion(() => { calls.push('second') })
    })

    writeClipboardFragment(editor, createData(), 'cut')

    expect(calls).toEqual(['first'])
  })

  it('reports whether a completion registration was accepted', () => {
    const accepted: boolean[] = []
    const { editor } = createEditor()

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.handled = true
      accepted.push(context.setCompletion(() => undefined))
      accepted.push(context.setCompletion(() => undefined))
    })

    writeClipboardFragment(editor, createData(), 'copy')

    expect(accepted).toEqual([true, false])
  })

  it('runs completion when the writer throws for a handled transfer', () => {
    const complete = vi.fn()
    const { editor } = createEditor(() => { throw new Error('writer failed') })

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.handled = true
      context.setCompletion(complete)
    })

    const result = writeClipboardFragment(editor, createData(), 'cut')

    expect(result.cancel).toBe(true)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('cancels and skips the writer when a later before listener throws, but still completes', () => {
    const setFragmentData = vi.fn()
    const complete = vi.fn()
    const { editor } = createEditor(setFragmentData)

    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, context => {
      context.handled = true
      context.setCompletion(complete)
    })
    editor.on(ClipboardFragmentEvents.BEFORE_WRITE, () => { throw new Error('later failed') })

    const result = writeClipboardFragment(editor, createData(), 'cut')

    expect(setFragmentData).not.toHaveBeenCalled()
    expect(result.cancel).toBe(true)
    expect(result.skipWrite).toBe(true)
    expect(result.error).toBeInstanceOf(Error)
    expect(complete).toHaveBeenCalledTimes(1)
  })

  it('works when an editor has no emitter methods', () => {
    const data = createData()
    const editor = { setFragmentData: vi.fn() } as any

    expect(writeClipboardFragment(editor, data, 'copy').cancel).toBe(false)
    expect(editor.setFragmentData).toHaveBeenCalledWith(data)
  })
})
