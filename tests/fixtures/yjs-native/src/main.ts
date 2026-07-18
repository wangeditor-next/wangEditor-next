import '@wangeditor-next/editor/dist/css/style.css'

import type { IDomEditor } from '@wangeditor-next/editor'
import { Boot, createEditor } from '@wangeditor-next/editor'
import type { YHistoryEditor, YjsEditor as YjsEditorType } from '@wangeditor-next/yjs'
import { withCursors, withYHistory, withYjs, YjsEditor } from '@wangeditor-next/yjs'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

declare global {
  interface Window {
    editor?: IDomEditor & YjsEditorType & YHistoryEditor
    nativeReady?: boolean
  }
}

const room = new URLSearchParams(window.location.search).get('room') || 'native-yjs'
const yDoc = new Y.Doc()
const provider = new WebsocketProvider('ws://127.0.0.1:1234', room, yDoc)
const sharedRoot = yDoc.get('content', Y.XmlText)

Boot.registerPlugin(withYjs(sharedRoot))
Boot.registerPlugin(
  withCursors(provider.awareness, {
    data: { color: '#2563eb', name: 'Native user' },
  })
)
Boot.registerPlugin(withYHistory())

provider.once('sync', () => {
  const editor = createEditor({
    selector: '#editor',
    html: '<p><br></p>',
  }) as IDomEditor & YjsEditorType & YHistoryEditor

  YjsEditor.connect(editor)
  window.editor = editor
  window.nativeReady = true
})

window.addEventListener('beforeunload', () => {
  if (window.editor && YjsEditor.connected(window.editor)) {
    YjsEditor.disconnect(window.editor)
  }
  provider.destroy()
  yDoc.destroy()
})
