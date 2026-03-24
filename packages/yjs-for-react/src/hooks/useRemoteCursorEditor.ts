import type { IDomEditor } from '@wangeditor-next/editor'
import { CursorEditor } from '@wangeditor-next/yjs'

import { useEditorStatic } from './use-editor-static'

export function useRemoteCursorEditor<
  TCursorData extends Record<string, unknown> = Record<string, unknown>,
>(): CursorEditor<TCursorData> & IDomEditor {
  const editor = useEditorStatic()

  if (!CursorEditor.isCursorEditor(editor)) {
    console.warn('Cannot use useSyncExternalStore outside the context of a RemoteCursorEditor')
  }

  return editor as CursorEditor & IDomEditor
}
