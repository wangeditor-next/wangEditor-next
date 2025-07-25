import {
  DomEditor, IButtonMenu, IDomEditor, t,
} from '@wangeditor-next/core'
import { Editor, Path, Transforms } from 'slate'

import { SPLIT_CELL_SVG } from '../../constants/svg'
import { CellElement, isOfType } from '../../utils'
import { TableCellElement, TableElement } from '../custom-types'
import { isTableWithHeader } from '../helpers'
// import { DEFAULT_WITH_TABLE_OPTIONS } from "../../utils/options";

class SplitCell implements IButtonMenu {
  readonly title = t('tableModule.splitCell')

  readonly iconSvg = SPLIT_CELL_SVG

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
    // 查找当前选中的单元格，支持td和th两种类型
    const [cell] = Editor.nodes(editor, {
      match: n => {
        return DomEditor.checkNodeType(n, 'table-cell')
      },
    })

    if (!cell) {
      return true // 如果没有找到单元格，则禁用拆分功能
    }

    const [{ rowSpan = 1, colSpan = 1 }] = cell as CellElement[]

    // 只有当rowSpan或colSpan大于1时才能拆分
    if (rowSpan > 1 || colSpan > 1) {
      return false
    }

    return true
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    this.split(editor)
  }

  /**
   * Splits either the cell at the current selection or a specified location. If a range
   * selection is present, all cells within the range will be split.
   * @param {Location} [options.at] - Splits the cell at the specified location. If no
   * location is specified it will split the cell at the current selection
   * @param {boolean} [options.all] - If true, splits all cells in the table
   * @returns void
   */
  split(editor: Editor, options: { at?: Location; all?: boolean } = {}): void {
    const [table, td] = Editor.nodes(editor, {
      match: isOfType(editor, 'table', 'th', 'td'),
      // @ts-ignore
      at: options.at,
    })

    if (!table || !td) {
      return
    }

    const [tableNode] = table as [TableElement, Path]
    const hasHeader = isTableWithHeader(tableNode)

    // 获取当前选中的单元格
    const [selectedCell, selectedCellPath] = td as [CellElement, Path]
    const { rowSpan = 1, colSpan = 1 } = selectedCell

    // 如果单元格未合并，无需拆分
    if (rowSpan === 1 && colSpan === 1) {
      return
    }

    Editor.withoutNormalizing(editor, () => {
      // 1. 重置当前单元格的rowSpan和colSpan
      Transforms.setNodes<CellElement>(editor, { rowSpan: 1, colSpan: 1 }, { at: selectedCellPath })

      // 2. 处理同行的其他列（colSpan > 1的情况）
      // 在当前单元格后面插入 colSpan-1 个新单元格
      for (let c = 1; c < colSpan; c += 1) {
        const newCell: TableCellElement = {
          type: 'table-cell',
          children: [{ text: '' }],
        }

        // 如果在第一行且表格有表头，设置isHeader
        const currentRowIndex = selectedCellPath[selectedCellPath.length - 2]

        if (currentRowIndex === 0 && hasHeader) {
          newCell.isHeader = true
        }

        // 在当前行的当前位置之后插入
        const currentRowPath = selectedCellPath.slice(0, -1)
        const insertIndex = selectedCellPath[selectedCellPath.length - 1] + c
        const insertPath = [...currentRowPath, insertIndex]

        try {
          Transforms.insertNodes(editor, newCell, { at: insertPath })
        } catch (error) {
          // 如果指定位置插入失败，在行末尾插入
          try {
            const [currentRow] = Editor.node(editor, currentRowPath)
            const cellsCount = (currentRow as any).children.length
            const fallbackPath = [...currentRowPath, cellsCount]

            Transforms.insertNodes(editor, newCell, { at: fallbackPath })
          } catch (fallbackError) {
            console.warn(`插入同行单元格失败: ${fallbackError instanceof Error ? fallbackError.message : String(fallbackError)}`)
          }
        }
      }

      // 3. 处理其他行（rowSpan > 1的情况）
      // 在下面的每一行都插入相应数量的单元格
      for (let r = 1; r < rowSpan; r += 1) {
        // 计算目标行路径
        const targetRowIndex = selectedCellPath[selectedCellPath.length - 2] + r
        const targetRowPath = [...selectedCellPath.slice(0, -2), targetRowIndex]

        try {
          // 检查目标行是否存在
          const [targetRow] = Editor.node(editor, targetRowPath)

          if (!targetRow) {
            console.warn(`目标行 ${targetRowIndex} 不存在`)
            continue
          }

          // 在目标行中插入colSpan个新单元格
          for (let c = 0; c < colSpan; c += 1) {
            const newCell: TableCellElement = {
              type: 'table-cell',
              children: [{ text: '' }],
            }

            // 计算插入位置
            const originalColumnIndex = selectedCellPath[selectedCellPath.length - 1]
            const insertIndex = originalColumnIndex + c
            const insertPath = [...targetRowPath, insertIndex]

            try {
              // 获取目标行当前的单元格数量
              const currentCellsCount = (targetRow as any).children.length

              // 如果插入位置超出当前行的范围，在行末尾插入
              if (insertIndex >= currentCellsCount) {
                const endPath = [...targetRowPath, currentCellsCount]

                Transforms.insertNodes(editor, newCell, { at: endPath })
              } else {
                Transforms.insertNodes(editor, newCell, { at: insertPath })
              }
            } catch (insertError) {
              // 最后的备用方案：在行末尾插入
              try {
                const updatedCellsCount = (targetRow as any).children.length
                const fallbackPath = [...targetRowPath, updatedCellsCount]

                Transforms.insertNodes(editor, newCell, { at: fallbackPath })
              } catch (finalError) {
                console.warn(`插入单元格到第${r}行失败: ${finalError instanceof Error ? finalError.message : String(finalError)}`)
              }
            }
          }
        } catch (rowError) {
          console.warn(`处理第${r}行时出错: ${rowError instanceof Error ? rowError.message : String(rowError)}`)
        }
      }
    })
  }
}

export default SplitCell
