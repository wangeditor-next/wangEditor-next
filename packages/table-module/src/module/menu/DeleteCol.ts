/**
 * @description del col menu
 * @author wangfupeng
 */

import {
  DomEditor, IButtonMenu, IDomEditor, t,
} from '@wangeditor-next/core'
import {
  Editor, Path, Range, Transforms,
} from 'slate'

import { DEL_COL_SVG } from '../../constants/svg'
import { filledMatrix } from '../../utils'
import { TableCellElement, TableElement } from '../custom-types'

class DeleteCol implements IButtonMenu {
  readonly title = t('tableModule.deleteCol')

  readonly iconSvg = DEL_COL_SVG

  readonly tag = 'button'

  getValue(_editor: IDomEditor): string | boolean {
    // 无需获取 val
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor

    if (selection == null) { return true }
    if (!Range.isCollapsed(selection)) { return true }

    const cellNode = DomEditor.getSelectedNodeByType(editor, 'table-cell')

    if (cellNode == null) {
      // 选区未处于 table cell node ，则禁用
      return true
    }
    return false
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    const [cellEntry] = Editor.nodes(editor, {
      match: n => DomEditor.checkNodeType(n, 'table-cell'),
      universal: true,
    })
    const [selectedCellNode, selectedCellPath] = cellEntry

    // 如果只有一列，则删除整个表格
    const rowNode = DomEditor.getParentNode(editor, selectedCellNode)
    const colLength = rowNode?.children.length || 0

    if (!rowNode || colLength <= 1) {
      Transforms.removeNodes(editor, { mode: 'highest' }) // 删除整个表格
      return
    }

    // ------------------------- 不只有 1 列，则继续 -------------------------

    const tableNode = DomEditor.getParentNode(editor, rowNode)

    if (tableNode == null) { return }

    const matrix = filledMatrix(editor)
    let tdIndex = 0

    // eslint-disable-next-line no-labels
    out: for (let x = 0; x < matrix.length; x += 1) {
      for (let y = 0; y < matrix[x].length; y += 1) {
        const [[, path]] = matrix[x][y]

        if (Path.equals(selectedCellPath, path)) {
          tdIndex = y
          // eslint-disable-next-line no-labels
          break out
        }
      }
    }

    Editor.withoutNormalizing(editor, () => {
      // 记录需要删除的单元格路径和已处理的合并单元格
      const cellsToDelete = new Set<string>()
      const processedMergedCells = new Set<string>()

      // 遍历每一行的第 tdIndex 列
      for (let x = 0; x < matrix.length; x += 1) {
        if (!matrix[x] || !matrix[x][tdIndex]) {
          continue
        }

        const [[, cellPath], {
          rtl, ltr, ttb, btt,
        }] = matrix[x][tdIndex]
        const cellPathKey = cellPath.join(',')

        // 判断是否是合并单元格
        if (rtl > 1 || ltr > 1 || ttb > 1 || btt > 1) {
          // 这是合并单元格的一部分
          // 找到真实单元格的位置（左上角的位置）
          // rtl表示从右到左的距离，所以真实单元格列 = 当前列 - (rtl - 1)
          // ttb表示从上到下的距离，所以真实单元格行 = 当前行 - (ttb - 1)
          const realCellRow = x - (ttb - 1)
          const realCellCol = tdIndex - (rtl - 1)

          // 安全检查：确保真实单元格位置存在
          if (realCellRow < 0 || realCellRow >= matrix.length
              || !matrix[realCellRow] || !matrix[realCellRow][realCellCol]) {
            continue
          }

          const [[realCellElement, realCellPath]] = matrix[realCellRow][realCellCol]
          const realCellPathKey = realCellPath.join(',')

          // 避免重复处理同一个合并单元格
          if (!processedMergedCells.has(realCellPathKey)) {
            processedMergedCells.add(realCellPathKey)

            const { rowSpan = 1, colSpan = 1 } = realCellElement
            const newColSpan = Math.max(colSpan - 1, 1)

            // 更新真实单元格的 colSpan
            Transforms.setNodes<TableCellElement>(
              editor,
              {
                rowSpan,
                colSpan: newColSpan,
              },
              { at: realCellPath },
            )
          }
        } else {
          // rtl = 1 且 ltr = 1 且 ttb = 1 且 btt = 1，说明这是独立的单元格，直接删除
          cellsToDelete.add(cellPathKey)
        }
      }

      // 删除独立的单元格
      const cellsToDeleteArray = Array.from(cellsToDelete)

      // 按路径深度降序排序，确保从深层到浅层删除，避免路径失效
      cellsToDeleteArray.sort((a, b) => {
        const pathA = a.split(',').map(Number)
        const pathB = b.split(',').map(Number)

        // 按行降序排序
        if (pathA[pathA.length - 2] !== pathB[pathB.length - 2]) {
          return pathB[pathB.length - 2] - pathA[pathA.length - 2]
        }

        // 同行内按列降序排序
        return pathB[pathB.length - 1] - pathA[pathA.length - 1]
      })

      for (const pathKey of cellsToDeleteArray) {
        const path = pathKey.split(',').map(Number)

        try {
          if (Editor.hasPath(editor, path)) {
            Transforms.removeNodes(editor, { at: path })
          }
        } catch (error) {
          console.warn('删除单元格失败:', path, error)
        }
      }

      // 调整表格的 columnWidths
      const [tableEntry] = Editor.nodes(editor, {
        match: n => DomEditor.checkNodeType(n, 'table'),
        universal: true,
      })

      if (tableEntry) {
        const [elemNode, tablePath] = tableEntry
        const { columnWidths = [] } = elemNode as TableElement
        const adjustColumnWidths = [...columnWidths]

        // 删除对应列的宽度
        adjustColumnWidths.splice(tdIndex, 1)

        Transforms.setNodes(editor, { columnWidths: adjustColumnWidths } as TableElement, {
          at: tablePath,
        })
      }
    })
  }
}

export default DeleteCol
