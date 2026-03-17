<template>
  <div>
    <div style="border: 1px solid #ccc; z-index: 100">
      <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :default-config="toolbarConfig"
        mode="default"
      />
      <Editor
        style="height: 500px; overflow-y: hidden"
        v-model="html"
        :default-config="editorConfig"
        mode="default"
        @on-created="handleCreated"
        @on-change="handleChange"
      />
    </div>
    <div style="margin-top: 15px">{{ html }}</div>
    <div style="margin-top: 15px">{{ selectionString }}</div>
  </div>
</template>

<script lang="ts">
import '@wangeditor-next/editor/dist/css/style.css'

import type { IEditorConfig, IToolbarConfig, SlateDescendant } from '@wangeditor-next/editor'
import { Boot } from '@wangeditor-next/editor'
import { Editor, Toolbar } from '@wangeditor-next/editor-for-vue'
import {
  slateNodesToInsertDelta, withYHistory, withYjs, YjsEditor,
} from '@wangeditor-next/yjs'
import {
  defineComponent,
  onBeforeUnmount,
  onWatcherCleanup,
  ref,
  shallowRef,
  watchEffect,
} from 'vue'
import { WebsocketProvider } from 'y-websocket'
import * as Y from 'yjs'

export default defineComponent({
  name: 'Simple',
  components: { Editor, Toolbar },
  setup() {
    // -------------------- y.js --------------------
    const yDoc = new Y.Doc()
    const wsProvider = new WebsocketProvider('ws://localhost:1234', 'wangeditor-next-yjs', yDoc)
    const sharedType = yDoc.get('content', Y.XmlText)

    Boot.registerPlugin(withYjs(sharedType))
    Boot.registerPlugin(withYHistory())
    wsProvider.on('status', event => {
      console.log(event.status)
    })
    console.log(Boot.plugins)
    // -------------------- y.js --------------------

    // -------------------------- Editor --------------------------
    const html = ref('<p>hello</p>')
    const selectionString = ref('')
    const toolbarConfig: Partial<IToolbarConfig> = {}
    const editorConfig: Partial<IEditorConfig> = {
      placeholder: '请输入内容...',
    }
    const editorRef = shallowRef()

    onBeforeUnmount(() => {
      const editor = editorRef.value

      if (editor == null) {
        return
      }
      editor.destroy()
    })
    const handleCreated = (editor: typeof Editor) => {
      editorRef.value = editor // 记录 editor 实例，重要！
    }
    const handleChange = (innerEditor: typeof Editor) => {
      html.value = innerEditor.getHtml()
    }
    // -------------------------- Editor --------------------------

    // -------- Y.js <-> Editor --------------------------
    const initialValue: SlateDescendant[] = [
      {
        type: 'paragraph',
        children: [{ text: 'hello' }],
      },
    ]

    watchEffect(async () => {
      onWatcherCleanup(() => {
        if (
          editorRef.value
          && Object.prototype.hasOwnProperty.call(editorRef.value, 'diisconnect')
        ) {
          YjsEditor.disconnect(editorRef.value)
        }
      })

      if (editorRef.value) {
        sharedType.applyDelta(slateNodesToInsertDelta(initialValue))
        YjsEditor.connect(editorRef.value)
      }
    })
    // -------- Y.js <-> Editor --------------------------

    return {
      html,
      selectionString,
      editorConfig,
      handleCreated,
      handleChange,
      editorRef,
      toolbarConfig,
    }
  },
})
</script>

<style scoped></style>
