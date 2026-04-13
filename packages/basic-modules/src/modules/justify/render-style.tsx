/**
 * @description render justify style
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'
import { VNode } from 'snabbdom'

import { appendVnodeStyleClassAndData, getTextStyleMode } from '../../utils/style-class'
import { addVnodeStyle } from '../../utils/vdom'
import { JustifyElement } from './custom-types'

/**
 * 添加样式
 * @param node slate elem
 * @param vnode vnode
 * @param editor editor
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode, editor?: IDomEditor): VNode {
  if (!Element.isElement(node)) { return vnode }

  const { textAlign } = node as JustifyElement // 如 'left'/'right'/'center' 等
  const styleVnode: VNode = vnode

  if (textAlign) {
    if (getTextStyleMode(editor) === 'class') {
      appendVnodeStyleClassAndData(styleVnode, 'textAlign', textAlign, editor, 'render', {
        textAlign,
      })
    } else {
      addVnodeStyle(styleVnode, { textAlign })
    }
  }

  return styleVnode
}
