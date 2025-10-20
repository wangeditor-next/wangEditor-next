import type { IDomEditor } from '@wangeditor-next/editor'
import { inject, provide, type ShallowRef } from 'vue'

export interface EditorContext {
  editor: ShallowRef<IDomEditor | undefined>
}

const EDITOR_CONTEXT_KEY = Symbol('editorContext')

export function provideEditor(editorRef: ShallowRef<IDomEditor | undefined>) {
  provide(EDITOR_CONTEXT_KEY, {
    editor: editorRef,
  })
}

export const useEditorStatic = (): ShallowRef<IDomEditor | undefined> => {
  const context = inject<EditorContext>(EDITOR_CONTEXT_KEY)

  if (!context) {
    // 如果外部没有provide(ShallowRef)，则报错
    throw new Error(
      '[useEditorStatic] editor context not provided.Call provideEditor() in a parent component before using useEditorStatic().',
    )
  }
  return context.editor
}
