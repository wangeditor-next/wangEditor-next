/**
 * @description render font-size font-family style
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant } from 'slate'
import { VNode } from 'snabbdom'

import { genStyleClassName, getStyleDatasetKey, getTextStyleMode } from '../../utils/style-class'
import { addVnodeClassName, addVnodeDataset, addVnodeStyle } from '../../utils/vdom'
import { FontSizeAndFamilyText } from './custom-types'

/**
 * 添加样式
 * @param node slate elem
 * @param vnode vnode
 * @param editor editor
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode, editor?: IDomEditor): VNode {
  const { fontSize, fontFamily } = node as FontSizeAndFamilyText
  const styleVnode: VNode = vnode
  const textStyleMode = getTextStyleMode(editor)

  if (textStyleMode === 'class') {
    if (fontSize) {
      addVnodeClassName(styleVnode, genStyleClassName('fontSize', fontSize))
      addVnodeDataset(styleVnode, { [getStyleDatasetKey('fontSize')]: fontSize })
    }
    if (fontFamily) {
      addVnodeClassName(styleVnode, genStyleClassName('fontFamily', fontFamily))
      addVnodeDataset(styleVnode, { [getStyleDatasetKey('fontFamily')]: fontFamily })
    }
  } else {
    if (fontSize) {
      addVnodeStyle(styleVnode, { fontSize })
    }
    if (fontFamily) {
      addVnodeStyle(styleVnode, { fontFamily })
    }
  }

  return styleVnode
}
