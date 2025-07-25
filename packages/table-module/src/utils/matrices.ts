import { Editor, Location, NodeEntry } from 'slate'

import { isOfType } from './is-of-type'
import { CellElement, NodeEntryWithContext } from './types'

/** Generates a matrix for each table section (`thead`, `tbody`, `tfoot`) */
export function* matrices(
  editor: Editor,
  options: { at?: Location } = {},
): Generator<NodeEntry<CellElement>[][]> {
  const [table] = Editor.nodes(editor, {
    match: isOfType(editor, 'table'),
    at: options.at,
  })

  if (!table) {
    return []
  }

  const [, tablePath] = table

  for (const [, path] of Editor.nodes(editor, {
    // match: isOfType(editor, "thead", "tbody", "tfoot"),
    match: isOfType(editor, 'table'),
    at: tablePath,
  })) {
    const matrix: NodeEntry<CellElement>[][] = []

    for (const [, trPath] of Editor.nodes(editor, {
      match: isOfType(editor, 'tr'),
      at: path,
    })) {
      matrix.push([
        ...Editor.nodes<CellElement>(editor, {
          match: isOfType(editor, 'th', 'td'),
          at: trPath,
        }),
      ])
    }

    yield matrix
  }
}

export function filledMatrix(
  editor: Editor,
  options: { at?: Location } = {},
): NodeEntryWithContext[][] {
  const filled: NodeEntryWithContext[][] = []

  // Expand each section separately to avoid sections collapsing into each other.
  for (const matrix of matrices(editor, { at: options.at })) {
    const filledSection: NodeEntryWithContext[][] = []

    // 首先，找出最大的列数来确定矩阵的宽度
    let maxCols = 0

    for (let x = 0; x < matrix.length; x += 1) {
      if (matrix[x]) {
        maxCols = Math.max(maxCols, matrix[x].length)
      }
    }

    for (let x = 0; x < matrix.length; x += 1) {
      if (!filledSection[x]) {
        filledSection[x] = []
      }

      if (!matrix[x]) {
        continue
      }

      for (let y = 0; y < matrix[x].length; y += 1) {
        if (!matrix[x][y] || !matrix[x][y][0]) {
          continue
        }

        const [{ rowSpan = 1, colSpan = 1 }] = matrix[x][y]

        // 找到下一个可用的位置
        let startCol = y

        while (filledSection[x] && filledSection[x][startCol]) {
          startCol += 1
        }

        for (let c = 0; c < colSpan; c += 1) {
          for (let r = 0; r < rowSpan; r += 1) {
            const targetX = x + r
            const targetY = startCol + c

            if (!filledSection[targetX]) {
              filledSection[targetX] = []
            }

            if (filledSection[targetX][targetY]) {
              continue
            }

            filledSection[targetX][targetY] = [
              matrix[x][y],
              {
                rtl: c + 1,
                ltr: colSpan - c,
                ttb: r + 1,
                btt: rowSpan - r,
              },
            ]
          }
        }
      }
    }

    filled.push(...filledSection)
  }

  return filled
}
