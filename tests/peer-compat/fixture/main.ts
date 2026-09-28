import '../../../packages/editor/dist/css/style.css'

import { createEditor } from '@wangeditor-next/editor'
import { Editor as ReactEditor, Toolbar as ReactToolbar } from '@wangeditor-next/editor-for-react'
import { Editor as VueEditor, Toolbar as VueToolbar } from '@wangeditor-next/editor-for-vue'
import { mount } from 'peer-react-mount'
import React from 'react'
import { createApp, h, nextTick, shallowRef } from 'vue'

import { createUploader } from '../../../packages/core/src/upload'

const api: any = { createEditor, createUploader, editors: {}, changes: { react: 0, vue: 0 } }

api.mountReact = (value?: string) => {
  const editorProps: any = {
    defaultHtml: '<p>initial</p>',
    onCreated: (editor: any) => {
      api.editors.react = editor
    },
    onChange: () => {
      api.changes.react += 1
    },
    value,
  }
  const render = () =>
    React.createElement(
      React.Fragment,
      null,
      React.createElement(ReactEditor, editorProps),
      React.createElement(ReactToolbar, { editor: api.editors.react })
    )
  const root = mount(render(), document.querySelector('#react')!)

  api.updateReact = (next: string | undefined) => {
    editorProps.value = next
    root.render(render())
  }
  api.unmountReact = () => {
    root.unmount()
    api.editors.react.destroy()
  }
}
api.mountVue = () => {
  const editor = shallowRef<any>(null)
  const value = shallowRef('<p>initial</p>')
  const app = createApp({
    render: () =>
      h('div', [
        h(VueEditor, {
          modelValue: value.value,
          onOnCreated: (created: any) => {
            editor.value = created
            api.editors.vue = created
          },
          'onUpdate:modelValue': (html: string) => {
            value.value = html
            api.changes.vue += 1
          },
        }),
        h(VueToolbar, { editor: editor.value }),
      ]),
  })

  app.mount('#vue')
  api.updateVue = async (html: string) => {
    value.value = html
    await nextTick()
  }
  api.unmountVue = () => {
    app.unmount()
    editor.value.destroy()
  }
}
;(window as any).peerCompat = api
