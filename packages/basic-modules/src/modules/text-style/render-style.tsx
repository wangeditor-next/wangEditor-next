/**
 * @description render text style
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant } from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

import { getTextStyleMode } from '../../utils/style-class'
import { addVnodeClassName, addVnodeStyle } from '../../utils/vdom'
import { StyledText } from './custom-types'
import {
  EMPHASIS_DOT_CLASS,
  EMPHASIS_DOT_STYLE,
  EMPHASIS_DOT_WITH_WAVY_CLASS,
  EMPHASIS_DOT_WITH_WAVY_STYLE,
  UNDERLINE_OFFSET,
  UNDERLINE_OFFSET_CLASS,
  WAVY_UNDERLINE_CLASS,
  WAVY_UNDERLINE_STYLE,
  WAVY_UNDERLINE_WITH_EMPHASIS_CLASS,
  WAVY_UNDERLINE_WITH_EMPHASIS_STYLE,
} from './style-constants'

/**
 * 添加样式
 * @param node slate text
 * @param vnode vnode
 * @returns vnode
 */
export function renderStyle(node: Descendant, vnode: VNode, editor?: IDomEditor): VNode {
  const { bold, italic, underline, wavyUnderline, emphasisDot, code, through, sub, sup } =
    node as StyledText
  let styleVnode: VNode = vnode
  const textStyleMode = getTextStyleMode(editor)

  // color bgColor 在另外的菜单

  if (bold) {
    styleVnode = <strong>{styleVnode}</strong>
  }
  if (code) {
    styleVnode = <code>{styleVnode}</code>
  }
  if (italic) {
    styleVnode = <em>{styleVnode}</em>
  }
  if (underline) {
    if (wavyUnderline || emphasisDot) {
      styleVnode = <u>{styleVnode}</u>
      if (textStyleMode === 'class') {
        addVnodeClassName(styleVnode, UNDERLINE_OFFSET_CLASS)
      } else {
        addVnodeStyle(styleVnode, { textUnderlineOffset: UNDERLINE_OFFSET })
      }
    } else {
      styleVnode = <u>{styleVnode}</u>
    }
  }
  if (wavyUnderline) {
    styleVnode = <span>{styleVnode}</span>
    if (textStyleMode === 'class') {
      addVnodeClassName(styleVnode, WAVY_UNDERLINE_CLASS)
      if (emphasisDot) {
        addVnodeClassName(styleVnode, WAVY_UNDERLINE_WITH_EMPHASIS_CLASS)
      }
    } else {
      addVnodeStyle(
        styleVnode,
        emphasisDot ? WAVY_UNDERLINE_WITH_EMPHASIS_STYLE : WAVY_UNDERLINE_STYLE
      )
    }
  }
  if (emphasisDot) {
    styleVnode = <span>{styleVnode}</span>
    if (textStyleMode === 'class') {
      addVnodeClassName(styleVnode, EMPHASIS_DOT_CLASS)
      if (wavyUnderline) {
        addVnodeClassName(styleVnode, EMPHASIS_DOT_WITH_WAVY_CLASS)
      }
    } else {
      addVnodeStyle(styleVnode, wavyUnderline ? EMPHASIS_DOT_WITH_WAVY_STYLE : EMPHASIS_DOT_STYLE)
    }
  }
  if (through) {
    styleVnode = <s>{styleVnode}</s>
  }
  if (sub) {
    styleVnode = <sub>{styleVnode}</sub>
  }
  if (sup) {
    styleVnode = <sup>{styleVnode}</sup>
  }

  return styleVnode
}
