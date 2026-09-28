<script lang="ts">
import { createToolbar, DomEditor, IDomEditor, IToolbarConfig } from '@wangeditor-next/editor'
import type {
  ComponentOptionsMixin,
  ComputedOptions,
  DefineComponent,
  MethodOptions,
  Ref,
} from 'vue'
import { defineComponent, h, PropType, ref, watchEffect } from 'vue'

const componentProps = {
  // editor 实例
  editor: {
    type: Object as PropType<IDomEditor>,
    default: undefined,
  },
  /** 编辑器模式 */
  mode: {
    type: String,
    default: 'default',
  },
  /** 编辑器默认配置 */
  defaultConfig: {
    type: Object as PropType<Partial<IToolbarConfig>>,
    default: () => ({}),
  },
}

export default defineComponent({
  render() {
    return h('div', { ref: 'selector' })
  },
  props: componentProps,
  setup(props) {
    // toolbar 容器
    const selector = ref(null)

    /**
     * 初始化 toolbar
     */
    const create = (editor: IDomEditor) => {
      if (!selector.value) {
        return
      }
      if (editor == null) {
        throw new Error('Not found instance of Editor when create <Toolbar/> component')
      }
      if (DomEditor.getToolbar(editor)) {
        return
      } // 不重复创建

      createToolbar({
        editor,
        selector: (selector.value! as Element) || '<div></div>',
        mode: props.mode,
        config: props.defaultConfig,
      })
    }

    watchEffect(() => {
      const { editor } = props

      if (editor == null) {
        return
      }
      create(editor) // 初始化 toolbar
    })

    return {
      selector,
    }
  },
}) as DefineComponent<
  typeof componentProps,
  { selector: Ref<HTMLElement | null> },
  {},
  ComputedOptions,
  MethodOptions,
  ComponentOptionsMixin,
  ComponentOptionsMixin
>
</script>
