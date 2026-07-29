<script lang="ts">
import { createToolbar, DomEditor, IDomEditor } from '@wangeditor-next/editor'
import Vue from 'vue'

export default Vue.extend({
  name: 'Toolbar',
  render(h) {
    return h('div', { ref: 'box' })
  },
  props: {
    editor: {
      type: Object,
      default: undefined,
    },
    defaultConfig: {
      type: Object,
      default: () => ({}),
    },
    mode: {
      type: String,
      default: 'default',
    },
  },
  methods: {
    // 创建 toolbar
    create(editor: IDomEditor) {
      if (this.$refs.box == null) {
        return
      }
      if (editor == null) {
        return
      }
      if (DomEditor.getToolbar(editor)) {
        return
      } // 不重复创建

      createToolbar({
        editor,
        selector: this.$refs.box as Element,
        config: this.defaultConfig || {},
        mode: this.mode || 'default',
      })
    },
  },
  watch: {
    editor: {
      handler(e: IDomEditor | null) {
        if (e == null) {
          return
        }
        this.create(e)
      },
      immediate: true,
    },
  },
})
</script>
