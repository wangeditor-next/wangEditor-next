/**
 * @description 添加文本相关的样式
 * @author wangfupeng
 */

import { Element as SlateElement } from 'slate'
import { VNode } from 'snabbdom'

import { IDomEditor } from '../../editor/interface'
import { RENDER_STYLE_HANDLER_LIST } from '../index'

/**
 * 渲染样式
 * @param elem slate elem node
 * @param vnode elem Vnode
 * @param editor editor
 */
function renderStyle(elem: SlateElement, vnode: VNode, editor?: IDomEditor): VNode {
  let newVnode = vnode

  RENDER_STYLE_HANDLER_LIST.forEach(styleHandler => {
    newVnode = styleHandler(elem, newVnode, editor)
  })

  return newVnode
}

export default renderStyle
