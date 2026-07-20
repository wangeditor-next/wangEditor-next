import {
  BaseElement, Editor, Element, Operation, Path, Range,
} from 'slate'

import {
  Edge, filledMatrix, hasCommon, NodeEntryWithContext, Point,
} from '../utils'
import { TableCursor } from './table-cursor'
import {
  EDITOR_TO_SELECTION,
  EDITOR_TO_SELECTION_EDGES,
  EDITOR_TO_SELECTION_SET,
} from './weak-maps'

export function withSelection<T extends Editor>(editor: T) {
  const { apply } = editor

  editor.apply = (op: Operation): void => {
    if (!Operation.isSelectionOperation(op) || !op.newProperties) {
      // TableCursor.unselect(editor);
      // 仿飞书效果，拖动单元格宽度时，选区不消失
      return apply(op)
    }

    const selection = {
      ...editor.selection,
      ...op.newProperties,
    }

    if (!Range.isRange(selection)) {
      TableCursor.unselect(editor)
      return apply(op)
    }

    const isTableCell = (n: unknown) => {
      return Element.isElement(n)
    && (n.type === 'table-cell'
     || n.type === 'th'
     || n.type === 'td')
    }

    const [fromEntry] = Editor.nodes(editor, {
      match: isTableCell,
      at: Range.start(selection),
      mode: 'lowest', // 确保找到最低层的匹配节点
    })

    const [toEntry] = Editor.nodes(editor, {
      match: isTableCell,
      at: Range.end(selection),
      mode: 'lowest', // 确保找到最低层的匹配节点
    })

    if (!fromEntry || !toEntry) {
      TableCursor.unselect(editor)
      return apply(op)
    }

    const [, fromPath] = fromEntry
    const [, toPath] = toEntry

    if (Path.equals(fromPath, toPath) || !hasCommon(editor, [fromPath, toPath], 'table')) {
      TableCursor.unselect(editor)
      return apply(op)
    }

    // TODO: perf: could be improved by passing a Span [fromPath, toPath]
    try {
      const filled = filledMatrix(editor, { at: fromPath })

      // 基本的有效性检查
      if (!filled || filled.length === 0) {
        TableCursor.unselect(editor)
        return apply(op)
      }

      // find initial bounds
      const from = Point.valueOf(0, 0)
      const to = Point.valueOf(0, 0)
      let fromFound = false
      let toFound = false

      for (let x = 0; x < filled.length; x += 1) {
        if (!filled[x]) { continue } // 跳过空行

        for (let y = 0; y < filled[x].length; y += 1) {
          if (!filled[x][y]) { continue } // 跳过空单元格

          const [[, path]] = filled[x][y]

          if (Path.equals(fromPath, path)) {
            from.x = x
            from.y = y
            fromFound = true
          }

          if (Path.equals(toPath, path)) {
            to.x = x
            to.y = y
            toFound = true
          }
        }
      }

      // 如果找不到位置，可能是选择了被删除的单元格区域
      if (!fromFound || !toFound) {
        TableCursor.unselect(editor)
        return apply(op)
      }

      let start = Point.valueOf(Math.min(from.x, to.x), Math.min(from.y, to.y))
      let end = Point.valueOf(Math.max(from.x, to.x), Math.max(from.y, to.y))

      // expand the selection based on rowspan and colspan
      for (;;) {
        const nextStart = Point.valueOf(start.x, start.y)
        const nextEnd = Point.valueOf(end.x, end.y)

        for (let x = nextStart.x; x <= nextEnd.x && x < filled.length; x += 1) {
          if (!filled[x]) { continue }

          for (let y = nextStart.y; y <= nextEnd.y && y < filled[x].length; y += 1) {
            if (!filled[x][y]) { continue }

            const [, context] = filled[x][y]

            if (!context) { continue }

            const {
              rtl, ltr, btt, ttb,
            } = context

            nextStart.x = Math.min(nextStart.x, x - (ttb - 1))
            nextStart.y = Math.min(nextStart.y, y - (rtl - 1))

            nextEnd.x = Math.max(nextEnd.x, x + (btt - 1))
            nextEnd.y = Math.max(nextEnd.y, y + (ltr - 1))
          }
        }

        if (Point.equals(start, nextStart) && Point.equals(end, nextEnd)) {
          break
        }

        start = nextStart
        end = nextEnd
      }

      const selected: NodeEntryWithContext[][] = []
      const selectedSet = new WeakSet<BaseElement>()
      const selectedEdges = new WeakMap<BaseElement, ReadonlySet<Edge>>()

      for (let x = start.x; x <= end.x && x < filled.length; x += 1) {
        if (!filled[x]) { continue }

        const cells: NodeEntryWithContext[] = []

        for (let y = start.y; y <= end.y && y < filled[x].length; y += 1) {
          if (!filled[x][y]) { continue }

          const [[element]] = filled[x][y]

          if (!element) { continue }

          selectedSet.add(element)

          // A merged cell can occupy multiple matrix coordinates. Accumulate only coordinates
          // touching the range perimeter so shared borders inside the selection remain unchanged.
          const edges = new Set<Edge>(selectedEdges.get(element) || [])

          if (x === start.x) { edges.add('top') }
          if (x === end.x) { edges.add('bottom') }
          if (y === start.y) { edges.add('start') }
          if (y === end.y) { edges.add('end') }

          selectedEdges.set(element, edges)
          cells.push(filled[x][y])
        }

        if (cells.length > 0) {
          selected.push(cells)
        }
      }

      EDITOR_TO_SELECTION.set(editor, selected)
      EDITOR_TO_SELECTION_SET.set(editor, selectedSet)
      EDITOR_TO_SELECTION_EDGES.set(editor, selectedEdges)

    } catch (error) {
      TableCursor.unselect(editor)
      return apply(op)
    }

    apply(op)
  }

  return editor
}
