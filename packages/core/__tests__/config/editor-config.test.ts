/**
 * @description editor config test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import flushPromises from '../../../../tests/utils/flush-promises'
import createCoreEditor from '../create-core-editor' // packages/core 不依赖 packages/editor ，不能使用后者的 createEditor

describe('editor config', () => {
  function getStartLocation(editor) {
    return Editor.start(editor, [])
  }

  it('if set placeholder option, it will show placeholder element when editor content is empty', () => {
    const container = document.createElement('div')

    createCoreEditor({
      selector: container,
      config: {
        placeholder: 'editor placeholder',
      },
    })
    const el = container.querySelector('.w-e-text-placeholder')

    expect(el!.textContent).toBe('editor placeholder')
  })

  it('if set placeholder option, it will hide placeholder element when editor content is not empty', () => {
    const container = document.createElement('div')

    createCoreEditor({
      selector: container,
      config: {
        placeholder: 'editor placeholder',
      },
      content: [{ type: 'paragraph', children: [{ text: '123' }] }],
    })
    const el = container.querySelector('.w-e-text-placeholder')

    expect(el).toBeNull()
  })

  it('if set readOnly option, isDisabled return true', () => {
    const editor = createCoreEditor({
      config: {
        readOnly: true,
      },
    })

    expect(editor.isDisabled()).toBeTruthy()
  })

  it('if set readOnly option, can not insert text to editor', () => {
    const editor = createCoreEditor({
      config: {
        readOnly: true,
      },
    })

    editor.select(getStartLocation(editor))
    editor.insertText('xxx') // readOnly 时无法插入文本
    expect(editor.getText()).toBe('')
  })

  it('if set maxLength option, the editor can not update content when text length is equal to maxLength', async () => {
    const editor = createCoreEditor({
      config: {
        maxLength: 10,
        onMaxLength: () => {
          // 触发回调，才能完成该测试
        },
      },
    })

    editor.select(getStartLocation(editor))

    // 插入 9 个字符，小于 maxLength
    editor.insertText('123456789')
    expect(editor.getText()).toBe('123456789')

    // 再插入其他字符，则只能插入一个
    editor.insertText('abc')
    expect(editor.getText()).toBe('123456789a')
  })

  it('if set onCreated option, it will be called when created editor', async () => {
    const fn = vi.fn()

    createCoreEditor({
      config: {
        onCreated: fn,
      },
    })

    await flushPromises()
    expect(fn).toHaveBeenCalled()
  })

  it('if set onChange option, it will be called when change editor selection', async () => {
    const fn = vi.fn()

    const editor = createCoreEditor({
      config: {
        onChange: fn,
      },
      content: [{ type: 'paragraph', children: [{ text: 'abc' }] }],
    })

    await flushPromises()
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 1 },
    }) // 选区变化，触发 onchange
    await flushPromises()
    expect(fn).toHaveBeenCalledWith(editor)
  })

  it('if set onChange option, it will be called when change editor content', async () => {
    const fn = vi.fn()

    const editor = createCoreEditor({
      config: {
        onChange: fn,
      },
    })

    await flushPromises()
    editor.select(getStartLocation(editor))
    fn.mockClear()
    editor.insertText('123')
    await flushPromises()
    expect(fn).toHaveBeenCalledWith(editor)
  })

  it('if set onDestroyed option, it will be called when destroy editor', async () => {
    const fn = vi.fn()
    const editor = createCoreEditor({
      config: {
        onDestroyed: fn,
      },
    })

    await flushPromises()
    editor.destroy()
    expect(fn).toHaveBeenCalledWith(editor)
  })

  it('if set onFocus/onBlur option, it will be called on selection changes', async () => {
    vi.useFakeTimers()
    const onFocus = vi.fn()
    const onBlur = vi.fn()

    const editor = createCoreEditor({
      config: {
        onFocus,
        onBlur,
      },
    })

    await flushPromises()
    editor.select(getStartLocation(editor))
    editor.onChange()
    vi.runAllTimers()
    expect(onFocus).toHaveBeenCalledWith(editor)

    editor.deselect()
    editor.onChange()
    vi.runAllTimers()
    expect(onBlur).toHaveBeenCalledWith(editor)
    vi.useRealTimers()
  })
})
