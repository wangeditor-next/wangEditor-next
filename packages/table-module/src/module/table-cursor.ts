import {
  Editor,
  Element,
  Location,
  NodeEntry,
} from 'slate'

import { isOfType } from '../utils'
import { EDITOR_TO_SELECTION, EDITOR_TO_SELECTION_SET } from './weak-maps'

export const TableCursor = {
  /** @returns {boolean} `true` if the selection is inside a table, otherwise `false`. */
  isInTable(editor: Editor, options: { at?: Location } = {}): boolean {
    const [table] = Editor.nodes(editor, {
      match: isOfType(editor, 'table'),
      at: options.at,
    })

    return !!table
  },
  /**
   * Retrieves a matrix representing the selected cells within a table.
   * @returns {NodeEntry<T>[][]} A matrix containing the selected cells.
   */
  * selection(editor: Editor): Generator<NodeEntry[]> {
    const matrix = EDITOR_TO_SELECTION.get(editor)

    for (let x = 0; matrix && x < matrix.length; x += 1) {
      const cells: NodeEntry[] = []

      for (let y = 0; y < matrix[x].length; y += 1) {
        const [entry, { ltr: colSpan, ttb }] = matrix[x][y]

        if (ttb === 1) { cells.push(entry) }

        y += colSpan - 1
      }

      yield cells
    }
  },
  /** Clears the selection from the table */
  unselect(editor: Editor): void {
    // const matrix = EDITOR_TO_SELECTION.get(editor);

    // if (!matrix?.length) {
    //   return;
    // }

    // for (let x = 0; x < matrix.length; x+=1) {
    //   for (let y = 0; y < matrix[x].length; y+=1) {
    //     const [[, path], { ltr: colSpan, ttb }] = matrix[x][y];
    //     y += colSpan - 1;

    //     if (ttb > 1) {
    //       continue;
    //     }

    //     // no-op since the paths are the same
    //     const noop: Operation = {
    //       type: "move_node",
    //       newPath: path,
    //       path: path,
    //     };
    //     Transforms.transform(editor, noop);
    //   }
    // }

    EDITOR_TO_SELECTION_SET.delete(editor)
    EDITOR_TO_SELECTION.delete(editor)
    // 清除选区
    // document.getSelection()?.removeAllRanges()
  },
  /**
   * Checks whether a given cell is part of the current table selection.
   * @returns {boolean} - Returns true if the cell is selected, otherwise false.
   */
  isSelected<T extends Element>(editor: Editor, element: T): boolean {
    const selectedElements = EDITOR_TO_SELECTION_SET.get(editor)

    if (!selectedElements) {
      return false
    }

    return selectedElements.has(element)
  },

  hasSelected(editor: Editor) {
    return EDITOR_TO_SELECTION.has(editor)
  },
}
