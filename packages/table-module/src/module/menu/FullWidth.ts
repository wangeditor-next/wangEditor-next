/**
 * @description table full width menu
 * @author wangfupeng
 */

import {
  DomEditor, IButtonMenu, IDomEditor, t,
} from '@wangeditor-next/core'
import { Range, Transforms } from 'slate'

import { FULL_WIDTH_SVG } from '../../constants/svg'
import { TableElement } from '../custom-types'

class TableFullWidth implements IButtonMenu {
  readonly title = t('tableModule.widthAuto')

  readonly iconSvg = FULL_WIDTH_SVG

  readonly tag = 'button'

  getValue(_editor: IDomEditor): string | boolean {
    // 每次点击都执行调整，不需要状态判断
    return false
  }

  isActive(_editor: IDomEditor): boolean {
    // 每次点击都执行调整，不需要状态判断
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    const { selection } = editor

    if (selection == null) { return true }
    if (!Range.isCollapsed(selection)) { return true }

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table')

    if (tableNode == null) {
      // 选区未处于 table node ，则禁用
      return true
    }
    return false
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table') as TableElement

    if (!tableNode) { return }

    const { columnWidths = [] } = tableNode

    // 获取当前选中的表格的DOM元素,再查找table-container容器元素，防止文档多表格时，获取到其他表格的容器元素
    const tableDom = DomEditor.toDOMNode(editor, tableNode)
    const containerElement = tableDom.querySelector('.table-container')

    if (!containerElement || columnWidths.length === 0) {
      // 如果找不到容器或没有列宽信息，则使用原来的逻辑，先使用auto预留以后实现按比例实现缩放功能
      const props: Partial<TableElement> = {
        width: 'auto',
      }

      Transforms.setNodes(editor, props, { mode: 'highest' })
      return
    }

    const containerWidth = containerElement.clientWidth
    const currentTotalWidth = columnWidths.reduce((a, b) => a + b, 0)

    // 计算等比例调整后的列宽
    const adjustedColumnWidths = columnWidths.map(width => {
      const ratio = width / currentTotalWidth

      return Math.floor(ratio * containerWidth)
    })

    // 确保最小宽度限制（每列至少10px）
    const minWidth = 10
    const adjustedWithMinWidth = adjustedColumnWidths.map(width => Math.max(minWidth, width))

    // 如果调整后的总宽度超过容器宽度，按比例缩小
    const adjustedTotalWidth = adjustedWithMinWidth.reduce((a, b) => a + b, 0)

    if (adjustedTotalWidth > containerWidth) {
      const scaleFactor = containerWidth / adjustedTotalWidth
      const finalColumnWidths = adjustedWithMinWidth.map(width => Math.max(minWidth, Math.floor(width * scaleFactor)))

      // 应用新的列宽和宽度设置
      const props: Partial<TableElement> = {
        width: 'auto',
        columnWidths: finalColumnWidths,
      }

      Transforms.setNodes(editor, props, { mode: 'highest' })
    } else {
      // 如果调整后的总宽度小于容器宽度，将剩余宽度加到最后一列
      const finalColumnWidths = [...adjustedWithMinWidth]
      const remainingWidth = containerWidth - adjustedTotalWidth - 1

      if (remainingWidth > 0 && finalColumnWidths.length > 0) {
        // 将剩余宽度加到最后一列
        finalColumnWidths[finalColumnWidths.length - 1] += remainingWidth
      }

      // 应用新的列宽和宽度设置
      const props: Partial<TableElement> = {
        width: 'auto',
        columnWidths: finalColumnWidths,
      }

      Transforms.setNodes(editor, props, { mode: 'highest' })
    }
  }
}

export default TableFullWidth
