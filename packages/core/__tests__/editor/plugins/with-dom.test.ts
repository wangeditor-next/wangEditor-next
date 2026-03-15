/**
 * @description editor DOM API test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import flushPromises from '../../../../../tests/utils/flush-promises'
import createBasicEditor from '../../../src/create/create-editor'
import { DomEditor } from '../../../src/editor/dom-editor'
import { withDOM } from '../../../src/editor/plugins/with-dom'
import { EDITOR_TO_SELECTION } from '../../../src/utils/weak-maps'
import createCoreEditor, { createToolbar } from '../../create-core-editor' // packages/core 不依赖 packages/editor ，不能使用后者的 createEditor

function createEditor(...args) {
  return withDOM(createCoreEditor(...args))
}

describe('editor DOM API', () => {
  function getStartLocation(editor) {
    return Editor.start(editor, [])
  }

  it('editor id', () => {
    const editor = createEditor()

    expect(editor.id).not.toBeNull()
  })

  it('destroy', async () => {
    const editorConfig = { hoverbarKeys: {} }

    editorConfig.hoverbarKeys = {
      text: {
        menuKeys: ['bold', 'insertLink'],
      },
      link: {
        menuKeys: ['editLink', 'unLink', 'viewLink'],
      },
      image: {
        menuKeys: [
          'imageWidth30',
          'imageWidth50',
          'imageWidth100',
          'editImage',
          'viewImageLink',
          'deleteImage',
        ],
      },
      // 其他参考 https://github.com/wangeditor-next/wangeditor-next/blob/master/packages/editor/src/init-default-config/config/hoverbar.ts
    }
    const editor = createEditor({ config: editorConfig })

    createToolbar(editor)
    expect(editor.isDestroyed).toBeFalsy()

    await flushPromises()
    editor.destroy()
    expect(editor.isDestroyed).toBeTruthy()
  })

  it('scroll to elem', async () => {
    const container = document.createElement('div')

    container.setAttribute('id', 'editor-text-area')
    document.body.appendChild(container)
    const editor = createBasicEditor({
      selector: '#editor-text-area',
    })

    await flushPromises()
    const textarea = DomEditor.getTextarea(editor)
    const target = document.createElement('div')

    target.setAttribute('id', 'scroll-target')
    const editorDom = DomEditor.toDOMNode(editor, editor)

    editorDom.appendChild(target)

    const scrollElem = textarea.$scroll[0] as any

    scrollElem.scrollBy = vi.fn()

    editor.scrollToElem('scroll-target')
    expect(scrollElem.scrollBy).toHaveBeenCalled()
  })

  it('isFullScreen fullScreen unFullScreen', () => {
    vi.useFakeTimers()
    const editor = createEditor()

    createToolbar(editor)

    expect(editor.isFullScreen).toBeFalsy()

    editor.fullScreen()
    expect(editor.isFullScreen).toBeTruthy()

    editor.unFullScreen()
    vi.advanceTimersByTime(200)
    expect(editor.isFullScreen).toBeFalsy()
    vi.useRealTimers()
  })

  it('toDOMNode', async () => {
    const p = { type: 'paragraph', children: [{ text: 'hello' }] }
    const editor = createEditor({
      content: [p],
    })

    await flushPromises()
    const domNode = editor.toDOMNode(p)

    expect(domNode.tagName).toBe('DIV')
  })

  it('foucus', () => {
    const editor = createEditor(
      { content: [{ type: 'paragraph', children: [{ text: 'Hello' }] }] },
    )

    editor.focus()
    // 测试选区定位到开始
    expect(editor.selection).toStrictEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    })
    editor.select([])
    const selection = {
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    }

    if (selection != null) {
      EDITOR_TO_SELECTION.set(editor, selection)
    }
    editor.focus()
    // 测试选区定位到 EDITOR_TO_SELECTION 记录的之前的位置
    expect(editor.selection).toStrictEqual({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 3, path: [0, 0] },
    })
    editor.select([])
    editor.focus(true)
    // 测试选区定位到结尾
    expect(editor.selection).toStrictEqual({
      anchor: { offset: 5, path: [0, 0] },
      focus: { offset: 5, path: [0, 0] },
    })
  })

  it('blur isFocused', async () => {
    const editor = createEditor()

    await flushPromises()
    expect(editor.isFocused()).toBeFalsy()

    editor.focus()
    expect(editor.isFocused()).toBeTruthy()

    editor.blur()
    expect(editor.isFocused()).toBeFalsy()
    expect(editor.selection).toBeNull()
  })

  it('disable isDisabled enable', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor))

    expect(editor.isDisabled()).toBeFalsy()
    editor.insertText('123')
    expect(editor.getText().length).toBe(3)

    editor.disable()
    expect(editor.isDisabled()).toBeTruthy()
    editor.insertText('123') // disabled ，不会插入
    expect(editor.getText().length).toBe(3)

    editor.enable()
    expect(editor.isDisabled()).toBeFalsy()
    editor.insertText('123') // enable ，可以插入
    expect(editor.getText().length).toBe(6)
  })
})
