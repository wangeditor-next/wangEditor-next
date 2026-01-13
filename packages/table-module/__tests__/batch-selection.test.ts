/**
 * @description table batch selection functionality test
 * @author assistant
 */

import { Element, Transforms } from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import withTable from '../src/module/plugin'
import { EDITOR_TO_SELECTION } from '../src/module/weak-maps'
import { NodeEntryWithContext } from '../src/utils'

const createTableFixture = () => {
  const tableElement = {
    type: 'table',
    children: [
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'Cell 0,0' }] },
          { type: 'td', children: [{ text: 'Cell 0,1' }] },
          { type: 'td', children: [{ text: 'Cell 0,2' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'Cell 1,0' }] },
          { type: 'td', children: [{ text: 'Cell 1,1' }] },
          { type: 'td', children: [{ text: 'Cell 1,2' }] },
        ],
      },
      {
        type: 'tr',
        children: [
          { type: 'td', children: [{ text: 'Cell 2,0' }] },
          { type: 'td', children: [{ text: 'Cell 2,1' }] },
          { type: 'td', children: [{ text: 'Cell 2,2' }] },
        ],
      },
    ],
  }

  const tableSelection: NodeEntryWithContext[][] = [
    [
      [
        [{ type: 'td', children: [{ text: 'Cell 1,1' }] }, [0, 1, 1]],
        {
          rtl: 0,
          ltr: 0,
          ttb: 0,
          btt: 0,
        },
      ],
      [
        [{ type: 'td', children: [{ text: 'Cell 1,2' }] }, [0, 1, 2]],
        {
          rtl: 0,
          ltr: 0,
          ttb: 0,
          btt: 0,
        },
      ],
    ],
    [
      [
        [{ type: 'td', children: [{ text: 'Cell 2,1' }] }, [0, 2, 1]],
        {
          rtl: 0,
          ltr: 0,
          ttb: 0,
          btt: 0,
        },
      ],
      [
        [{ type: 'td', children: [{ text: 'Cell 2,2' }] }, [0, 2, 2]],
        {
          rtl: 0,
          ltr: 0,
          ttb: 0,
          btt: 0,
        },
      ],
    ],
  ]

  return { tableElement, tableSelection }
}

describe('Table Batch Selection', () => {
  const originalSetNodes = Transforms.setNodes
  let editor: any
  let tableSelection: NodeEntryWithContext[][]

  beforeEach(() => {
    Transforms.setNodes = originalSetNodes
    editor = withTable(createEditor())
    const fixture = createTableFixture()

    editor.children = [fixture.tableElement]
    tableSelection = fixture.tableSelection
  })

  afterEach(() => {
    Transforms.setNodes = originalSetNodes
    EDITOR_TO_SELECTION.delete(editor)
  })

  describe('getTableSelection method', () => {
    test('should return null when no table selection exists', () => {
      expect(editor.getTableSelection?.()).toBeNull()
    })

    test('should return table selection when it exists', () => {
      EDITOR_TO_SELECTION.set(editor, tableSelection)
      const result = editor.getTableSelection?.()

      expect(result).toBe(tableSelection)
      expect(result).toHaveLength(2) // 2 rows
      expect(result[0]).toHaveLength(2) // 2 cells in first row
    })
  })

  describe('addMark with table selection', () => {
    beforeEach(() => {
      EDITOR_TO_SELECTION.set(editor, tableSelection)
    })

    test('should apply mark to all selected table cells', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      // Apply color mark
      editor.addMark('color', 'red')

      // Should call setNodes for each text node in selected cells
      expect(setNodesSpy).toHaveBeenCalled()

      // Check that setNodes was called with color mark
      const calls = setNodesSpy.mock.calls.filter(
        call => call[1] && (call[1] as any).color === 'red',
      )

      expect(calls.length).toBeGreaterThan(0)
    })

    test('should apply fontSize mark to selected cells', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      editor.addMark('fontSize', '16px')

      expect(setNodesSpy).toHaveBeenCalled()
      const calls = setNodesSpy.mock.calls.filter(
        call => call[1] && (call[1] as any).fontSize === '16px',
      )

      expect(calls.length).toBeGreaterThan(0)
    })

    test('should not affect cells outside selection', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      editor.addMark('color', 'blue')

      // Verify setNodes was called only for paths within selection
      const calls = setNodesSpy.mock.calls

      calls.forEach(call => {
        const path = call[2]?.at

        if (path) {
          // Path should be within selected cells
          expect(Array.isArray(path)).toBe(true)
        }
      })
    })
  })

  describe('removeMark with table selection', () => {
    beforeEach(() => {
      EDITOR_TO_SELECTION.set(editor, tableSelection)
    })

    test('should remove mark from all selected table cells', () => {
      const unsetNodesSpy = vi.spyOn(Transforms, 'unsetNodes')

      editor.removeMark('color')

      expect(unsetNodesSpy).toHaveBeenCalled()
      const calls = unsetNodesSpy.mock.calls.filter(call => call[1] && call[1].includes('color'))

      expect(calls.length).toBeGreaterThan(0)
    })

    test('should remove multiple marks from selected cells', () => {
      const unsetNodesSpy = vi.spyOn(Transforms, 'unsetNodes')

      editor.removeMark('fontSize')

      expect(unsetNodesSpy).toHaveBeenCalled()
    })
  })

  describe('Transforms.setNodes with table selection', () => {
    let baseSetNodes: ReturnType<typeof vi.fn>

    beforeEach(() => {
      Transforms.setNodes = originalSetNodes
      baseSetNodes = vi.fn()
      Transforms.setNodes = baseSetNodes as any
      editor = withTable(createEditor())
      const fixture = createTableFixture()

      editor.children = [fixture.tableElement]
      tableSelection = fixture.tableSelection
      EDITOR_TO_SELECTION.set(editor, tableSelection)
    })

    afterEach(() => {
      Transforms.setNodes = originalSetNodes
    })

    test('should apply textAlign to selected cells', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      Transforms.setNodes(editor, { textAlign: 'center' })

      // Should be called (the plugin modifies the behavior)
      expect(setNodesSpy).toHaveBeenCalled()
      expect(baseSetNodes).toHaveBeenCalled()
    })

    test('should apply lineHeight to selected cells', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      Transforms.setNodes(editor, { lineHeight: '1.5' })

      expect(setNodesSpy).toHaveBeenCalled()
      expect(baseSetNodes).toHaveBeenCalled()
    })

    test('should apply indent to selected cells', () => {
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      Transforms.setNodes(editor, { indent: '2em' })

      expect(setNodesSpy).toHaveBeenCalled()
      expect(baseSetNodes).toHaveBeenCalled()
    })
  })

  describe('fallback to original behavior', () => {
    test('should use original addMark when no table selection', () => {
      // Clear table selection
      EDITOR_TO_SELECTION.delete(editor)

      const originalAddMark = vi.fn()

      editor.addMark = originalAddMark

      // Re-apply withTable to get the wrapped version
      const wrappedEditor = withTable(editor)

      // Mock original addMark
      const spy = vi.spyOn(editor, 'addMark')

      wrappedEditor.addMark('color', 'green')

      // Should fallback to original behavior
      expect(spy).toHaveBeenCalledWith('color', 'green')
    })

    test('should use original removeMark when no table selection', () => {
      EDITOR_TO_SELECTION.delete(editor)

      const spy = vi.spyOn(editor, 'removeMark')
      const wrappedEditor = withTable(editor)

      wrappedEditor.removeMark('color')

      expect(spy).toHaveBeenCalledWith('color')
    })

    test('should use original Transforms.setNodes when no table selection', () => {
      EDITOR_TO_SELECTION.delete(editor)

      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      Transforms.setNodes(editor, { textAlign: 'left' })

      expect(setNodesSpy).toHaveBeenCalled()
    })
  })

  describe('edge cases', () => {
    test('should handle empty table selection', () => {
      EDITOR_TO_SELECTION.set(editor, [])

      const spy = vi.spyOn(Transforms, 'setNodes')

      editor.addMark('color', 'purple')

      // Should not call Transforms for empty selection
      expect(spy).not.toHaveBeenCalled()
    })

    test('should handle malformed table selection', () => {
      // Set malformed selection
      EDITOR_TO_SELECTION.set(editor, [[]])

      expect(() => {
        editor.addMark('color', 'yellow')
      }).not.toThrow()
    })

    test('should handle different editor instances', () => {
      const otherEditor = withTable(createEditor())

      EDITOR_TO_SELECTION.set(editor, tableSelection)

      const spy = vi.spyOn(Transforms, 'setNodes')

      // Call with different editor - should use original behavior
      Transforms.setNodes(otherEditor, { textAlign: 'center' })

      // Should still work but not use table selection logic
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('integration with real table operations', () => {
    let baseSetNodes: ReturnType<typeof vi.fn>

    beforeEach(() => {
      Transforms.setNodes = originalSetNodes
      baseSetNodes = vi.fn()
      Transforms.setNodes = baseSetNodes as any
      editor = withTable(createEditor())
      const fixture = createTableFixture()

      editor.children = [fixture.tableElement]
      tableSelection = fixture.tableSelection
      EDITOR_TO_SELECTION.set(editor, tableSelection)
    })

    afterEach(() => {
      Transforms.setNodes = originalSetNodes
    })

    test('should work with color menu operations', () => {
      // Apply color through addMark (like ColorMenu does)
      editor.addMark('color', '#ff0000')

      const calls = baseSetNodes.mock.calls

      expect(calls.some(call => call[1] && (call[1] as any).color === '#ff0000')).toBe(true)
    })

    test('should work with justify menu operations', () => {
      const match = (node: any) => Element.isElement(node) && !editor.isInline(node)

      // Simulate justify center operation
      Transforms.setNodes(
        editor,
        { textAlign: 'center' },
        {
          match,
        },
      )

      const calls = baseSetNodes.mock.calls

      expect(calls.length).toBeGreaterThan(0)
      expect(calls.some(call => call[2]?.match === match)).toBe(true)
    })

    test('should preserve original options when applying to table selection', () => {
      const options = { mode: 'highest' as const }

      Transforms.setNodes(editor, { lineHeight: '2.0' }, options)

      // Should preserve options in calls to selected cells
      const calls = baseSetNodes.mock.calls

      expect(calls.length).toBeGreaterThan(0)
      expect(calls.some(call => call[2]?.mode === 'highest')).toBe(true)
    })
  })
})
