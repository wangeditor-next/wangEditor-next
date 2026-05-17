import '@wangeditor-next/editor/dist/css/style.css'
import './styles.css'

import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor-next/editor'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-react'
import React, { useEffect, useRef, useState } from 'react'

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: ['headerSelect', 'bold', 'italic', '|', 'insertTable', '|', 'undo', 'redo'],
}

const initialHtml = [
  '<h2>React Wrapper Demo</h2>',
  '<p>该示例使用 <code>@wangeditor-next/editor-for-react</code>。</p>',
  '<p>用于跨框架 IME / table 回归验证。</p>',
].join('')

const setGlobalReactEditor = (value: IDomEditor | null) => {
  const globalWindow = window as unknown as { reactEditor?: IDomEditor | null }

  globalWindow.reactEditor = value
}

export default function App() {
  const editorRef = useRef<IDomEditor | null>(null)
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState(initialHtml)
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
  }

  useEffect(() => {
    return () => {
      const currentEditor = editorRef.current

      if (currentEditor) {
        currentEditor.destroy()
        setGlobalReactEditor(null)
        editorRef.current = null
        setEditor(null)
      }
    }
  }, [])

  const handleCreated = (createdEditor: IDomEditor) => {
    editorRef.current = createdEditor
    setEditor(createdEditor)
    setGlobalReactEditor(createdEditor)
  }

  const handleChanged = (changedEditor: IDomEditor) => {
    setHtml(changedEditor.getHtml())
  }

  return (
    <div className="page">
      <section className="panel">
        <header className="hero">
          <p className="eyebrow">apps/demo-react</p>
          <h1>wangEditor React Wrapper Demo</h1>
          <p className="summary">
            该页面用于验证 React 适配层与 core 行为一致性。
          </p>
        </header>

        <div className="editor-shell">
          <div data-testid="editor-toolbar">
            <Toolbar
              editor={editor}
              defaultConfig={toolbarConfig}
              mode="default"
              style={{ borderBottom: '1px solid #d9e2f2' }}
            />
          </div>
          <div data-testid="editor-textarea">
            <Editor
              defaultConfig={editorConfig}
              defaultHtml={initialHtml}
              mode="default"
              onCreated={handleCreated}
              onChange={handleChanged}
              style={{ height: '360px', overflowY: 'hidden' }}
              value={html}
            />
          </div>
        </div>
      </section>

      <aside className="panel output">
        <p className="eyebrow">HTML Output</p>
        <pre>{html}</pre>
      </aside>
    </div>
  )
}
