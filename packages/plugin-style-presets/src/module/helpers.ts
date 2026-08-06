/**
 * @description style preset HTML and vnode helpers
 */

import { IDomEditor } from '@wangeditor-next/editor'
import { VNode } from 'snabbdom'

import { findStylePreset } from './config'
import { IStylePreset } from './types'

export const STYLE_PRESET_PROPERTY = 'stylePreset'
export const STYLE_PRESET_DATA_ATTRIBUTE = 'data-w-e-style-preset'
const STYLE_PRESET_DATASET_KEY = 'wEStylePreset'
const SAFE_PRESET_KEY_REGEXP = /^[a-z][a-z0-9-]{0,63}$/

function getGeneratedClassName(key: string): string {
  return `w-e-style-preset-${key}`
}

export function getStylePresetClassNames(preset: IStylePreset): string[] {
  const businessClassNames = (preset.className || '').trim().split(/\s+/).filter(Boolean)

  return [getGeneratedClassName(preset.key), ...businessClassNames]
}

export function getStylePresetMatchClassNames(preset: IStylePreset): string[] {
  const businessClassNames = (preset.className || '').trim().split(/\s+/).filter(Boolean)

  return businessClassNames.length > 0 ? businessClassNames : [getGeneratedClassName(preset.key)]
}

export function getClassNamesForKey(editor: IDomEditor, key: string): string[] {
  const preset = findStylePreset(editor, key)

  if (preset) {
    return getStylePresetClassNames(preset)
  }
  if (SAFE_PRESET_KEY_REGEXP.test(key)) {
    return [getGeneratedClassName(key)]
  }
  return []
}

export function getNodeStylePreset(node: unknown): string {
  if (!node || typeof node !== 'object') {
    return ''
  }

  const value = (node as Record<string, unknown>)[STYLE_PRESET_PROPERTY]

  return typeof value === 'string' ? value.trim() : ''
}

export function addPresetToVnode(vnode: VNode, editor: IDomEditor, key: string): VNode {
  const data = vnode.data || {}
  const dataset = data.dataset || {}
  const classMap = data.class || {}

  dataset[STYLE_PRESET_DATASET_KEY] = key
  getClassNamesForKey(editor, key).forEach(className => {
    classMap[className] = true
  })

  vnode.data = {
    ...data,
    class: classMap,
    dataset,
  }
  return vnode
}

export function addPresetToElement(element: Element, editor: IDomEditor, key: string) {
  element.setAttribute(STYLE_PRESET_DATA_ATTRIBUTE, key)
  getClassNamesForKey(editor, key).forEach(className => element.classList.add(className))
}
