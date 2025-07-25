/**
 * @description insert col menu
 * @author wangfupeng
 */

import {
  DomEditor, IButtonMenu, IDomEditor, t,
} from '@wangeditor-next/core'
import {
  Editor, Path, Range, Transforms,
} from 'slate'

import { ADD_COL_SVG } from '../../constants/svg'
import { filledMatrix } from '../../utils'
import { TableCellElement, TableElement } from '../custom-types'
import { isTableWithHeader } from '../helpers'

class InsertCol implements IButtonMenu {
  readonly title = t('tableModule.insertCol')

  readonly iconSvg = ADD_COL_SVG

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

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table')

    if (tableNode == null) {
      // 选区未处于 table cell node ，则禁用
      return true
    }

    // 检查当前单元格的宽度是否小于20px
    try {
      const [cellEntry] = Editor.nodes(editor, {
        match: n => DomEditor.checkNodeType(n, 'table-cell'),
        universal: true,
      })

      if (!cellEntry) {
        return true
      }

      const [, selectedCellPath] = cellEntry
      const matrix = filledMatrix(editor)
      let tdIndex = -1

      // 找到当前单元格在矩阵中的列索引
      for (let x = 0; x < matrix.length; x += 1) {
        for (let y = 0; y < matrix[x].length; y += 1) {
          const [[, path]] = matrix[x][y]

          if (Path.equals(selectedCellPath, path)) {
            tdIndex = y
            break
          }
        }
        if (tdIndex !== -1) { break }
      }

      if (tdIndex === -1) {
        return true
      }

      // 获取表格的列宽信息
      const tableElement = tableNode as TableElement
      const { columnWidths = [] } = tableElement

      // 检查当前列的宽度 - 如果小于20px则禁用插入列功能
      const currentColWidth = columnWidths[tdIndex]

      if (currentColWidth && currentColWidth < 20) {
        return true // 宽度限制：当前列宽度小于20px时禁用插入列功能
      }

    } catch (error) {
      // 如果检查过程中出现错误，为安全起见禁用功能
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

    const rowNode = DomEditor.getParentNode(editor, selectedCellNode)

    if (rowNode == null) { return }
    const tableNode = DomEditor.getParentNode(editor, rowNode) as TableElement

    if (tableNode == null) { return }

    const matrix = filledMatrix(editor)
    let tdIndex = 0

    for (let x = 0; x < matrix.length; x += 1) {
      for (let y = 0; y < matrix[x].length; y += 1) {
        const [[, path]] = matrix[x][y]

        if (Path.equals(selectedCellPath, path)) {
          tdIndex = y
          break
        }
      }
    }

    Editor.withoutNormalizing(editor, () => {
      // 记录已处理的合并单元格和需要跳过插入的行
      const processedMergedCells = new Set<string>()
      const skipInsertForRows = new Set<number>()

      // 遍历每一行的第 tdIndex 列，处理合并单元格
      for (let x = 0; x < matrix.length; x += 1) {
        // 安全检查：确保行和列都存在
        if (!matrix[x] || !matrix[x][tdIndex]) {
          continue
        }

        const [[,], {
          rtl, ltr, ttb, btt,
        }] = matrix[x][tdIndex]

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
            const newColSpan = colSpan + 1

            // 更新真实单元格的 colSpan
            if (!realCellElement.hidden) {
              Transforms.setNodes<TableCellElement>(
                editor,
                {
                  colSpan: newColSpan,
                },
                { at: realCellPath },
              )
            }

            // 标记所有被这个合并单元格影响的行，这些行不需要插入新的单元格
            // 从真实单元格的行开始，标记rowSpan行
            for (let r = 0; r < rowSpan; r += 1) {
              skipInsertForRows.add(realCellRow + r)
            }
          } else {
            // 如果已经处理过这个合并单元格，当前行也不需要插入新单元格
            skipInsertForRows.add(x)
          }
        }
      }

      // 遍历所有行，为需要插入的行添加新单元格
      for (let x = 0; x < matrix.length; x += 1) {
        // 如果这一行被合并单元格覆盖，则不插入新单元格
        if (skipInsertForRows.has(x)) {
          continue
        }

        // 安全检查：确保矩阵位置存在
        if (!matrix[x] || !matrix[x][tdIndex]) {
          continue
        }

        const newCell: TableCellElement = {
          type: 'table-cell',
          children: [{ text: '' }],
        }

        // 如果是第一行且表格有标题，设置为标题单元格
        if (x === 0 && isTableWithHeader(tableNode)) {
          newCell.isHeader = true
        }

        const [[, insertPath]] = matrix[x][tdIndex]

        Transforms.insertNodes(editor, newCell, { at: insertPath })
      }

      // 调整 columnWidths
      const [tableEntry] = Editor.nodes(editor, {
        match: n => DomEditor.checkNodeType(n, 'table'),
        universal: true,
      })

      if (tableEntry) {
        const [elemNode, tablePath] = tableEntry
        const { columnWidths = [] } = elemNode as TableElement
        const adjustColumnWidths = [...columnWidths]

        // 获取当前列的宽度，如果没有设置则使用默认宽度
        const { minWidth = 60 } = editor.getMenuConfig('insertTable')
        const currentColWidth = columnWidths[tdIndex] || parseInt(minWidth, 10) || 60

        // 将当前列宽度一分为二
        const halfWidth = Math.floor(currentColWidth / 2)
        const remainingWidth = currentColWidth - halfWidth

        // 在当前位置插入新列（左侧），使用一半宽度
        adjustColumnWidths.splice(tdIndex, 0, halfWidth)
        // 更新原列宽度为剩余的一半
        adjustColumnWidths[tdIndex + 1] = remainingWidth

        Transforms.setNodes(editor, { columnWidths: adjustColumnWidths } as TableElement, {
          at: tablePath,
        })
      }
    })
  }
}

export default InsertCol
