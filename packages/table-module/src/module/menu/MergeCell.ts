import { IButtonMenu, IDomEditor, t } from '@wangeditor-next/core'
import {
  Editor, Node, Path, Transforms,
} from 'slate'

import { MERGE_CELL_SVG } from '../../constants/svg'
import {
  CellElement, hasCommon,
} from '../../utils'
import { TableCursor } from '../table-cursor'
import { EDITOR_TO_SELECTION } from '../weak-maps'

class MergeCell implements IButtonMenu {
  readonly title = t('tableModule.mergeCell')

  readonly iconSvg = MERGE_CELL_SVG

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
    return !this.canMerge(editor)
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    this.merge(editor)
    // 释放选区
    TableCursor.unselect(editor)
  }

  /**
   * Checks if the current selection can be merged. Merging is not possible when any of the following conditions are met:
   * - The selection is empty.
   * - The selection is not within the same "thead", "tbody," or "tfoot" section.
   * @returns {boolean} `true` if the selection can be merged, otherwise `false`.
   */
  canMerge(editor: Editor): boolean {
    const matrix = EDITOR_TO_SELECTION.get(editor)

    // cannot merge when selection is empty
    if (!matrix || !matrix.length) {
      return false
    }

    // prettier-ignore
    const [[, lastPath]] = matrix[matrix.length - 1][matrix[matrix.length - 1].length - 1]
    const [[, firstPath]] = matrix[0][0]

    // cannot merge when selection is not in common section
    if (!hasCommon(editor, [firstPath, lastPath], 'table')) {
      return false
    }

    return true
  }

  /**
   * Merges the selected cells in the table.
   * @returns void
   */
  merge(editor: Editor): void {
    if (!this.canMerge(editor)) {
      return
    }

    const selection = EDITOR_TO_SELECTION.get(editor)

    if (!selection || !selection.length) {
      return
    }

    const [[, basePath]] = selection[0][0]
    const [[, lastPath]] = Node.children(editor, basePath, { reverse: true })

    Editor.withoutNormalizing(editor, () => {
      // 收集所有真实的单元格（避免重复计算虚拟位置）
      const realCells = new Map<string, { path: Path; x: number; y: number; element: CellElement }>()
      const cellsToDelete: Path[] = []

      // 计算实际的边界范围（考虑单元格的实际跨度）
      let minRow = Infinity
      let maxRow = -Infinity
      let minCol = Infinity
      let maxCol = -Infinity

      // 第一阶段：收集所有真实单元格并计算其实际占用的范围
      for (let x = 0; x < selection.length; x += 1) {
        for (let y = 0; y < selection[x].length; y += 1) {
          const [[element, path], { ttb }] = selection[x][y]
          const pathKey = path.join(',')

          // 只处理真实单元格（ttb === 1 表示单元格的实际位置，不是虚拟扩展）
          if (ttb === 1 && !realCells.has(pathKey)) {
            realCells.set(pathKey, {
              path, x, y, element,
            })

            // 获取当前单元格的跨度
            const { rowSpan = 1, colSpan = 1 } = element

            // 计算该单元格实际占用的范围
            const cellMinRow = x
            const cellMaxRow = x + rowSpan - 1
            const cellMinCol = y
            const cellMaxCol = y + colSpan - 1

            // 更新整体边界
            minRow = Math.min(minRow, cellMinRow)
            maxRow = Math.max(maxRow, cellMaxRow)
            minCol = Math.min(minCol, cellMinCol)
            maxCol = Math.max(maxCol, cellMaxCol)
          }
        }
      }

      // 计算正确的rowSpan和colSpan（基于实际占用的行列范围）
      const finalRowSpan = maxRow - minRow + 1
      const finalColSpan = maxCol - minCol + 1

      // 第二阶段：确定要删除的单元格
      for (const [, { path }] of realCells) {
        // 跳过基础单元格（第一个单元格作为合并后的目标）
        if (Path.equals(basePath, path)) {
          continue
        }

        cellsToDelete.push(path)
      }

      // 第三阶段：按路径降序排序并删除单元格
      cellsToDelete.sort((a, b) => {
        for (let i = 0; i < Math.min(a.length, b.length); i += 1) {
          if (a[i] !== b[i]) {
            return b[i] - a[i] // 降序
          }
        }
        return b.length - a.length
      })

      // 删除单元格并移动内容
      for (const path of cellsToDelete) {
        try {
          // 检查节点是否仍然存在
          if (!Editor.hasPath(editor, path)) {
            continue
          }

          // 移动单元格内容到基础单元格
          for (const [, childPath] of Node.children(editor, path, { reverse: true })) {
            Transforms.moveNodes(editor, {
              to: Path.next(lastPath),
              at: childPath,
            })
          }

          // 删除单元格
          Transforms.removeNodes(editor, { at: path })
        } catch (error) {
          // 静默处理删除失败的情况
        }
      }

      // 为基础单元格设置正确的rowSpan和colSpan属性
      Transforms.setNodes<CellElement>(editor, { rowSpan: finalRowSpan, colSpan: finalColSpan }, { at: basePath })
    })
  }
}

export default MergeCell
