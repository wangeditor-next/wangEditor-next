import '../../../packages/editor/dist/css/style.css'

import { Boot, createEditor, type IDomEditor, type SlateDescendant } from '@wangeditor-next/editor'
import { Editor as ReactEditor, Toolbar as ReactToolbar } from '@wangeditor-next/editor-for-react'
import { Editor as VueEditor, Toolbar as VueToolbar } from '@wangeditor-next/editor-for-vue'
import { mount } from 'peer-react-mount'
import React from 'react'
import { createApp, h, nextTick, onMounted, shallowRef } from 'vue'

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
interface VueMountOptions {
  model?: string
  defaultHtml?: string
  defaultContent?: SlateDescendant[]
  mountedModels?: string[]
  deferCreated?: boolean
  writeback?: boolean
}

api.mountVue = ({
  model = '<p>initial</p>',
  defaultHtml,
  defaultContent,
  mountedModels = [],
  deferCreated = false,
  writeback = true,
}: VueMountOptions = {}) => {
  const editor = shallowRef<IDomEditor | null>(null)
  const value = shallowRef(model)
  const created: string[] = []
  const updates: string[] = []
  const changes: string[] = []
  const mountedUpdates: { model: string; created: boolean }[] = []
  let releaseCreated: (() => void) | undefined

  const app = createApp({
    setup() {
      onMounted(async () => {
        for (const html of mountedModels) {
          value.value = html
          await nextTick()
          mountedUpdates.push({ model: value.value, created: editor.value !== null })
        }
        releaseCreated?.()
      })

      return () =>
        h('div', [
          h(VueEditor, {
            defaultHtml,
            defaultContent,
            defaultConfig: { autoFocus: false },
            modelValue: value.value,
            onOnCreated: (instance: IDomEditor) => {
              editor.value = instance
              api.editors.vue = instance
              created.push(instance.getHtml())
            },
            onOnChange: (instance: IDomEditor) => changes.push(instance.getHtml()),
            'onUpdate:modelValue': (html: string) => {
              if (writeback) {
                value.value = html
              }
              updates.push(html)
              api.changes.vue += 1
            },
          }),
          h(VueToolbar, { editor: editor.value }),
        ])
    },
  })

  const { plugins } = Boot

  if (deferCreated) {
    // Hold this editor's lifecycle event while the parent flushes multiple updates.
    Boot.plugins = [...plugins]
    Boot.registerPlugin(instance => {
      const { emit } = instance

      instance.emit = (type, ...args) => {
        if (type === 'created') {
          instance.emit = emit
          releaseCreated = () => emit(type, ...args)
        } else {
          emit(type, ...args)
        }
      }
      return instance
    })
  }

  try {
    app.mount('#vue')
  } finally {
    Boot.plugins = plugins
  }
  api.vueState = () => ({
    model: value.value,
    html: editor.value?.getHtml(),
    selection: editor.value?.selection ?? null,
    created,
    updates,
    changes,
    mountedUpdates,
  })
  api.updateVue = async (html: string) => {
    value.value = html
    await nextTick()
  }
  api.unmountVue = () => {
    app.unmount()
    editor.value!.destroy()
  }
}
;(window as any).peerCompat = api
