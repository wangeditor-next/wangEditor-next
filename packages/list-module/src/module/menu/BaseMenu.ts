/**
 * @description base menu
 * @author wangfupeng
 */

import { DomEditor, IButtonMenu, IDomEditor } from '@wangeditor-next/core'
import {
  Editor, Element, Node, Transforms,
} from 'slate'

import { ListItemElement, OrderedListType } from '../custom-types'
import { getNormalizedOrderedListType } from '../helpers'

abstract class BaseMenu implements IButtonMenu {
  readonly type = 'list-item'

  abstract readonly ordered: boolean

  readonly orderType?: OrderedListType

  abstract readonly title: string

  abstract readonly iconSvg: string

  readonly tag = 'button'

  private getListNode(editor: IDomEditor): Node | null {
    const { type } = this

    return DomEditor.getSelectedNodeByType(editor, type)
  }

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    const node = this.getListNode(editor)

    if (node == null) { return false }
    const listNode = node as ListItemElement
    const { ordered = false } = listNode

    if (ordered !== this.ordered) { return false }
    if (!ordered) { return true }

    const currentOrderType = getNormalizedOrderedListType(listNode)
    const targetOrderType = this.orderType || '1'

    return currentOrderType === targetOrderType
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const selectedElems = DomEditor.getSelectedElems(editor)
    const notMatch = selectedElems.some((elem: Element) => {
      if (Editor.isVoid(editor, elem) && Editor.isBlock(editor, elem)) { return true }

      const { type } = elem as Element

      if (['pre', 'code', 'table'].includes(type)) { return true }
      return false
    })

    if (notMatch) { return true }

    return false
  }

  exec(editor: IDomEditor, _value: string | boolean): void {
    const active = this.isActive(editor)

    if (active) {
      // 如果当前 active ，则转换为 p 标签
      Transforms.setNodes(editor, {
        type: 'paragraph',
        // @ts-ignore
        ordered: undefined,
        level: undefined,
        start: undefined,
        orderType: undefined,
      })
    } else {
      // 否则，转换为 list-item
      Transforms.setNodes(editor, {
        type: 'list-item',
        ordered: this.ordered, // 有序/无序
        indent: undefined,
        start: undefined,
        orderType: this.ordered ? this.orderType : undefined,
      })
    }
  }
}

export default BaseMenu
