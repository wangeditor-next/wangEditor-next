import type { IDomEditor } from '@wangeditor-next/editor'
import { DomEditor } from '@wangeditor-next/editor'
import { BaseRange } from 'slate'

export function reactEditorToDomRangeSafe(editor: IDomEditor, range: BaseRange): Range | null {
  try {
    return DomEditor.toDOMRange(editor, range)
  } catch (e) {
    return null
  }
}
