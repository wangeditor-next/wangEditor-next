import '@wangeditor-next/editor/dist/css/style.css'

import { Boot, IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor-next/editor'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-react'
import { withYHistory, withYjs, YjsEditor } from '@wangeditor-next/yjs'
import React, { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { YJS_WEBSOCKET_URL } from '../config'
import { getCollaborationRoom } from '../utils'

const yDoc = new Y.Doc()
const wsProvider = new WebsocketProvider(YJS_WEBSOCKET_URL, getCollaborationRoom(), yDoc)
const sharedType = yDoc.get('content', Y.XmlText)

// @ts-ignore
Boot.registerPlugin(withYjs(sharedType))
// @ts-ignore
Boot.registerPlugin(withYHistory())

export const SimplePage = () => {
  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState('<p><br></p>')

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {}

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
  }

  useEffect(() => {
    if (!editor) {
      return
    }

    wsProvider.connect()
    YjsEditor.connect(editor)

    return () => {
      if (YjsEditor.connected(editor)) {
        YjsEditor.disconnect(editor)
      }
      wsProvider.disconnect()
    }
  }, [editor])

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) {
        return
      }
      setTimeout(() => {
        editor.destroy() // 组件销毁时，及时销毁编辑器
      }, 300)
      setEditor(null)
    }
  }, [editor])

  return (
    <>
      <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
        />
        <Editor
          defaultConfig={editorConfig}
          value={html}
          onCreated={setEditor}
          onChange={innerEditor => setHtml(innerEditor.getHtml())}
          mode="default"
          style={{ height: '500px', overflowY: 'hidden' }}
        />
      </div>
    </>
  )
}

export default SimplePage
