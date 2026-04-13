/**
 * @description class/inline style mode helpers
 */

import { IDomEditor } from '../editor/interface'
import {
  ClassStylePolicy,
  IClassStyleUnsupportedPayload,
  TextStyleMode,
} from './interface'

export function getTextStyleMode(editor?: IDomEditor): TextStyleMode {
  if (!editor) { return 'inline' }

  const mode = editor.getConfig().textStyleMode

  if (mode === 'class') { return 'class' }
  return 'inline'
}

export function getClassStylePolicy(editor?: IDomEditor): ClassStylePolicy {
  if (!editor) { return 'preserve-data' }

  const policy = editor.getConfig().classStylePolicy

  if (policy === 'fallback-inline') { return 'fallback-inline' }
  if (policy === 'strict') { return 'strict' }
  return 'preserve-data'
}

export function reportUnsupportedClassStyle(
  editor: IDomEditor | undefined,
  payload: IClassStyleUnsupportedPayload,
) {
  const onUnsupported = editor?.getConfig().onClassStyleUnsupported

  if (onUnsupported) {
    onUnsupported(payload)
    return
  }

  // eslint-disable-next-line no-console
  console.warn(payload.message)
}
