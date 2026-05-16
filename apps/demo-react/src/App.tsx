import '@wangeditor-next/editor/dist/css/style.css'
import './styles.css'

import basicModules from '@wangeditor-next/basic-modules'
import {
  createEditorFactory,
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
  Toolbar,
} from '@wangeditor-next/editor/core'
import wangEditorListModule from '@wangeditor-next/list-module'
import React, { useEffect, useRef, useState } from 'react'

const toolbarConfig: Partial<IToolbarConfig> = {
  toolbarKeys: [
    'headerSelect',
    'bold',
    'italic',
    'underline',
    '|',
    'bulletedList',
    'numberedList',
    '|',
    'undo',
    'redo',
  ],
}

const editorFactory = createEditorFactory({
  extensions: [...basicModules, wangEditorListModule],
  toolbarConfig,
})

const initialHtml = [
  '<h2>React On-Demand Demo</h2>',
  '<p>这个示例使用 <code>@wangeditor-next/editor/core</code> + <code>createEditorFactory</code>。</p>',
  '<p>当前仅组合 <code>basic-modules</code> 和 <code>list-module</code>，用于演示按需加载。</p>',
].join('')

export default function App() {
  const editorRef = useRef<IDomEditor | null>(null)
  const toolbarRef = useRef<Toolbar | null>(null)
  const editorContainerRef = useRef<HTMLDivElement | null>(null)
  const toolbarContainerRef = useRef<HTMLDivElement | null>(null)
  const [html, setHtml] = useState(initialHtml)

  useEffect(() => {
    const editorContainer = editorContainerRef.current
    const toolbarContainer = toolbarContainerRef.current

    if (!editorContainer || !toolbarContainer) { return }

    const editorConfig: Partial<IEditorConfig> = {
      placeholder: '请输入内容...',
      onChange: editor => setHtml(editor.getHtml()),
    }

    const { editor, toolbar } = editorFactory.create({
      editor: {
        selector: editorContainer,
        html: initialHtml,
        config: editorConfig,
      },
      toolbar: {
        selector: toolbarContainer,
      },
    })

    editorRef.current = editor
    toolbarRef.current = toolbar
    setHtml(editor.getHtml())

    return () => {
      const currentToolbar = toolbarRef.current
      const currentEditor = editorRef.current

      if (currentToolbar) {
        currentToolbar.destroy()
        toolbarRef.current = null
      }

      if (currentEditor) {
        currentEditor.destroy()
        editorRef.current = null
      }
    }
  }, [])

  return (
    <div className="page">
      <section className="panel">
        <header className="hero">
          <p className="eyebrow">apps/demo-react</p>
          <h1>wangEditor React On-Demand Demo</h1>
          <p className="summary">
            只注册所需模块，避免默认入口一次性加载全部内置能力。
          </p>
        </header>

        <div className="editor-shell">
          <div ref={toolbarContainerRef} style={{ borderBottom: '1px solid #d9e2f2' }} />
          <div ref={editorContainerRef} style={{ height: '360px', overflowY: 'hidden' }} />
        </div>
      </section>

      <aside className="panel output">
        <p className="eyebrow">HTML Output</p>
        <pre>{html}</pre>
      </aside>
    </div>
  )
}
