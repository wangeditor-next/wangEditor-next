import { Element, Node, Transforms } from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import { handleCellBorderMouseDown } from '../src/module/column-resize'
import { handleRowBorderMouseDown } from '../src/module/row-resize'

function captureMeasurements() {
  let callback: ResizeObserverCallback

  vi.stubGlobal('ResizeObserver', class {
    constructor(cb: ResizeObserverCallback) { callback = cb }
    observe() {}
    disconnect() {}
  })
  return (height: number) => callback(
    [{ contentRect: { width: 90, height } } as ResizeObserverEntry],
    {} as ResizeObserver,
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('automatic table measurements and user history', () => {
  it.each(['typing', 'plain paste', 'block HTML paste'])('keeps %s as one undoable edit', async input => {
    const measure = captureMeasurements()
    const editor = createEditor({ html: '<table><tr><td>ABC</td></tr></table>' })
    const path = [0, 0, 0, 0, 0]
    const range = { anchor: { path, offset: 1 }, focus: { path, offset: 2 } }

    editor.select(range)
    measure(61)
    await Promise.resolve()
    editor.clearHistory!()
    if (input === 'typing') {
      editor.insertText('long')
    } else {
      editor.insertData({
        files: [],
        getData: (mime: string) => {
          if (mime === 'text/plain') { return 'long' }
          return input === 'block HTML paste' && mime === 'text/html' ? '<p>long</p>' : ''
        },
      } as unknown as DataTransfer)
    }
    await Promise.resolve()
    measure(85)
    expect(editor.history.undos).toHaveLength(1)
    expect(Node.string(editor.children[0])).toBe('AlongC')
    expect(editor.children[0]).toMatchObject({ height: 85, scrollWidth: 90, rowHeights: [1] })
    const html = editor.getHtml()

    editor.undo!()
    expect(Node.string(editor.children[0])).toBe('ABC')
    expect(editor.selection).toEqual(range)
    await Promise.resolve()
    measure(61)
    expect(editor.history.undos).toHaveLength(0)
    expect(editor.history.redos).toHaveLength(1)
    editor.redo!()
    expect(Node.string(editor.children[0])).toBe('AlongC')
    expect(Node.has(editor, editor.selection!.focus.path)).toBe(true)
    expect(createEditor({ html }).children[0]).toMatchObject({ height: 85 })
  })

  it.each([
    {
      axis: 'column', position: 'clientX', state: { resizingIndex: 0 }, start: handleCellBorderMouseDown,
      path: [0], before: { columnWidths: [90] }, after: { columnWidths: [140] },
    },
    {
      axis: 'row', position: 'clientY', state: { resizingRowIndex: 0 }, start: handleRowBorderMouseDown,
      path: [0, 0], before: { height: 90 }, after: { height: 140 },
    },
  ])('preserves manual $axis dragging in undo, redo and exported dimensions', async scenario => {
    const measure = captureMeasurements()
    const editor = createEditor({ html: '<table><tr height="90"><td>A</td></tr></table>' })

    Transforms.setNodes(editor, scenario.state, { at: [0] })
    await Promise.resolve()
    editor.clearHistory!()
    scenario.start(editor, editor.children[0] as Element)
    const handle = document.createElement('div')

    handle.className = `${scenario.axis}-resizer-item`
    document.body.appendChild(handle)
    try {
      handle.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, [scenario.position]: 90 }))
      window.dispatchEvent(new MouseEvent('mousemove', { [scenario.position]: 140 }))
      window.dispatchEvent(new MouseEvent('mouseup'))
    } finally {
      handle.remove()
    }
    await Promise.resolve()
    measure(140)
    expect(Node.get(editor, scenario.path)).toMatchObject(scenario.after)
    expect(editor.history.undos).toHaveLength(1)
    editor.undo!()
    expect(Node.get(editor, scenario.path)).toMatchObject(scenario.before)
    await Promise.resolve()
    measure(90)
    editor.redo!()
    expect(Node.get(editor, scenario.path)).toMatchObject(scenario.after)
    const reloaded = createEditor({ html: editor.getHtml() })

    expect(Node.get(reloaded, scenario.path)).toMatchObject(scenario.after)
  })
})
