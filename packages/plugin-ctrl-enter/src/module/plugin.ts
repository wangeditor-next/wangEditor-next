/**
 * @description plugin
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/editor'

function withCtrlEnter<T extends IDomEditor>(editor: T) {
  const { insertBreak } = editor
  const newEditor = editor
  let fromHotKey = false

  setTimeout(() => {
    // beforeInput 事件不能可靠识别 ctrl/cmd + enter，这里补一个 keydown 监听
    try {
      const { $textArea } = DomEditor.getTextarea(newEditor)

      if ($textArea == null) { return }

      $textArea.on('keydown', e => {
        const event = e as KeyboardEvent
        const isCtrl = event.ctrlKey || event.metaKey

        // 兼容 beforeinput 不支持的环境：若已经被核心 keydown 处理，则避免重复触发
        if (event.defaultPrevented) { return }

        if (event.key === 'Enter' && isCtrl) {
          event.preventDefault()
          fromHotKey = true
          try {
            newEditor.insertBreak()
          } finally {
            fromHotKey = false
          }
        }
      })
    } catch {
      // ignore - editor may be destroyed before async binding
    }
  })

  newEditor.insertBreak = () => {
    const event = window.event as KeyboardEvent | undefined
    const isCtrl = !!event && (event.ctrlKey || event.metaKey)

    // 只有 ctrl/cmd + enter 才能换行
    if (fromHotKey || isCtrl) {
      insertBreak()
    }
  }

  return newEditor
}

export default withCtrlEnter
