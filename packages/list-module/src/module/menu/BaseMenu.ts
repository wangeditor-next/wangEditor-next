/**
 * @description list menu base class
 * @author wangfupeng
 */

import { IButtonMenu, IDomEditor } from '@wangeditor-next/core'
import { Editor, Element, Node, Path, Transforms } from 'slate'

import { HeadingType, ListItemElement, OrderedListType } from '../custom-types'
import {
  getHeadingType,
  getListIndent,
  getNormalizedOrderedListType,
  isHeadingType,
  isListNode,
} from '../helpers'

function getSelectedTopLevelBlocks(editor: IDomEditor): Array<[Element, Path]> {
  if (editor.selection == null) {
    return []
  }

  const entries = Array.from(
    Editor.nodes(editor, {
      at: editor.selection,
      match: node => Element.isElement(node) && Editor.isBlock(editor, node),
      mode: 'lowest',
    })
  ) as Array<[Element, Path]>

  return entries.filter(([node]) => !['table', 'table-row', 'table-cell'].includes(node.type))
}

function isListableBlock(editor: IDomEditor, elem: Element): boolean {
  if (Editor.isVoid(editor, elem)) {
    return false
  }

  return !['pre', 'code', 'table', 'table-row', 'table-cell'].includes(elem.type)
}

function getHeadingLevel(headingType: HeadingType): number {
  return Number.parseInt(headingType.slice('header'.length), 10) - 1
}

function getOriginalHeadingType(node: Element): HeadingType | null {
  if (isListNode(node)) {
    return getHeadingType(node)
  }

  return isHeadingType(node.type) ? node.type : null
}

abstract class BaseMenu implements IButtonMenu {
  readonly type = 'list-item'

  abstract readonly ordered: boolean

  readonly orderType?: OrderedListType

  abstract readonly title: string

  abstract readonly iconSvg: string

  readonly tag = 'button'

  private isTargetListNode(node: Node): boolean {
    if (!isListNode(node) || Boolean(node.ordered) !== this.ordered) {
      return false
    }
    if (!this.ordered) {
      return true
    }

    return getNormalizedOrderedListType(node) === (this.orderType || '1')
  }

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(editor: IDomEditor): boolean {
    const selectedBlocks = getSelectedTopLevelBlocks(editor)

    return selectedBlocks.length > 0 && selectedBlocks.every(([node]) => this.isTargetListNode(node))
  }

  isDisabled(editor: IDomEditor): boolean {
    const selectedBlocks = getSelectedTopLevelBlocks(editor)

    return selectedBlocks.length === 0 || selectedBlocks.some(([node]) => !isListableBlock(editor, node))
  }

  exec(editor: IDomEditor, _value: string | boolean): void {
    const active = this.isActive(editor)
    const selectedBlocks = getSelectedTopLevelBlocks(editor)

    if (selectedBlocks.length === 0) {
      return
    }

    Editor.withoutNormalizing(editor, () => {
      selectedBlocks.forEach(([node, path]) => {
        if (active) {
          const listNode = node as ListItemElement
          const headingType = getHeadingType(listNode)

          Transforms.setNodes(
            editor,
            {
              type: headingType || 'paragraph',
              ordered: undefined,
              level: undefined,
              start: undefined,
              orderType: undefined,
              headingType: undefined,
              listMode: undefined,
              listRestart: undefined,
            } as any,
            { at: path }
          )
          return
        }

        const headingType = getOriginalHeadingType(node)
        const outline = this.ordered && this.orderType == null && headingType != null

        Transforms.setNodes(
          editor,
          {
            type: 'list-item',
            ordered: this.ordered,
            level: outline ? getHeadingLevel(headingType as HeadingType) : getListIndent(node),
            start: undefined,
            orderType: this.ordered ? this.orderType : undefined,
            headingType: outline ? headingType : undefined,
            listMode: outline ? 'outline' : undefined,
            listRestart: undefined,
          } as any,
          { at: path }
        )
      })
    })
  }
}

export default BaseMenu
