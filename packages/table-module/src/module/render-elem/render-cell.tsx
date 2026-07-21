/**
 * @description render cell
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Element as SlateElement } from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

import { TableCellElement } from '../custom-types'
import { isCellInFirstRow } from '../helpers'
import { TableCursor } from '../table-cursor'

function renderTableCell(
  cellNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor,
): VNode {
  const isFirstRow = isCellInFirstRow(editor, cellNode as TableCellElement)
  const {
    colSpan = 1,
    rowSpan = 1,
    isHeader = false,
    hidden = false,
  } = cellNode as TableCellElement
  const selected = TableCursor.isSelected(editor, cellNode)

  // ------------------ 不是第一行，直接渲染 <td> ------------------
  if (!isFirstRow) {
    return (
      <td
        colSpan={colSpan}
        rowSpan={rowSpan}
        /**
         * 1. 添加一个方便寻址的 block-type
         * 2. 选区颜色
         * 3. 合并单元格时，判断隐藏
         */
        data-block-type="table-cell"
        className={selected ? 'w-e-selected' : ''}
        style={{ display: hidden ? 'none' : '' }}
      >
        {children}
      </td>
    )
  }

  // ------------------ 是第一行：1. 判断 th ；2. 拖拽列宽 ------------------
  const Tag = isHeader ? 'th' : 'td'

  const vnode = (
    <Tag
      colSpan={colSpan}
      rowSpan={rowSpan}
      /**
       * 1. 添加一个方便寻址的 block-type
       * 2. 选区颜色
       * 3. 合并单元格时，判断隐藏
       */
      data-block-type="table-cell"
      className={selected ? 'w-e-selected' : ''}
      style={{ display: hidden ? 'none' : '' }}
    >
      {children}
    </Tag>
  )

  return vnode
}

export default renderTableCell
