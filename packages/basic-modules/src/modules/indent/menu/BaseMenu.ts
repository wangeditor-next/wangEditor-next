/**
 * @description indent base menu
 * @author wangfupeng
 */

import { IButtonMenu, IDomEditor } from '@wangeditor-next/core'
import { Editor, Node } from 'slate'

import { isIndentTargetElement } from '../is-indent-target'

abstract class BaseMenu implements IButtonMenu {
  abstract readonly title: string

  abstract readonly iconSvg: string

  readonly tag = 'button'

  /**
   * 获取 node.indent 的值，如 `2em`
   * @param editor editor
   */
  getValue(editor: IDomEditor): string | boolean {
    const [nodeEntry] = Editor.nodes(editor, {
      // @ts-ignore
      match: n => !!n.indent,
      universal: true,
    })

    if (nodeEntry == null) { return '' }
    const [n] = nodeEntry
    // @ts-ignore

    return n.indent || ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 不需要 active
    return false
  }

  /**
   * 获取 node 节点
   * @param editor editor
   */
  protected getMatchNode(editor: IDomEditor): Node | null {
    const [nodeEntry] = Editor.nodes(editor, {
      match: isIndentTargetElement,
      universal: true,
      mode: 'highest', // 匹配最高层级
    })

    if (nodeEntry == null) { return null }
    return nodeEntry[0]
  }

  abstract isDisabled(editor: IDomEditor): boolean

  abstract exec(editor: IDomEditor, value: string | boolean): void
}

export default BaseMenu
