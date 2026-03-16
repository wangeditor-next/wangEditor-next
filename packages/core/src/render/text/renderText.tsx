/**
 * @description render text node
 * @author wangfupeng
 */

import {
  Ancestor, LeafPosition,
  Text as SlateText,
} from 'slate'
import { VNode } from 'snabbdom'

import { DomEditor } from '../../editor/dom-editor'
import { IDomEditor } from '../../editor/interface'
import { getElementById } from '../../utils/dom'
import { promiseResolveThen } from '../../utils/util'
import { ELEMENT_TO_NODE, KEY_TO_ELEMENT, NODE_TO_ELEMENT } from '../../utils/weak-maps'
import { genTextId } from '../helper'
import genTextVnode from './genVnode'
import addTextVnodeStyle from './renderStyle'

function renderText(textNode: SlateText, parent: Ancestor, editor: IDomEditor): VNode {
  if (textNode.text == null) { throw new Error(`Current node is not slate Text ${JSON.stringify(textNode)}`) }
  const key = DomEditor.findKey(editor, textNode)

  // 根据 decorate 将 text 拆分为多个叶子节点 text[]
  const { decorate } = editor.getConfig()

  if (decorate == null) { throw new Error('Can not get config.decorate') }
  const path = DomEditor.findPath(editor, textNode)
  const ds = decorate([textNode, path])
  const leaves = SlateText.decorations(textNode, ds)

  // 生成 leaves vnode
  const leavesVnode = leaves.map(({ leaf, position }: { leaf: SlateText; position?: LeafPosition }) => {
    // 文字和样式
    const isLast = position?.isLast ?? leaves.length === 1
    let strVnode = genTextVnode(leaf, isLast, textNode, parent, editor)

    strVnode = addTextVnodeStyle(leaf, strVnode)
    // 生成每一个 leaf 节点
    return <span data-slate-leaf>{strVnode}</span>
  })

  // 生成 text vnode
  const textId = genTextId(key.id)
  const vnode = (
    <span data-slate-node="text" id={textId} key={key.id}>
      {leavesVnode /* 一个 text 可能包含多个 leaf */}
    </span>
  )

  // 更新 weak-map
  promiseResolveThen(() => {
    // 异步，否则拿不到 DOM
    const dom = getElementById(textId)

    if (dom == null) { return }
    KEY_TO_ELEMENT.set(key, dom)
    NODE_TO_ELEMENT.set(textNode, dom)
    ELEMENT_TO_NODE.set(dom, textNode)
  })

  return vnode
}

export default renderText
