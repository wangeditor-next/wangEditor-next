/**
 * @description del row menu
 * @author wangfupeng
 */

import {
  DomEditor, IButtonMenu, IDomEditor, t,
} from '@wangeditor-next/core'
import {
  Editor, Path, Range, Transforms,
} from 'slate'

import { DEL_ROW_SVG } from '../../constants/svg'
import { filledMatrix } from '../../utils'
import { TableCellElement } from '../custom-types'

class DeleteRow implements IButtonMenu {
  readonly title = t('tableModule.deleteRow')

  readonly iconSvg = DEL_ROW_SVG

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

    const rowNode = DomEditor.getSelectedNodeByType(editor, 'table-row')

    if (rowNode == null) {
      // 选区未处于 table row node ，则禁用
      return true
    }
    return false
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    const [rowEntry] = Editor.nodes(editor, {
      match: n => DomEditor.checkNodeType(n, 'table-row'),
      universal: true,
    })
    const [rowNode, rowPath] = rowEntry

    const tableNode = DomEditor.getParentNode(editor, rowNode)
    const rowsLength = tableNode?.children.length || 0

    if (rowsLength <= 1) {
      // row 只有一行，则删掉整个表格
      Transforms.removeNodes(editor, { mode: 'highest' })
      return
    }

    // row > 1 行，则删掉这一行
    const [cellEntry] = Editor.nodes(editor, {
      match: n => DomEditor.checkNodeType(n, 'table-cell'),
      universal: true,
    })
    const [, cellPath] = cellEntry
    const matrix = filledMatrix(editor)
    let trIndex = 0

    // eslint-disable-next-line no-labels
    outer: for (let x = 0; x < matrix.length; x += 1) {
      for (let y = 0; y < matrix[x].length; y += 1) {
        const [[, path]] = matrix[x][y]

        if (!Path.equals(cellPath, path)) {
          continue
        }
        trIndex = x
        // eslint-disable-next-line no-labels
        break outer
      }
    }

    Editor.withoutNormalizing(editor, () => {
      // 收集需要在下一行插入的新单元格信息
      const cellsToInsert: Array<{
        cell: TableCellElement
        columnIndex: number
      }> = []

      for (let y = 0; y < matrix[trIndex].length; y += 1) {
        const [[{ hidden }], { ttb, btt, rtl }] = matrix[trIndex][y]

        // 寻找跨行行为
        if (ttb > 1 || btt > 1) {
          // 找到显示中 rowSpan 节点
          const originalRowIndex = trIndex - (ttb - 1)

          // 安全检查：确保目标行和列都存在
          if (originalRowIndex < 0 || originalRowIndex >= matrix.length || !matrix[originalRowIndex] || !matrix[originalRowIndex][y]) {
            continue
          }

          const [[originalCell, path]] = matrix[originalRowIndex][y]
          const typedOriginalCell = originalCell as TableCellElement
          const { rowSpan = 1, colSpan = 1 } = typedOriginalCell

          if (hidden) {
            // 如果当前选中节点为隐藏节点，则向上寻找处理 rowSpan 逻辑
            Transforms.setNodes<TableCellElement>(
              editor,
              {
                rowSpan: Math.max(rowSpan - 1, 1),
                colSpan,
              },
              { at: path },
            )
          } else if (ttb === 1 && rtl === 1) {
            // 只处理合并单元格的真正位置（左上角）：ttb=1且rtl=1
            // 这样避免重复处理同一个合并单元格
            const hasNextRow = trIndex + 1 < matrix.length

            if (hasNextRow && rowSpan > 1) {
              // 创建新的单元格，继承原单元格的内容和属性
              const newCell: TableCellElement = {
                type: 'table-cell',
                rowSpan: rowSpan - 1, // 新单元格的rowSpan = 原rowSpan - 1
                colSpan, // 保持原来的colSpan
                hidden: false,
                children: typedOriginalCell.children.map(child => ({ ...child })), // 深拷贝继承原单元格的内容
              }

              // 继承原单元格的其他属性
              if (typedOriginalCell.isHeader) { newCell.isHeader = typedOriginalCell.isHeader }
              if (typedOriginalCell.width) { newCell.width = typedOriginalCell.width }
              if (typedOriginalCell.backgroundColor) { newCell.backgroundColor = typedOriginalCell.backgroundColor }
              if (typedOriginalCell.borderWidth) { newCell.borderWidth = typedOriginalCell.borderWidth }
              if (typedOriginalCell.borderStyle) { newCell.borderStyle = typedOriginalCell.borderStyle }
              if (typedOriginalCell.borderColor) { newCell.borderColor = typedOriginalCell.borderColor }
              if (typedOriginalCell.textAlign) { newCell.textAlign = typedOriginalCell.textAlign }

              // 记录需要插入的单元格信息
              cellsToInsert.push({
                cell: newCell,
                columnIndex: y,
              })
            } else {
              // 如果没有下一行，直接减少原始单元格的 rowSpan
              Transforms.setNodes<TableCellElement>(
                editor,
                {
                  rowSpan: Math.max(rowSpan - 1, 1),
                  colSpan,
                },
                { at: path },
              )
            }
          } else {
            // 处理其他跨行单元格的情况：非隐藏且非左上角原始位置
            // 这种情况下也需要减少原始单元格的 rowSpan
            Transforms.setNodes<TableCellElement>(
              editor,
              {
                rowSpan: Math.max(rowSpan - 1, 1),
                colSpan,
              },
              { at: path },
            )
          }
        }
      }

      // 删除当前行
      Transforms.removeNodes(editor, { at: rowPath })

      // 在下一行（现在变成了当前行）的对应位置插入新单元格
      if (cellsToInsert.length > 0) {
        // 删除行后，原来的下一行会移动到rowPath的位置
        const targetRowPath = rowPath

        try {
          // 按列索引排序，从左到右插入
          cellsToInsert.sort((a, b) => a.columnIndex - b.columnIndex)

          for (const { cell, columnIndex } of cellsToInsert) {
            try {
              // 尝试在对应的列位置插入
              const insertPath = [...targetRowPath, columnIndex]

              Transforms.insertNodes(editor, cell, { at: insertPath })
            } catch (error) {
              // 如果插入失败，尝试在行末尾插入
              try {
                const [targetRow] = Editor.node(editor, targetRowPath)
                const cellCount = (targetRow as any).children.length
                const endPath = [...targetRowPath, cellCount]

                Transforms.insertNodes(editor, cell, { at: endPath })
              } catch (fallbackError) {
                console.warn('插入新单元格失败:', fallbackError)
              }
            }
          }
        } catch (error) {
          console.warn('插入新单元格失败:', error)
        }
      }
    })
  }
}

export default DeleteRow
