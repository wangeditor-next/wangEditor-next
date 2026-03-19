import '@wangeditor-next/editor/dist/css/style.css'

import {
  IDomEditor, IEditorConfig, IToolbarConfig,
} from '@wangeditor-next/editor'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-react'
import React, { useEffect, useState } from 'react'

import './styles.css'

const toolbarConfig: Partial<IToolbarConfig> = {}

const editorConfig: Partial<IEditorConfig> = {
  placeholder: '请输入内容...',
}

const initialHtml = [
  '<h2>React Demo</h2>',
  '<p>这个 demo 的源码位于 <code>apps/demo-react</code>。</p>',
  '<p>后续若需要同步 StackBlitz，应从这里派生模板，而不是直接在沙盒里维护。</p>',
].join('')

export default function App() {
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState(initialHtml)

  useEffect(() => {
    return () => {
      if (editor == null) return
      editor.destroy()
      setEditor(null)
    }
  }, [editor])

  return (
    <div className="page">
      <section className="panel">
        <header className="hero">
          <p className="eyebrow">apps/demo-react</p>
          <h1>wangEditor React Demo</h1>
          <p className="summary">
            这是主仓库里的 React 示例源码，用来替代分散维护的在线沙盒。
          </p>
        </header>

        <div className="editor-shell">
          <Toolbar
            editor={editor}
            defaultConfig={toolbarConfig}
            mode="default"
            style={{ borderBottom: '1px solid #d9e2f2' }}
          />
          <Editor
            defaultConfig={editorConfig}
            value={html}
            mode="default"
            onCreated={setEditor}
            onChange={innerEditor => setHtml(innerEditor.getHtml())}
            style={{ height: '360px', overflowY: 'hidden' }}
          />
        </div>
      </section>

      <aside className="panel output">
        <p className="eyebrow">HTML Output</p>
        <pre>{html}</pre>
      </aside>
    </div>
  )
}
