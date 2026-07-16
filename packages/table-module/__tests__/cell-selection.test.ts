import * as core from '@wangeditor-next/core'
import { IDomEditor } from '@wangeditor-next/core'
import * as slate from 'slate'
import { createEditor, Transforms } from 'slate'

import {
  getCellDragSelectionRange,
  handleCellDragSelectionMouseDown,
  handleCellDragSelectionMouseMove,
} from '../src/module/cell-selection'

function createTableEditor(): IDomEditor {
  const editor = createEditor()

  editor.children = [
    {
      type: 'table',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'first' }] },
            { type: 'table-cell', children: [{ text: 'middle' }] },
            { type: 'table-cell', children: [{ text: 'last' }] },
          ],
        },
      ],
    },
  ]

  const domEditor = editor as IDomEditor

  domEditor.isDisabled = () => false
  return domEditor
}

function createCellMouseEvent(
  type: string,
  target: HTMLElement,
  init: MouseEventInit = {},
): MouseEvent {
  const event = new MouseEvent(type, {
    bubbles: true,
    ...init,
  })

  Object.defineProperty(event, 'target', { value: target })
  return event
}

describe('cell drag selection', () => {
  afterEach(() => {
    window.dispatchEvent(new MouseEvent('mouseup'))
    vi.restoreAllMocks()
  })

  test('creates a forward range that includes both boundary cells', () => {
    const editor = createTableEditor()

    expect(getCellDragSelectionRange(editor, [0, 0, 0], [0, 0, 2])).toEqual({
      anchor: { path: [0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 2, 0], offset: 4 },
    })
  })

  test('preserves the drag direction for a backward range', () => {
    const editor = createTableEditor()

    expect(getCellDragSelectionRange(editor, [0, 0, 2], [0, 0, 0])).toEqual({
      anchor: { path: [0, 0, 2, 0], offset: 4 },
      focus: { path: [0, 0, 0, 0], offset: 0 },
    })
  })

  test('ignores an active drag after setHtml replaces the anchor table', () => {
    const editor = createTableEditor()
    const table = editor.children[0] as slate.Element
    const firstCell = (table.children[0] as slate.Element).children[0] as slate.Element
    const cellElement = document.createElement('td')
    const anchorPathRef = slate.Editor.pathRef(editor, [0, 0, 0])
    const select = vi.fn()

    cellElement.dataset.blockType = 'table-cell'
    editor.select = select
    vi.spyOn(core.DomEditor, 'toSlateNode').mockReturnValue(firstCell)
    vi.spyOn(core.DomEditor, 'findPath').mockReturnValue([0, 0, 0])
    vi.spyOn(slate.Editor, 'pathRef').mockReturnValue(anchorPathRef)

    handleCellDragSelectionMouseDown(
      editor,
      createCellMouseEvent('mousedown', cellElement, { button: 0 }),
    )
    // setHtml removes the old table before inserting the replacement document.
    Transforms.removeNodes(editor, { at: [0] })
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: 'replacement' }] } as slate.Element,
      { at: [0] },
    )

    expect(anchorPathRef.current).toBeNull()

    handleCellDragSelectionMouseMove(
      editor,
      createCellMouseEvent('mousemove', cellElement, { buttons: 1 }),
    )

    expect(select).not.toHaveBeenCalled()
    expect(core.DomEditor.toSlateNode).toHaveBeenCalledTimes(1)
  })

  test('releases the anchor path reference when the drag stops', () => {
    const editor = createTableEditor()
    const table = editor.children[0] as slate.Element
    const firstCell = (table.children[0] as slate.Element).children[0] as slate.Element
    const cellElement = document.createElement('td')
    const anchorPathRef = slate.Editor.pathRef(editor, [0, 0, 0])

    cellElement.dataset.blockType = 'table-cell'
    vi.spyOn(core.DomEditor, 'toSlateNode').mockReturnValue(firstCell)
    vi.spyOn(core.DomEditor, 'findPath').mockReturnValue([0, 0, 0])
    vi.spyOn(slate.Editor, 'pathRef').mockReturnValue(anchorPathRef)

    handleCellDragSelectionMouseDown(
      editor,
      createCellMouseEvent('mousedown', cellElement, { button: 0 }),
    )
    window.dispatchEvent(new MouseEvent('mouseup'))

    expect(anchorPathRef.current).toBeNull()
  })
})
