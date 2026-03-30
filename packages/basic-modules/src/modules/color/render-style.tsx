/**
 * @description render color style
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant } from 'slate'
import { VNode } from 'snabbdom'

import { genStyleClassName, getStyleDatasetKey, getTextStyleMode } from '../../utils/style-class'
import { addVnodeClassName, addVnodeDataset, addVnodeStyle } from '../../utils/vdom'
import { ColorText } from './custom-types'

/**
 * 添加样式
 * @param node text node
 * @param vnode vnode
 * @param editor editor
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode, editor?: IDomEditor): VNode {
  const { color, bgColor } = node as ColorText
  const styleVnode: VNode = vnode
  const textStyleMode = getTextStyleMode(editor)

  if (textStyleMode === 'class') {
    if (color) {
      addVnodeClassName(styleVnode, genStyleClassName('color', color))
      addVnodeDataset(styleVnode, { [getStyleDatasetKey('color')]: color })
    }
    if (bgColor) {
      addVnodeClassName(styleVnode, genStyleClassName('bgColor', bgColor))
      addVnodeDataset(styleVnode, { [getStyleDatasetKey('bgColor')]: bgColor })
    }
  } else {
    if (color) {
      addVnodeStyle(styleVnode, { color })
    }
    if (bgColor) {
      addVnodeStyle(styleVnode, { backgroundColor: bgColor })
    }
  }

  return styleVnode
}
