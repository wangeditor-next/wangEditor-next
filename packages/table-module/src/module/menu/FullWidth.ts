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

    // 主流编辑器在“适应宽度”语义下使用 100% 响应式模式，而不是一次性重算像素列宽。
    // 列宽数据仍然保留，用于后续拖拽列宽时进行比例/最小宽度计算。
    const props: Partial<TableElement> = {
      width: '100%',
    }

    Transforms.setNodes(editor, props, { mode: 'highest' })
  }
}

export default TableFullWidth
