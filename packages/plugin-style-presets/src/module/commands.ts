/**
 * @description style preset commands
 */

import { IDomEditor, SlateEditor, SlateElement, SlateTransforms } from '@wangeditor-next/editor'

import { findStylePreset } from './config'
import { getNodeStylePreset, STYLE_PRESET_PROPERTY } from './helpers'
import { StylePresetScope } from './types'

function getBlockMatch(editor: IDomEditor) {
  return node =>
    SlateElement.isElement(node) &&
    SlateEditor.isBlock(editor, node) &&
    !SlateEditor.isVoid(editor, node)
}

export function applyStylePreset(editor: IDomEditor, key: string): void {
  const preset = findStylePreset(editor, key)

  if (!preset) {
    throw new Error(`Unknown style preset "${key}".`)
  }
  if (editor.selection == null) {
    return
  }

  if (preset.scope === 'text') {
    editor.addMark(STYLE_PRESET_PROPERTY, key)
    return
  }

  SlateTransforms.setNodes(editor, { [STYLE_PRESET_PROPERTY]: key } as never, {
    at: editor.selection,
    match: getBlockMatch(editor),
    mode: 'lowest',
  })
}

export function removeStylePreset(
  editor: IDomEditor,
  scope: StylePresetScope | 'all' = 'all'
): void {
  if (editor.selection == null) {
    return
  }

  if (scope === 'text' || scope === 'all') {
    editor.removeMark(STYLE_PRESET_PROPERTY)
  }

  if (scope === 'block' || scope === 'all') {
    SlateTransforms.unsetNodes(editor, STYLE_PRESET_PROPERTY, {
      at: editor.selection,
      match: getBlockMatch(editor),
      mode: 'lowest',
    })
  }
}

export function getActiveStylePreset(editor: IDomEditor): string | null {
  if (editor.selection == null) {
    return null
  }

  const marks = SlateEditor.marks(editor) as Record<string, unknown> | null
  const textPreset = marks?.[STYLE_PRESET_PROPERTY]

  if (typeof textPreset === 'string' && textPreset) {
    return textPreset
  }

  const [blockEntry] = SlateEditor.nodes(editor, {
    at: editor.selection,
    match: getBlockMatch(editor),
    mode: 'lowest',
  })

  if (!blockEntry) {
    return null
  }
  return getNodeStylePreset(blockEntry[0]) || null
}
