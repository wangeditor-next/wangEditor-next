/**
 * @description create editor for test
 * @author luochao
 */
import { createEditor as create } from '../../packages/editor/src'

export default function createEditor(options: any = {}) {
  const container = document.createElement('div')

  document.body.appendChild(container)

  const editor = create({
    selector: container,
    ...options,
  })

  // Track editors for global cleanup in tests/setup.
  const globalScope = globalThis as any

  if (!globalScope.testEditors) {
    globalScope.testEditors = new Set()
  }
  globalScope.testEditors.add(editor)

  return editor
}

// 【注意】packages/editor 中的 createEditor 不能用于 packages/core 的单元测试（因为从模块关系上，后者不能依赖于前者）！！！
//        只能用于其他 package
