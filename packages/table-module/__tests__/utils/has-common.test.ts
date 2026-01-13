/**
 * @description has common test
 */

import * as core from '@wangeditor-next/core'
import * as slate from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { hasCommon } from '../../src/utils/has-common'

function setEditorSelection(
  editor: core.IDomEditor,
  selection: slate.Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}

describe('hasCommon', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
    setEditorSelection(editor)
  })

  it('should return true if paths have a common ancestor of type table', () => {
    const path1 = [1, 0, 0]
    const path2 = [1, 0, 1]

    const elem = {
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
    }

    editor.insertNode(elem) // 插入 divider
    const result = hasCommon(editor, [path1, path2], 'tr')

    expect(result).toBe(true)
  })

  it('should return false if paths do not have a common ancestor of type table', () => {
    const path1 = [0]
    const path2 = [1, 0, 1]
    const result = hasCommon(editor, [path1, path2], 'table')

    expect(result).toBe(false)
  })
})
