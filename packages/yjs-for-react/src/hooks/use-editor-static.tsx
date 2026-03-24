import type { IDomEditor } from '@wangeditor-next/editor'
import { createContext, useContext } from 'react'

export const EditorContext = createContext<IDomEditor | null>(null)

export const useEditorStatic = (): IDomEditor | null => {
  const editor = useContext(EditorContext)

  if (!editor) {
    // throw new Error(
    //   `The \`useEditorStatic\` hook must be used inside the <EditorContext> component's context.`
    // )
    console.warn(
      "The `useEditorStatic` hook must be used inside the <EditorContext> component's context.",
    )
  }

  return editor
}
