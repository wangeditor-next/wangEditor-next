/**
 * @description parse style presets
 */

import { IDomEditor, SlateDescendant, SlateText } from '@wangeditor-next/editor'

import { getStylePresetConfig } from './config'
import {
  getStylePresetMatchClassNames,
  STYLE_PRESET_DATA_ATTRIBUTE,
  STYLE_PRESET_PROPERTY,
} from './helpers'
import { StylePresetScope } from './types'

function findPresetKeyByClass(
  element: Element,
  editor: IDomEditor,
  scope: StylePresetScope
): string {
  const preset = getStylePresetConfig(editor).presets.find(item => {
    if (item.scope !== scope) {
      return false
    }
    return getStylePresetMatchClassNames(item).every(className =>
      element.classList.contains(className)
    )
  })

  return preset?.key || ''
}

export function parseStyleHtml(
  element: Element,
  node: SlateDescendant,
  editor: IDomEditor
): SlateDescendant {
  const scope: StylePresetScope = SlateText.isText(node) ? 'text' : 'block'
  const dataKey = element.getAttribute(STYLE_PRESET_DATA_ATTRIBUTE)?.trim() || ''
  const key = dataKey || findPresetKeyByClass(element, editor, scope)

  if (!key) {
    return node
  }

  const styledNode = node as SlateDescendant & Record<string, unknown>

  styledNode[STYLE_PRESET_PROPERTY] = key
  return styledNode
}
