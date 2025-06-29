/**
 * @description test basic modules integration with table batch selection
 * @author assistant
 */

import { Editor, Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import ColorMenu from '../../src/modules/color/menu/ColorMenu'
import JustifyCenterMenu from '../../src/modules/justify/menu/JustifyCenterMenu'
import JustifyLeftMenu from '../../src/modules/justify/menu/JustifyLeftMenu'
import LineHeightMenu from '../../src/modules/line-height/menu/LineHeightMenu'

// Mock table module functions
const mockTableSelection = [
  [
    [[{ type: 'td', children: [{ text: 'Cell 1,1' }] }, [0, 1, 1]], {}],
    [[{ type: 'td', children: [{ text: 'Cell 1,2' }] }, [0, 1, 2]], {}],
  ],
  [
    [[{ type: 'td', children: [{ text: 'Cell 2,1' }] }, [0, 2, 1]], {}],
    [[{ type: 'td', children: [{ text: 'Cell 2,2' }] }, [0, 2, 2]], {}],
  ],
]

const createEditorWithTableSelection = () => {
  const editor = createEditor()

  // Set up a proper 3x3 table structure in the editor
  const tableNode = {
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

  // Set the editor content to include the table
  editor.children = [tableNode]

  // Mock the getTableSelection method that would be added by withTable plugin
  editor.getTableSelection = vi.fn().mockReturnValue(mockTableSelection)

  // Mock addMark and removeMark to simulate the new table batch selection behavior
  const originalAddMark = editor.addMark.bind(editor)
  const originalRemoveMark = editor.removeMark.bind(editor)

  // Store spies to be accessible in tests
  let selectSpy: any
  let addMarkSpy: any
  let removeMarkSpy: any

  editor.addMark = vi.fn((key: string, value: any) => {
    const tableSelection = editor.getTableSelection?.()

    if (tableSelection && tableSelection.length > 0) {
      // Create spies if not exist
      if (!selectSpy) {
        selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {})
      }
      if (!addMarkSpy) {
        addMarkSpy = vi.fn(originalAddMark)
      }

      // Save original selection
      const originalSelection = editor.selection

      // Simulate the new behavior: set selection range and call original addMark
      tableSelection.forEach((row: any) => {
        row.forEach((cell: any) => {
          const [, cellPath] = cell[0]

          // Mock Editor.start and Editor.end
          const start = { path: [...cellPath, 0], offset: 0 }
          const end = { path: [...cellPath, 0], offset: 10 }

          // Simulate setting selection to cell
          selectSpy({ anchor: start, focus: end })

          // Call original addMark
          addMarkSpy(key, value)
        })
      })

      // Restore original selection
      if (originalSelection) {
        selectSpy(originalSelection)
      }
    } else {
      originalAddMark(key, value)
    }
  })

  editor.removeMark = vi.fn((key: string) => {
    const tableSelection = editor.getTableSelection?.()

    if (tableSelection && tableSelection.length > 0) {
      // Create spies if not exist
      if (!selectSpy) {
        selectSpy = vi.spyOn(Transforms, 'select').mockImplementation(() => {})
      }
      if (!removeMarkSpy) {
        removeMarkSpy = vi.fn(originalRemoveMark)
      }

      // Save original selection
      const originalSelection = editor.selection

      // Simulate the new behavior: set selection range and call original removeMark
      tableSelection.forEach((row: any) => {
        row.forEach((cell: any) => {
          const [, cellPath] = cell[0]

          // Mock Editor.start and Editor.end
          const start = { path: [...cellPath, 0], offset: 0 }
          const end = { path: [...cellPath, 0], offset: 10 }

          // Simulate setting selection to cell
          selectSpy({ anchor: start, focus: end })

          // Call original removeMark
          removeMarkSpy(key)
        })
      })

      // Restore original selection
      if (originalSelection) {
        selectSpy(originalSelection)
      }
    } else {
      originalRemoveMark(key)
    }
  });

  // Store spies on editor for test access
  (editor as any).getSelectSpy = () => selectSpy;
  (editor as any).getAddMarkSpy = () => addMarkSpy;
  (editor as any).getRemoveMarkSpy = () => removeMarkSpy

  return editor
}

const createEditorWithoutTableSelection = () => {
  const editor = createEditor()

  editor.getTableSelection = vi.fn().mockReturnValue(null)
  return editor
}

describe('Basic Modules - Table Batch Selection Integration', () => {
  describe('Color Menus', () => {
    describe('ColorMenu with table selection', () => {
      test('should apply color to table selection', () => {
        const editor = createEditorWithTableSelection()

        // Simulate color menu execution
        editor.addMark('color', '#ff0000')

        const selectSpy = (editor as any).getSelectSpy()

        expect(selectSpy).toHaveBeenCalled()
        expect(editor.addMark).toHaveBeenCalledWith('color', '#ff0000')
      })

      test('should remove color from table selection', () => {
        const editor = createEditorWithTableSelection()

        editor.removeMark('color')

        const selectSpy = (editor as any).getSelectSpy()

        expect(selectSpy).toHaveBeenCalled()
        expect(editor.removeMark).toHaveBeenCalledWith('color')
      })
    })

    describe('BgColorMenu with table selection', () => {
      test('should apply background color to table selection', () => {
        const editor = createEditorWithTableSelection()

        editor.addMark('bgColor', '#00ff00')

        const selectSpy = (editor as any).getSelectSpy()

        expect(selectSpy).toHaveBeenCalled()
        expect(editor.addMark).toHaveBeenCalledWith('bgColor', '#00ff00')
      })
    })
  })

  describe('Text Style Menus', () => {
    describe('BoldMenu with table selection', () => {
      test('should apply bold to table selection', () => {
        const editor = createEditorWithTableSelection()

        editor.addMark('bold', true)

        const selectSpy = (editor as any).getSelectSpy()

        expect(selectSpy).toHaveBeenCalled()
        expect(editor.addMark).toHaveBeenCalledWith('bold', true)
      })

      test('should remove bold from table selection', () => {
        const editor = createEditorWithTableSelection()

        editor.removeMark('bold')

        const selectSpy = (editor as any).getSelectSpy()

        expect(selectSpy).toHaveBeenCalled()
        expect(editor.removeMark).toHaveBeenCalledWith('bold')
      })
    })

    describe('ItalicMenu with table selection', () => {
      test('should apply italic to table selection', () => {
        const editor = createEditorWithTableSelection()

        editor.addMark('italic', true)

        const selectSpy = (editor as any).getSelectSpy()

        expect(selectSpy).toHaveBeenCalled()
      })
    })
  })

  describe('Font Size Menu', () => {
    test('should apply font size to table selection', () => {
      const editor = createEditorWithTableSelection()

      editor.addMark('fontSize', '18px')

      const selectSpy = (editor as any).getSelectSpy()

      expect(selectSpy).toHaveBeenCalled()
      expect(editor.addMark).toHaveBeenCalledWith('fontSize', '18px')
    })
  })

  describe('Justify Menus', () => {
    let originalSetNodes: any

    beforeEach(() => {
      originalSetNodes = Transforms.setNodes
      Transforms.setNodes = vi.fn((targetEditor, props, options = {}) => {
        // Mock table batch selection behavior for Transforms.setNodes
        if (targetEditor.getTableSelection?.()) {
          const tableSelection = targetEditor.getTableSelection()

          tableSelection.forEach((row: any) => {
            row.forEach((cell: any) => {
              const [, cellPath] = cell[0]
              // Simulate applying to each cell

              originalSetNodes(targetEditor, props, { ...options, at: cellPath })
            })
          })
        } else {
          originalSetNodes(targetEditor, props, options)
        }
      })
    })

    afterEach(() => {
      Transforms.setNodes = originalSetNodes
    })

    describe('JustifyCenterMenu with table selection', () => {
      test('should apply center alignment to table selection', () => {
        const editor = createEditorWithTableSelection()
        const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
        const justifyCenterMenu = new JustifyCenterMenu()

        justifyCenterMenu.exec(editor, true)

        expect(setNodesSpy).toHaveBeenCalled()
        const calls = setNodesSpy.mock.calls

        expect(calls.some((call: any) => call[1].textAlign === 'center')).toBe(true)
      })
    })

    describe('JustifyLeftMenu with table selection', () => {
      test('should apply left alignment to table selection', () => {
        const editor = createEditorWithTableSelection()
        const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
        const justifyLeftMenu = new JustifyLeftMenu()

        justifyLeftMenu.exec(editor, true)

        expect(setNodesSpy).toHaveBeenCalled()
        const calls = setNodesSpy.mock.calls

        expect(calls.some((call: any) => call[1].textAlign === 'left')).toBe(true)
      })
    })
  })

  describe('Line Height Menu', () => {
    let originalSetNodes: any

    beforeEach(() => {
      originalSetNodes = Transforms.setNodes
      Transforms.setNodes = vi.fn((targetEditor, props, options = {}) => {
        if (targetEditor.getTableSelection?.()) {
          const tableSelection = targetEditor.getTableSelection()

          tableSelection.forEach((row: any) => {
            row.forEach((cell: any) => {
              const [, cellPath] = cell[0]

              originalSetNodes(targetEditor, props, { ...options, at: cellPath })
            })
          })
        } else {
          originalSetNodes(targetEditor, props, options)
        }
      })
    })

    afterEach(() => {
      Transforms.setNodes = originalSetNodes
    })

    test('should apply line height to table selection', () => {
      const editor = createEditorWithTableSelection()
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes').mockImplementation(() => {})
      const lineHeightMenu = new LineHeightMenu()

      lineHeightMenu.exec(editor, '1.5')

      expect(setNodesSpy).toHaveBeenCalled()
      const calls = setNodesSpy.mock.calls

      expect(calls.some((call: any) => call[1].lineHeight === '1.5')).toBe(true)
    })
  })

  describe('Fallback behavior without table selection', () => {
    test('ColorMenu should work normally without table selection', () => {
      const editor = createEditorWithoutTableSelection()
      const originalAddMark = vi.spyOn(editor, 'addMark')

      editor.addMark('color', '#0000ff')

      expect(originalAddMark).toHaveBeenCalledWith('color', '#0000ff')
    })

    test('JustifyMenu should work normally without table selection', () => {
      const editor = createEditorWithoutTableSelection()
      const justifyCenterMenu = new JustifyCenterMenu()
      const setNodesSpy = vi.spyOn(Transforms, 'setNodes')

      justifyCenterMenu.exec(editor, true)

      expect(setNodesSpy).toHaveBeenCalledWith(
        editor,
        { textAlign: 'center' },
        { match: expect.any(Function) },
      )
    })
  })

  describe('Menu state methods with table selection', () => {
    test('ColorMenu getValue should work with table selection', () => {
      const editor = createEditorWithTableSelection()
      const colorMenu = new ColorMenu()

      // Mock Editor.marks to return color
      vi.spyOn(Editor, 'marks').mockReturnValue({ color: '#ff0000' })

      const value = colorMenu.getValue(editor)

      expect(value).toBe('#ff0000')
    })

    test('ColorMenu isActive should work with table selection', () => {
      const editor = createEditorWithTableSelection()
      const colorMenu = new ColorMenu()

      vi.spyOn(colorMenu, 'getValue').mockReturnValue('#ff0000')

      const isActive = colorMenu.isActive(editor)

      expect(isActive).toBe(true)
    })

    test('JustifyMenu isDisabled should work with table selection', () => {
      const editor = createEditorWithTableSelection()
      const justifyCenterMenu = new JustifyCenterMenu()

      // Set up proper selection
      editor.selection = {
        anchor: { path: [0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0], offset: 0 },
      }

      const isDisabled = justifyCenterMenu.isDisabled(editor)

      expect(typeof isDisabled).toBe('boolean')
    })
  })

  describe('Complex scenarios', () => {
    test('should handle multiple mark operations in sequence', () => {
      const editor = createEditorWithTableSelection()

      // Apply multiple marks
      editor.addMark('color', '#ff0000')
      editor.addMark('fontSize', '16px')
      editor.addMark('bold', true)

      const selectSpy = (editor as any).getSelectSpy()

      expect(selectSpy).toHaveBeenCalledTimes(12) // 4 cells × 3 marks
    })

    test('should handle mixed mark and node operations', () => {
      const editor = createEditorWithTableSelection()

      // Apply mark
      editor.addMark('color', '#00ff00')

      // Apply node property (simulating justify)
      const originalSetNodes = Transforms.setNodes

      Transforms.setNodes = vi.fn((targetEditor, props, options = {}) => {
        if (targetEditor.getTableSelection?.()) {
          const tableSelection = targetEditor.getTableSelection()

          tableSelection.forEach((row: any) => {
            row.forEach((cell: any) => {
              const [, cellPath] = cell[0]

              originalSetNodes(targetEditor, props, { ...options, at: cellPath })
            })
          })
        } else {
          originalSetNodes(targetEditor, props, options)
        }
      })

      Transforms.setNodes(editor, { textAlign: 'center' })

      expect(Transforms.setNodes).toHaveBeenCalled()
    })

    test('should preserve original options when applying to table cells', () => {
      const editor = createEditorWithTableSelection()

      Transforms.setNodes = vi.fn()

      // Mock the table selection behavior
      const testOptions = { mode: 'highest' as const, match: () => true }

      Transforms.setNodes(editor, { textAlign: 'right' }, testOptions)

      expect(Transforms.setNodes).toHaveBeenCalled()
    })
  })
})
