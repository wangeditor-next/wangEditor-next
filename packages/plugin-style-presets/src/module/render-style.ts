/**
 * @description render style presets
 */

import { IDomEditor, SlateDescendant } from '@wangeditor-next/editor'
import { VNode } from 'snabbdom'

import { addPresetToVnode, getNodeStylePreset } from './helpers'

export function renderStyle(node: SlateDescendant, vnode: VNode, editor?: IDomEditor): VNode {
  const key = getNodeStylePreset(node)

  if (!key || !editor) {
    return vnode
  }
  return addPresetToVnode(vnode, editor, key)
}
