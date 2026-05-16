/**
 * @description core composition API test
 */

import type { IDomEditor, IModuleConf } from '@wangeditor-next/core'

import { Boot, createEditorFactory, registerExtensions } from '../../../packages/editor/src/core'

let sequence = 0

function nextKey(prefix: string) {
  sequence += 1
  return `${prefix}-${sequence}`
}

function trackEditor(editor: IDomEditor) {
  const globalScope = globalThis as any

  if (!globalScope.testEditors) {
    globalScope.testEditors = new Set()
  }
  globalScope.testEditors.add(editor)
}

function createHelloModule(menuKey: string): Partial<IModuleConf> {
  class InsertHelloMenu {
    title = 'Insert Hello'

    tag = 'button'

    getValue() {
      return ''
    }

    isActive() {
      return false
    }

    isDisabled() {
      return false
    }

    exec(editor: IDomEditor) {
      const currentHtml = editor.getHtml()

      editor.setHtml(`${currentHtml}<div>Hello from extension.</div>`)
    }
  }

  return {
    menus: [
      {
        key: menuKey,
        factory: () => new InsertHelloMenu(),
      },
    ],
    renderElems: [],
    renderStyle: (_textNode, textVNode) => textVNode,
    elemsToHtml: [],
    styleToHtml: (_textNode, textHtml) => textHtml,
    preParseHtml: [],
    parseElemsHtml: [],
    parseStyleHtml: (_domElem, textNode) => textNode,
    editorPlugin: editor => editor,
  }
}

describe('core composition API', () => {
  test('createEditorFactory creates editor and toolbar with extensions', () => {
    const menuKey = nextKey('insert-hello-menu')
    const extensionKey = nextKey('insert-hello-extension')
    const editorContainer = document.createElement('div')
    const toolbarContainer = document.createElement('div')

    document.body.appendChild(toolbarContainer)
    document.body.appendChild(editorContainer)

    const factory = createEditorFactory({
      extensions: [{ key: extensionKey, module: createHelloModule(menuKey) }],
      toolbarConfig: { toolbarKeys: [menuKey] },
    })

    const { editor, toolbar } = factory.create({
      editor: {
        selector: editorContainer,
        html: '<p>hello</p>',
      },
      toolbar: {
        selector: toolbarContainer,
      },
    })

    trackEditor(editor)

    expect(editor.id).not.toBeNull()
    expect(toolbar).not.toBeNull()
    expect(toolbar?.getConfig().toolbarKeys).toContain(menuKey)
  })

  test('registerExtensions skips duplicate extension references', () => {
    const extension = createHelloModule(nextKey('duplicate-ref-menu'))
    const registerSpy = vi.spyOn(Boot, 'registerModule')
    const before = registerSpy.mock.calls.length

    expect(() => {
      registerExtensions([extension])
      registerExtensions([extension])
    }).not.toThrow()

    expect(registerSpy.mock.calls.length - before).toBe(1)
    registerSpy.mockRestore()
  })

  test('registerExtensions skips duplicate extension keys', () => {
    const extensionKey = nextKey('duplicate-extension-key')
    const registerSpy = vi.spyOn(Boot, 'registerModule')
    const before = registerSpy.mock.calls.length

    expect(() => {
      registerExtensions([
        { key: extensionKey, module: createHelloModule(nextKey('duplicate-key-menu-a')) },
      ])
      registerExtensions([
        { key: extensionKey, module: createHelloModule(nextKey('duplicate-key-menu-b')) },
      ])
    }).not.toThrow()

    expect(registerSpy.mock.calls.length - before).toBe(1)
    registerSpy.mockRestore()
  })
})
