/**
 * @description render indent style
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'
import { VNode } from 'snabbdom'

import { appendVnodeStyleClassAndData, getTextStyleMode } from '../../utils/style-class'
import { addVnodeStyle } from '../../utils/vdom'
import { IndentElement } from './custom-types'

/**
 * 添加样式
 * @param node slate elem
 * @param vnode vnode
 * @param editor editor
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode, editor?: IDomEditor): VNode {
  if (!Element.isElement(node)) { return vnode }

  const { indent } = node as IndentElement // 如 '2em'
  const styleVnode: VNode = vnode

  if (indent) {
    if (getTextStyleMode(editor) === 'class') {
      appendVnodeStyleClassAndData(styleVnode, 'indent', indent, editor, 'render', {
        textIndent: indent,
      })
    } else {
      addVnodeStyle(styleVnode, { textIndent: indent })
    }
  }

  return styleVnode
}
