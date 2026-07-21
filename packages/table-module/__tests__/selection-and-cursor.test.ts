import {
  Editor, Operation,
} from 'slate'

import { TableCursor } from '../src/module/table-cursor'
import {
  EDITOR_TO_SELECTION,
  EDITOR_TO_SELECTION_SET,
} from '../src/module/weak-maps'
import { withSelection } from '../src/module/with-selection'
import * as utils from '../src/utils'

function createGenerator(entries) {
  return (function* () {
    for (const entry of entries) {
      yield entry
    }
  }())
}

describe('table cursor and selection helpers', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('TableCursor.selection yields only visible cells in the stored matrix', () => {
    const editor = {} as Editor
    const cellA = { type: 'table-cell', children: [{ text: 'A' }] } as any
    const cellB = { type: 'table-cell', children: [{ text: 'B' }] } as any
    const cellC = { type: 'table-cell', children: [{ text: 'C' }] } as any

    EDITOR_TO_SELECTION.set(editor, [
      [
        [[cellA, [0, 0, 0]], {
          rtl: 1, ltr: 2, ttb: 1, btt: 1,
        }],
        [[cellA, [0, 0, 0]], {
          rtl: 2, ltr: 1, ttb: 1, btt: 1,
        }],
        [[cellB, [0, 0, 1]], {
          rtl: 1, ltr: 1, ttb: 1, btt: 1,
        }],
      ],
      [
        [[cellA, [0, 0, 0]], {
          rtl: 1, ltr: 2, ttb: 2, btt: 1,
        }],
        [[cellA, [0, 0, 0]], {
          rtl: 2, ltr: 1, ttb: 2, btt: 1,
        }],
        [[cellC, [0, 1, 1]], {
          rtl: 1, ltr: 1, ttb: 1, btt: 1,
        }],
      ],
    ] as any)

    const rows = [...TableCursor.selection(editor)]

    expect(rows[0]).toHaveLength(2)
    expect(rows[1]).toHaveLength(1)
    expect(rows[0][0][0]).toBe(cellA)
    expect(rows[0][1][0]).toBe(cellB)
    expect(rows[1][0][0]).toBe(cellC)
  })

  test('TableCursor selection flags are cleared by unselect', () => {
    const editor = {} as Editor
    const cell = { type: 'table-cell', children: [{ text: 'A' }] } as any
    const selectedSet = new WeakSet<any>([cell])

    EDITOR_TO_SELECTION.set(editor, [] as any)
    EDITOR_TO_SELECTION_SET.set(editor, selectedSet)

    expect(TableCursor.hasSelected(editor)).toBe(true)
    expect(TableCursor.isSelected(editor, cell)).toBe(true)

    TableCursor.unselect(editor)

    expect(TableCursor.hasSelected(editor)).toBe(false)
    expect(TableCursor.isSelected(editor, cell)).toBe(false)
  })

  test('withSelection stores expanded matrix selection for a valid multi-cell selection', () => {
    const apply = vi.fn()
    const editor = withSelection({
      selection: null,
      apply,
    } as unknown as Editor)
    const fromCell = { type: 'table-cell', children: [{ text: 'A' }] } as any
    const toCell = { type: 'table-cell', children: [{ text: 'B' }] } as any
    const op = {
      type: 'set_selection',
      properties: null,
      newProperties: {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 1, 0], offset: 0 },
      },
    } as Operation

    vi.spyOn(Editor, 'nodes').mockImplementation((_editor, options: any) => {
      const at = options?.at

      if (JSON.stringify(at) === JSON.stringify(op.newProperties.anchor)) {
        return createGenerator([[fromCell, [0, 0, 0]]])
      }
      if (JSON.stringify(at) === JSON.stringify(op.newProperties.focus)) {
        return createGenerator([[toCell, [0, 1, 0]]])
      }
      return createGenerator([])
    })
    vi.spyOn(utils, 'hasCommon').mockReturnValue(true)
    vi.spyOn(utils, 'filledMatrix').mockReturnValue([
      [
        [[fromCell, [0, 0, 0]], {
          rtl: 1, ltr: 1, ttb: 1, btt: 1,
        }],
      ],
      [
        [[toCell, [0, 1, 0]], {
          rtl: 1, ltr: 1, ttb: 1, btt: 1,
        }],
      ],
    ] as any)

    editor.apply(op)

    expect(EDITOR_TO_SELECTION.get(editor)).toHaveLength(2)
    expect(EDITOR_TO_SELECTION_SET.get(editor)?.has(fromCell)).toBe(true)
    expect(EDITOR_TO_SELECTION_SET.get(editor)?.has(toCell)).toBe(true)
    expect(apply).toHaveBeenCalledWith(op)
  })

  test('withSelection clears table selection when the range stays in the same cell', () => {
    const apply = vi.fn()
    const editor = withSelection({
      selection: null,
      apply,
    } as unknown as Editor)
    const cell = { type: 'table-cell', children: [{ text: 'A' }] } as any
    const op = {
      type: 'set_selection',
      properties: null,
      newProperties: {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 1 },
      },
    } as Operation

    EDITOR_TO_SELECTION.set(editor, [[]] as any)
    EDITOR_TO_SELECTION_SET.set(editor, new WeakSet([cell]))

    vi.spyOn(Editor, 'nodes').mockImplementation(() => createGenerator([[cell, [0, 0, 0]]]))

    editor.apply(op)

    expect(EDITOR_TO_SELECTION.has(editor)).toBe(false)
    expect(EDITOR_TO_SELECTION_SET.has(editor)).toBe(false)
    expect(apply).toHaveBeenCalledWith(op)
  })
})
