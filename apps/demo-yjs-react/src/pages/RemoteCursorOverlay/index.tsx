import '@wangeditor-next/editor/dist/css/style.css'

import {
  Boot,
  IDomEditor,
  IEditorConfig,
  IToolbarConfig,
  SlateDescendant,
} from '@wangeditor-next/editor'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-react'
import {
  slateNodesToInsertDelta,
  withCursors,
  withYHistory,
  withYjs,
  YjsEditor,
} from '@wangeditor-next/yjs'
import { EditorContext } from '@wangeditor-next/yjs-for-react'
import React, { useEffect, useState } from 'react'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

import { randomCursorData } from '../../utils'
import { RemoteCursorOverlay } from './Overlay'

const yDoc = new Y.Doc()
const wsProvider = new WebsocketProvider('ws://localhost:1234', 'wangeditor-next-yjs', yDoc)
const sharedType = yDoc.get('content', Y.XmlText)
// console.log('🚀 ~ SimplePage ~ sharedType:', sharedType.toJSON())

Boot.registerPlugin(withYjs(sharedType))
Boot.registerPlugin(
  withCursors(wsProvider.awareness, {
    data: randomCursorData(),
  }),
)
Boot.registerPlugin(withYHistory())

wsProvider.on('status', event => {
  console.log(event.status)
})

const initialValue: SlateDescendant[] = [
  {
    type: 'paragraph',
    children: [{ text: 'hello' }],
  },
]

export const RemoteCursorsOverlayPage = () => {
  // editor 实例
  const [editor, setEditor] = useState<IDomEditor | null>(null)
  const [html, setHtml] = useState('hello')

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {}

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: '请输入内容...',
  }

  //   console.log('🚀 ~ SimplePage ~ wsProvider:', wsProvider.awareness)
  //   useEffect(() => {
  //     setTimeout(() => {
  //       setHtml('<p>hello&nbsp;<strong>world</strong>.</p>\n<p><br></p>')
  //     }, 1500)
  //   }, [])
  //   if (wsProvider.awareness.getLocalState()?.['selection']) {
  //     console.log(
  //       '🚀 ~ SimplePage ~ range',
  //       relativeRangeToSlateRange(
  //         sharedType,
  //         editor,
  //         wsProvider.awareness.getLocalState()?.['selection']
  //       )
  //     )
  //   }
  useEffect(() => {
    if (editor) {
      sharedType.applyDelta(slateNodesToInsertDelta(initialValue))
      //   sharedType.insert(0, 'hello')
      YjsEditor.connect(editor)
    }
    return () => {
      if (editor) {
        YjsEditor.disconnect(editor)
      }
    }
  }, [editor])

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) { return }
      setTimeout(() => {
        editor.destroy() // 组件销毁时，及时销毁编辑器
      }, 300)
      setEditor(null)
    }
  }, [editor])
  //   console.log('🚀 ~ SimplePage ~ editor:', editor)

  return (
    <EditorContext.Provider value={editor}>
      <div style={{ border: '1px solid #ccc', zIndex: 100 }}>
        <Toolbar
          editor={editor}
          defaultConfig={toolbarConfig}
          mode="default"
          style={{ borderBottom: '1px solid #ccc' }}
        />
        <RemoteCursorOverlay>
          <Editor
            defaultConfig={editorConfig}
            value={html}
            onCreated={setEditor}
            onChange={innerEditor => setHtml(innerEditor.getHtml())}
            mode="default"
            style={{ height: '500px', innerWidth: '100%', overflowY: 'hidden' }}
          />
        </RemoteCursorOverlay>
      </div>
      <div style={{ marginTop: '15px' }}>{html}</div>
      <div style={{ marginTop: '15px' }}>{editor && JSON.stringify(editor.selection)}</div>
    </EditorContext.Provider>
  )
}

export default RemoteCursorsOverlayPage
