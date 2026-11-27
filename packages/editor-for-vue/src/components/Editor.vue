<script lang="ts">
import { createEditor, IDomEditor, IEditorConfig, SlateDescendant } from '@wangeditor-next/editor'
import type {
  ComponentOptionsMixin,
  ComputedOptions,
  DefineComponent,
  MethodOptions,
  Ref,
} from 'vue'
import { defineComponent, h, onMounted, PropType, ref, shallowRef, toRaw, watch } from 'vue'

import { genErrorInfo } from '../utils/create-info'

type AlertType = 'success' | 'info' | 'warning' | 'error'

const componentProps = {
  /** 编辑器模式 */
  mode: {
    type: String,
    default: 'default',
  },
  /** 编辑器默认内容 */
  defaultContent: {
    type: Array as PropType<SlateDescendant[]>,
    default: () => [],
  },
  defaultHtml: {
    type: String,
    default: '',
  },
  /** 编辑器默认配置 */
  defaultConfig: {
    type: Object as PropType<Partial<IEditorConfig>>,
    default: () => ({}),
  },
  /* 自定义 v-model */
  modelValue: {
    type: String,
    default: '',
  },
}

const emits = {
  'update:modelValue': (_val: string) => true,
  onCreated: (_editor: IDomEditor) => true,
  onChange: (_editor: IDomEditor) => true,
  onDestroyed: (_editor: IDomEditor) => true,
  onMaxLength: (_editor: IDomEditor) => true,
  onFocus: (_editor: IDomEditor) => true,
  onBlur: (_editor: IDomEditor) => true,
  customAlert: (_info: string, _type: AlertType) => true,
  customPaste: (_editor: IDomEditor, _event: ClipboardEvent, _cb: (v: boolean) => void) => true,
}

export default defineComponent({
  // Keep the published runtime compatible with Vue 3.0 (including its render helpers).
  render() {
    return h('div', { ref: 'box', style: { height: '100%' } })
  },
  props: componentProps,
  emits,
  setup(props, context) {
    const box = ref(null) // 编辑器容器

    const editorRef = shallowRef<null | IDomEditor>(null) // editor 实例，必须用 shallowRef

    let pendingModelValue: string | undefined
    let lastEmitted: { html: string; content: SlateDescendant[] } | undefined

    function syncModelValue(html: string) {
      const editor = editorRef.value

      if (editor == null) {
        // 创建完成前仅保留父组件最后一次更新，空字符串也表示更新。
        pendingModelValue = html
        return
      }

      // Slate 内容变更会替换根节点数组，回显等于已发送的内容时可跳过序列化。
      if (lastEmitted?.html === html && lastEmitted.content === editor.children) {
        return
      }
      if (html !== editor.getHtml()) {
        editor.setHtml(html)
      }
    }

    /**
     * 初始化编辑器
     */
    const initEditor = () => {
      if (!box.value) {
        return
      }
      // 获取原始数据，解除响应式特性
      const defaultContent = toRaw(props.defaultContent)

      createEditor({
        selector: box.value! as Element,
        mode: props.mode,
        content: defaultContent || [],
        html: props.defaultHtml || props.modelValue || '',
        config: {
          ...props.defaultConfig,
          onCreated(editor: IDomEditor) {
            editorRef.value = editor // 记录 editor 实例

            const modelValue = pendingModelValue

            pendingModelValue = undefined
            if (modelValue !== undefined) {
              syncModelValue(modelValue)
            }

            context.emit('onCreated', editor)

            if (props.defaultConfig.onCreated) {
              const info = genErrorInfo('onCreated')

              throw new Error(info)
            }
          },
          onChange(editor: IDomEditor) {
            const editorHtml = editor.getHtml()

            lastEmitted = { html: editorHtml, content: editor.children }
            context.emit('update:modelValue', editorHtml) // 触发 v-model 值变化

            context.emit('onChange', editor)
            if (props.defaultConfig.onChange) {
              const info = genErrorInfo('onChange')

              throw new Error(info)
            }
          },
          onDestroyed(editor: IDomEditor) {
            context.emit('onDestroyed', editor)
            if (props.defaultConfig.onDestroyed) {
              const info = genErrorInfo('onDestroyed')

              throw new Error(info)
            }
          },
          onMaxLength(editor: IDomEditor) {
            context.emit('onMaxLength', editor)
            if (props.defaultConfig.onMaxLength) {
              const info = genErrorInfo('onMaxLength')

              throw new Error(info)
            }
          },
          onFocus(editor: IDomEditor) {
            context.emit('onFocus', editor)
            if (props.defaultConfig.onFocus) {
              const info = genErrorInfo('onFocus')

              throw new Error(info)
            }
          },
          onBlur(editor: IDomEditor) {
            context.emit('onBlur', editor)
            if (props.defaultConfig.onBlur) {
              const info = genErrorInfo('onBlur')

              throw new Error(info)
            }
          },
          customAlert(info: string, type: AlertType) {
            context.emit('customAlert', info, type)
            // @ts-ignore
            if (props.defaultConfig.customAlert) {
              const errorInfo = genErrorInfo('customAlert')

              throw new Error(errorInfo)
            }
          },
          customPaste: (editor: IDomEditor, event: ClipboardEvent): any => {
            if (props.defaultConfig.customPaste) {
              const info = genErrorInfo('customPaste')

              throw new Error(info)
            }
            let res

            context.emit('customPaste', editor, event, (val: boolean) => {
              res = val
            })
            return res
          },
        },
      })
    }

    /**
     * 元素挂在后初始化编辑器
     */
    onMounted(() => {
      initEditor()
    })

    // 监听 v-model 值变化
    watch(() => props.modelValue, syncModelValue)

    return {
      box,
    }
  },
}) as DefineComponent<
  typeof componentProps,
  { box: Ref<HTMLElement | null> },
  {},
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  ComponentOptionsMixin,
  typeof emits
>
</script>
