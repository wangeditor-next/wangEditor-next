/**
 * @description table menu test
 * @author luochao
 */

import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import withTable from '../src/module/plugin'
import { EDITOR_TO_SELECTION } from '../src/module/weak-maps'

describe('TableModule module', () => {
  const originalSetNodes = slate.Transforms.setNodes

  afterEach(() => {
    (slate.Transforms as any).setNodes = originalSetNodes
    vi.restoreAllMocks()
  })

  describe('module plugin', () => {
    test('use withTable plugin when break line not split node', () => {
      const editor = createEditor()
      const newEditor = withTable(editor)

      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue({
        type: 'table',
        children: [{ text: '' }],
      } as slate.Element)

      const mockFn = vi.fn()

      newEditor.insertText = mockFn

      newEditor.insertBreak()

      expect(mockFn).toBeCalledWith('\n\r')
    })

    test('use withTable plugin when insertData should insertText to cell', () => {
      const editor = createEditor()
      const newEditor = withTable(editor)

      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue({
        type: 'table',
        children: [{ text: '' }],
      } as slate.Element)

      const mockFn = vi.fn()

      slate.Editor.insertText = mockFn

      newEditor.insertData({ getData: () => 'test' } as unknown as DataTransfer)

      expect(mockFn).toBeCalled()
    })

    test('use withTable plugin when insertData should invoke original insertData if selection not in table node', () => {
      const editor = createEditor()
      const mockInsertDataFn = vi.fn()

      editor.insertData = mockInsertDataFn

      const newEditor = withTable(editor)

      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue(null)

      newEditor.insertData({} as DataTransfer)

      expect(mockInsertDataFn).toBeCalled()
    })

    test('use withTable plugin when insertData should keep original insertData for newline and image html', () => {
      const editor = createEditor()
      const mockInsertDataFn = vi.fn()

      editor.insertData = mockInsertDataFn

      const newEditor = withTable(editor)

      vi.spyOn(core.DomEditor, 'getSelectedNodeByType').mockReturnValue({
        type: 'table',
        children: [{ text: '' }],
      } as slate.Element)

      newEditor.insertData({
        getData: (type: string) => {
          if (type === 'text/plain') { return '\n' }
          if (type === 'text/html') { return '<img src="x.png">' }
          return ''
        },
      } as unknown as DataTransfer)

      expect(mockInsertDataFn).toHaveBeenCalled()
    })

    test('use withTable plugin when selectAll should select only the current cell content', () => {
      const editor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [
                  {
                    type: 'table-cell',
                    children: [{ text: 'hello' }],
                  },
                ],
              },
            ],
            columnWidths: [100],
          },
        ],
      })
      const newEditor = withTable(editor)
      const originalSelectAll = vi.fn()

      newEditor.selectAll = originalSelectAll as any
      const wrappedEditor = withTable(newEditor)

      wrappedEditor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 1 },
        focus: { path: [0, 0, 0, 0], offset: 1 },
      }

      const selectSpy = vi.spyOn(wrappedEditor, 'select').mockImplementation(() => {})

      wrappedEditor.selectAll()

      expect(selectSpy).toHaveBeenCalledWith({
        anchor: slate.Editor.start(wrappedEditor, [0, 0, 0]),
        focus: slate.Editor.end(wrappedEditor, [0, 0, 0]),
      })
      expect(originalSelectAll).not.toHaveBeenCalled()
    })

    test('use withTable plugin when addMark and removeMark should apply to every selected table cell', () => {
      const editor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [
                  { type: 'table-cell', children: [{ text: 'A' }] },
                  { type: 'table-cell', children: [{ text: 'B' }] },
                ],
              },
            ],
            columnWidths: [100, 100],
          },
        ],
      })
      const wrappedEditor = withTable(editor)
      const addMarkSpy = vi.fn()
      const removeMarkSpy = vi.fn()
      const selectSpy = vi.spyOn(slate.Transforms, 'select').mockImplementation(() => {})

      wrappedEditor.addMark = addMarkSpy as any
      wrappedEditor.removeMark = removeMarkSpy as any
      wrappedEditor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 1, 0], offset: 1 },
      }

      const enhancedEditor = withTable(wrappedEditor)
      const selection = [[
        [
          [slate.Node.get(enhancedEditor, [0, 0, 0]) as any, [0, 0, 0]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 1,
          },
        ],
        [
          [slate.Node.get(enhancedEditor, [0, 0, 1]) as any, [0, 0, 1]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 1,
          },
        ],
      ]] as any

      EDITOR_TO_SELECTION.set(enhancedEditor, selection)

      enhancedEditor.addMark('bold', true)
      enhancedEditor.removeMark('bold')

      expect(addMarkSpy).toHaveBeenCalledTimes(2)
      expect(removeMarkSpy).toHaveBeenCalledTimes(2)
      expect(selectSpy).toHaveBeenCalled()
    })

    test('use withTable plugin when deleteBackward and deleteForward should keep protected nodes around tables', () => {
      const backwardEditor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'A' }] }],
              },
            ],
            columnWidths: [100],
          },
          { type: 'paragraph', children: [{ text: 'tail' }] },
        ],
      })
      const originalBackward = vi.fn()

      backwardEditor.deleteBackward = originalBackward as any
      backwardEditor.selection = {
        anchor: { path: [1, 0], offset: 0 },
        focus: { path: [1, 0], offset: 0 },
      }

      const wrappedBackward = withTable(backwardEditor)

      wrappedBackward.deleteBackward('character')
      expect(originalBackward).not.toHaveBeenCalled()

      const forwardEditor = createEditor({
        content: [
          { type: 'paragraph', children: [{ text: 'head' }] },
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'A' }] }],
              },
            ],
            columnWidths: [100],
          },
        ],
      })
      const originalForward = vi.fn()

      forwardEditor.deleteForward = originalForward as any
      forwardEditor.selection = {
        anchor: { path: [0, 0], offset: 4 },
        focus: { path: [0, 0], offset: 4 },
      }

      const wrappedForward = withTable(forwardEditor)

      wrappedForward.deleteForward('character')
      expect(originalForward).not.toHaveBeenCalled()
    })

    test('use withTable plugin when handleTab should move to next cell or append a paragraph after the table', () => {
      const editor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [
                  { type: 'table-cell', children: [{ text: 'A' }] },
                  { type: 'table-cell', children: [{ text: 'B' }] },
                ],
              },
            ],
            columnWidths: [100, 100],
          },
        ],
      })
      const wrappedEditor = withTable(editor)
      const selectSpy = vi.spyOn(slate.Transforms, 'select')

      wrappedEditor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 0 },
        focus: { path: [0, 0, 0, 0], offset: 0 },
      }
      wrappedEditor.handleTab()

      expect(selectSpy).toHaveBeenCalledWith(wrappedEditor, [0, 0, 1])

      wrappedEditor.selection = {
        anchor: { path: [0, 0, 1, 0], offset: 0 },
        focus: { path: [0, 0, 1, 0], offset: 0 },
      }
      wrappedEditor.handleTab()

      expect(wrappedEditor.children[1]).toMatchObject({
        type: 'paragraph',
      })
    })

    test('use withTable plugin when deleteFragment should expand half-break selections inside a cell', () => {
      const editor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [
                  { type: 'table-cell', children: [{ text: 'a\n\rb' }] },
                ],
              },
            ],
            columnWidths: [100],
          },
        ],
      })
      const originalDeleteFragment = vi.fn()

      editor.deleteFragment = originalDeleteFragment as any
      const wrappedEditor = withTable(editor)
      const setSelectionSpy = vi.spyOn(slate.Transforms, 'setSelection')

      wrappedEditor.selection = {
        anchor: { path: [0, 0, 0, 0], offset: 2 },
        focus: { path: [0, 0, 0, 0], offset: 2 },
      }

      wrappedEditor.deleteFragment('character')

      expect(setSelectionSpy).toHaveBeenCalled()
      expect(originalDeleteFragment).toHaveBeenCalledWith('character')
    })

    test('use withTable plugin when normalizeNode should append a trailing paragraph after the last table', () => {
      const editor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [{ type: 'table-cell', children: [{ text: 'A' }] }],
              },
            ],
            columnWidths: [100],
          },
        ],
      })
      const wrappedEditor = withTable(editor)
      const insertNodesSpy = vi.spyOn(slate.Transforms, 'insertNodes')

      wrappedEditor.normalizeNode([wrappedEditor.children[0] as any, [0]])

      expect(insertNodesSpy).toHaveBeenCalledWith(
        wrappedEditor,
        expect.objectContaining({ type: 'paragraph' }),
        { at: [1] },
      )
    })

    test('use withTable plugin when setNodes should fan out table selection updates and bypass merged-cell props', () => {
      const editor = createEditor({
        content: [
          {
            type: 'table',
            width: 'auto',
            children: [
              {
                type: 'table-row',
                children: [
                  { type: 'table-cell', children: [{ text: 'A' }] },
                  { type: 'table-cell', children: [{ text: 'B' }] },
                ],
              },
            ],
            columnWidths: [100, 100],
          },
        ],
      })
      const originalSetNodesSpy = vi.fn();

      (slate.Transforms as any).setNodes = originalSetNodesSpy

      const wrappedEditor = withTable(editor)
      const tableSelection = [[
        [
          [slate.Node.get(wrappedEditor, [0, 0, 0]) as any, [0, 0, 0]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 1,
          },
        ],
        [
          [slate.Node.get(wrappedEditor, [0, 0, 1]) as any, [0, 0, 1]],
          {
            rtl: 1, ltr: 1, ttb: 1, btt: 1,
          },
        ],
      ]] as any

      EDITOR_TO_SELECTION.set(wrappedEditor, tableSelection)

      slate.Transforms.setNodes(wrappedEditor, { textAlign: 'center' } as any)
      expect(originalSetNodesSpy).toHaveBeenNthCalledWith(
        1,
        wrappedEditor,
        { textAlign: 'center' },
        { at: [0, 0, 0] },
      )
      expect(originalSetNodesSpy).toHaveBeenNthCalledWith(
        2,
        wrappedEditor,
        { textAlign: 'center' },
        { at: [0, 0, 1] },
      )

      originalSetNodesSpy.mockClear()
      slate.Transforms.setNodes(wrappedEditor, { hidden: true } as any)

      expect(originalSetNodesSpy).toHaveBeenCalledTimes(1)
      expect(originalSetNodesSpy).toHaveBeenCalledWith(wrappedEditor, { hidden: true }, {})
    })
  })
})
