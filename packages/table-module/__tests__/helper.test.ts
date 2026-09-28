import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import flushPromises from '../../../tests/utils/flush-promises'
import { TableElement } from '../src/module/custom-types'
import { isCellInFirstRow, setTableNodeProps } from '../src/module/helpers'

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}

describe('isCellInFirstRow', () => {
  const content = [
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
    {
      type: 'table',
      width: 'auto',
      children: [
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [
                {
                  text: '',
                },
              ],
              isHeader: true,
            },
            {
              type: 'table-cell',
              children: [
                {
                  text: '',
                },
              ],
              isHeader: true,
            },
          ],
        },
        {
          type: 'table-row',
          children: [
            {
              type: 'table-cell',
              children: [
                {
                  text: '',
                },
              ],
            },
            {
              type: 'table-cell',
              children: [
                {
                  text: '',
                },
              ],
            },
          ],
        },
      ],
      columnWidths: [
        60,
        60,
      ],
      scrollWidth: 120,
      height: 62,
    },
    {
      type: 'paragraph',
      children: [
        {
          text: '',
        },
      ],
    },
  ]

  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor({ content })
    setEditorSelection(editor)
  })

  it('accepts legacy nullable resize flags and unsets them through Slate', async () => {
    setTableNodeProps(editor, editor.children[1] as TableElement, {
      isResizing: true,
      isResizingRow: true,
    })
    expect((editor.children[1] as TableElement).isResizing).toBe(true)
    await flushPromises()
    setTableNodeProps(editor, editor.children[1] as TableElement, {
      isResizing: null,
      isResizingRow: null,
    })
    expect(editor.children[1]).not.toHaveProperty('isResizing')
    expect(editor.children[1]).not.toHaveProperty('isResizingRow')
  })

  it('should correctly identify cells in the first row', () => {
    const result = isCellInFirstRow(editor, (editor.children[1] as TableElement).children[0].children[0])

    expect(result).toBe(true)
    // Test cell in second row
    const secondRowCell = (editor.children[1] as TableElement).children[1].children[0]

    expect(isCellInFirstRow(editor, secondRowCell)).toBe(false)

    // Test non-cell element
    const nonCellElement = editor.children[0]

    expect(isCellInFirstRow(editor, nonCellElement as any)).toBe(false)
  })
})
