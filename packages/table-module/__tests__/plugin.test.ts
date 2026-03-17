/**
 * @description table menu test
 * @author luochao
 */

import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import withTable from '../src/module/plugin'

// Minimal 2-column, 1-row table with one cell containing text
const TABLE_WITH_TEXT = [
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [{ text: 'hello' }] },
          { type: 'table-cell', children: [{ text: 'world' }] },
        ],
      },
    ],
  },
]

// Same table but with empty cells
const TABLE_EMPTY = [
  {
    type: 'table',
    children: [
      {
        type: 'table-row',
        children: [
          { type: 'table-cell', children: [{ text: '' }] },
          { type: 'table-cell', children: [{ text: '' }] },
        ],
      },
    ],
  },
]

describe('TableModule module', () => {
  describe('selectAll escalation', () => {
    it('selectAll on an empty cell immediately selects full document', () => {
      const editor = createEditor({ content: TABLE_EMPTY })

      // Place cursor inside first cell
      slate.Transforms.select(editor, { path: [0, 0, 0, 0], offset: 0 })

      editor.selectAll()

      expect(editor.isSelectedAll()).toBe(true)
    })

    it('first selectAll selects cell content, second selectAll selects full document', () => {
      const editor = createEditor({ content: TABLE_WITH_TEXT })

      // Place cursor at start of first cell
      slate.Transforms.select(editor, { path: [0, 0, 0, 0], offset: 0 })

      // First Ctrl+A: should select full cell content
      editor.selectAll()

      const selAfterFirst = editor.selection!
      const cellStart = slate.Editor.start(editor, [0, 0, 0])
      const cellEnd = slate.Editor.end(editor, [0, 0, 0])

      expect(slate.Point.equals(selAfterFirst.anchor, cellStart)).toBe(true)
      expect(slate.Point.equals(selAfterFirst.focus, cellEnd)).toBe(true)
      expect(editor.isSelectedAll()).toBe(false)

      // Second Ctrl+A: should escalate to full document
      editor.selectAll()

      expect(editor.isSelectedAll()).toBe(true)
    })

    it('Ctrl+A twice then Delete clears a table-only document to empty paragraph', () => {
      const editor = createEditor({ content: TABLE_WITH_TEXT })

      slate.Transforms.select(editor, { path: [0, 0, 0, 0], offset: 0 })
      editor.selectAll() // select cell
      editor.selectAll() // escalate to full doc
      editor.deleteFragment()

      expect(editor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])
      expect(editor.selection).toEqual({
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      })
    })
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
  })
})
