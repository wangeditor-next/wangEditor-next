/**
 * @description text 样式
 * @author wangfupeng
 */

import { Text as SlateText } from 'slate'
import { VNode } from 'snabbdom'

import { IDomEditor } from '../../editor/interface'
import { RENDER_STYLE_HANDLER_LIST } from '../index'

/**
 * 给字符串增加样式
 * @param leafNode slate text leaf node
 * @param textVnode textVnode
 * @param editor editor
 */
function addTextVnodeStyle(leafNode: SlateText, textVnode: VNode, editor?: IDomEditor): VNode {
  let newTextVnode = textVnode

  RENDER_STYLE_HANDLER_LIST.forEach(styleHandler => {
    newTextVnode = styleHandler(leafNode, newTextVnode, editor)
  })

  return newTextVnode
}

export default addTextVnodeStyle
