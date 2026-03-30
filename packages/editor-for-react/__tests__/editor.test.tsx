import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'

import Editor from '../src/components/Editor'

type CreateEditorOptions = {
  config?: {
    onChange?: (editor: any) => void
    onCreated?: (editor: any) => void
    onDestroyed?: (editor: any) => void
  }
  html?: string
}

const createEditor = vi.fn((options: CreateEditorOptions = {}) => {
  let html = options.html || ''

  const editor: any = {
    __react_on_change: undefined,
    getHtml: vi.fn(() => html),
    setHtml: vi.fn((newHtml: string) => {
      html = newHtml
      options.config?.onChange?.(editor)
    }),
    destroy: vi.fn(() => {
      options.config?.onDestroyed?.(editor)
    }),
    setHtmlForTest: (newHtml: string) => {
      html = newHtml
    },
    emitChangeForTest: () => {
      options.config?.onChange?.(editor)
    },
  }

  Promise.resolve().then(() => {
    options.config?.onCreated?.(editor)
    options.config?.onChange?.(editor)
  })

  return editor
})

vi.mock('@wangeditor-next/editor', () => ({
  createEditor: (options: CreateEditorOptions) => createEditor(options),
}))

async function flushPromises() {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await new Promise(resolve => {
      setTimeout(resolve, 0)
    })
  })
}

// 当前测试运行环境会把 tsx 编译到 jsx() 调用，补充全局 jsx 工厂即可执行组件渲染
// eslint-disable-next-line no-underscore-dangle
(globalThis as any).jsx = React.createElement

describe('editor-for-react onChange behavior', () => {
  beforeEach(() => {
    createEditor.mockClear()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('does not trigger onChange during initial mount when html is unchanged', async () => {
    const onChange = vi.fn()
    const onCreated = vi.fn()
    const container = document.createElement('div')

    document.body.appendChild(container)
    await act(async () => {
      ReactDOM.render(
        React.createElement(Editor as any, {
          value: '<p>123</p>',
          onCreated,
          onChange,
          defaultConfig: {},
          mode: 'default',
        }),
        container,
      )
    })

    await flushPromises()
    await flushPromises()

    expect(onCreated).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledTimes(0)

    await act(async () => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })

  it('triggers onChange when editor content actually changes', async () => {
    const onChange = vi.fn()
    const container = document.createElement('div')

    document.body.appendChild(container)
    await act(async () => {
      ReactDOM.render(
        React.createElement(Editor as any, {
          value: '<p>123</p>',
          onChange,
          defaultConfig: {},
          mode: 'default',
        }),
        container,
      )
    })
    await flushPromises()
    await flushPromises()

    const editor = createEditor.mock.results[0].value

    editor.setHtmlForTest('<p>456</p>')
    editor.emitChangeForTest()
    await flushPromises()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange.mock.calls[0][0]).toBe(editor)

    await act(async () => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })

  it('does not trigger onChange when syncing external value updates', async () => {
    const onChange = vi.fn()
    const container = document.createElement('div')

    document.body.appendChild(container)
    await act(async () => {
      ReactDOM.render(
        React.createElement(Editor as any, {
          value: '<p>123</p>',
          onChange,
          defaultConfig: {},
          mode: 'default',
        }),
        container,
      )
    })
    await flushPromises()
    await flushPromises()
    onChange.mockClear()

    await act(async () => {
      ReactDOM.render(
        React.createElement(Editor as any, {
          value: '<p>789</p>',
          onChange,
          defaultConfig: {},
          mode: 'default',
        }),
        container,
      )
    })
    await flushPromises()
    await flushPromises()

    const editor = createEditor.mock.results[0].value

    expect(editor.setHtml).toHaveBeenCalledWith('<p>789</p>')
    expect(onChange).toHaveBeenCalledTimes(0)

    await act(async () => {
      ReactDOM.unmountComponentAtNode(container)
    })
  })
})
