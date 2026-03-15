/**
 * @description create editor - 用于 packages/core 单元测试
 * @author wangfupeng
 */

import { IDomEditor } from '../src'
import createEditor from '../src/create/create-editor'
import createToolbarForSrc from '../src/create/create-toolbar'

export default function (options: any = {}) {
  const container = document.createElement('div')

  document.body.appendChild(container)

  const editor = createEditor({
    selector: container,
    ...options,
  })

  const globalScope = globalThis as any

  if (!globalScope.testEditors) {
    globalScope.testEditors = new Set()
  }
  globalScope.testEditors.add(editor)

  return editor
}

export const createToolbar = function (editor: IDomEditor, customConfig = {}) {
  const container = document.createElement('div')

  document.body.appendChild(container)
  return createToolbarForSrc(editor, {
    selector: container,
    config: {
      ...customConfig,
    },
  })
}
