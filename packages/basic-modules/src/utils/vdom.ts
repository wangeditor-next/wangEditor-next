/**
 * @description vdom utils fn
 * @author wangfupeng
 */

import { VNode, VNodeStyle } from 'snabbdom'

type VNodeDataset = Record<string, string>

/**
 * 给 vnode 添加样式
 * @param vnode vnode
 * @param newStyle { key: val }
 */
export function addVnodeStyle(vnode: VNode, newStyle: VNodeStyle) {
  if (vnode.data == null) { vnode.data = {} }
  const data = vnode.data

  if (data.style == null) { data.style = {} }

  Object.assign(data.style, newStyle)
}

/**
 * 给 vnode 添加 className
 * @param vnode vnode
 * @param className css class
 */
export function addVnodeClassName(vnode: VNode, className: string) {
  if (vnode.data == null) { vnode.data = {} }
  const data = vnode.data

  if (data.props == null) { data.props = {} }
  const prevClassName = String(data.props.className || '').trim()
  const classNames = prevClassName ? prevClassName.split(/\s+/) : []

  if (!classNames.includes(className)) {
    classNames.push(className)
  }
  data.props.className = classNames.join(' ')
}

/**
 * 给 vnode 添加 dataset
 * @param vnode vnode
 * @param newDataset { key: val }
 */
export function addVnodeDataset(vnode: VNode, newDataset: VNodeDataset) {
  if (vnode.data == null) { vnode.data = {} }
  const data = vnode.data

  if (data.dataset == null) { data.dataset = {} }

  Object.assign(data.dataset, newDataset)
}
