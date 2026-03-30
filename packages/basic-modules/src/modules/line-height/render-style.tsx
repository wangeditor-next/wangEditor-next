/**
 * @description render line-height style
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'
import { VNode } from 'snabbdom'

import { genStyleClassName, getStyleDatasetKey, getTextStyleMode } from '../../utils/style-class'
import { addVnodeClassName, addVnodeDataset, addVnodeStyle } from '../../utils/vdom'
import { LineHeightElement } from './custom-types'

/**
 * 添加样式
 * @param node slate elem
 * @param vnode vnode
 * @param editor editor
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode, editor?: IDomEditor): VNode {
  if (!Element.isElement(node)) { return vnode }

  const { lineHeight } = node as LineHeightElement // 如 '1' '1.5'
  const styleVnode: VNode = vnode

  if (lineHeight) {
    if (getTextStyleMode(editor) === 'class') {
      addVnodeClassName(styleVnode, genStyleClassName('lineHeight', lineHeight))
      addVnodeDataset(styleVnode, { [getStyleDatasetKey('lineHeight')]: lineHeight })
    } else {
      addVnodeStyle(styleVnode, { lineHeight })
    }
  }

  return styleVnode
}
