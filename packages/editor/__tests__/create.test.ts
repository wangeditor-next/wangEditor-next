/**
 * @description create editor and toolbar test
 * @author wangfupeng
 */

import Boot from '../../../packages/editor/src/Boot'
import { ICreateEditorOption, ICreateToolbarOption } from '../../../packages/editor/src/create'
import { createEditor, createToolbar } from '../../../packages/editor/src/index'
import { DOMElement } from '../../../packages/editor/src/utils/dom'

function customCreateEditor(config: Partial<ICreateEditorOption> = {}) {
  const editorContainer = document.createElement('div')

  document.body.appendChild(editorContainer)

  // create editor
  const editor = createEditor({
    selector: editorContainer,
    ...config,
  })

  const globalScope = globalThis as any

  if (!globalScope.testEditors) {
    globalScope.testEditors = new Set()
  }
  globalScope.testEditors.add(editor)

  return editor
}

function customCreateToolbar(config: Partial<ICreateToolbarOption> = {}) {
  const toolbarContainer = document.createElement('div')

  document.body.appendChild(toolbarContainer)

  // create editor
  const editor = customCreateEditor()

  // create toolbar
  const toolbar = createToolbar({
    editor,
    selector: toolbarContainer as DOMElement,
    ...config,
  })

  return toolbar
}

describe('create editor and toolbar', () => {
  test('create editor selector undefind', () => {
    const editor = customCreateEditor()

    expect(() => {
      createToolbar({
        editor,
        selector: undefined as any,
      })
    }).toThrow('Cannot find \'selector\' when create toolbar')
  })

  test('test new Boot and registerModule', () => {
    expect(() => {
      const boot = new Boot()

      console.log(boot)
    }).toThrow('不能实例化\nCan not construct a instance')
  })

  test('create editor with default mode', () => {
    const editor = customCreateEditor()

    expect(editor.id).not.toBeNull()
  })

  test('create editor with default mode that has text hoverbar', () => {
    const editor = customCreateEditor()
    const config = editor.getConfig()

    expect(config.hoverbarKeys!.text).not.toBeNull()
  })

  test('create editor with simple mode', () => {
    const editor = customCreateEditor({
      mode: 'simple',
    })

    expect(editor.id).not.toBeNull()
  })

  test('create editor with simple mode that does not has text hoverbar', () => {
    const editor = customCreateEditor({
      mode: 'simple',
    })
    const config = editor.getConfig()

    expect(config.hoverbarKeys!.text).toBeUndefined()
  })

  test('create editor can not be called twice with same container', () => {
    const editorContainer = document.createElement('div')

    document.body.appendChild(editorContainer)
    // create editor
    customCreateEditor({
      selector: editorContainer,
    })

    try {
      customCreateEditor({
        selector: editorContainer,
      })
    } catch (err) {
      expect((err as Error).message.indexOf('Repeated create editor by selector')).not.toBe(-1)
    }
  })

  test('create toolbar with default mode', () => {
    const toolbar = customCreateToolbar()

    expect(toolbar.$box).not.toBeNull()
  })

  test('create toolbar with simple mode', () => {
    const toolbar = customCreateToolbar({
      mode: 'simple',
    })

    expect(toolbar.$box).not.toBeNull()
  })

  test('create toolbar with simple mode that the config hoverbarKeys is different from default mode', () => {
    const simpleToolbar = customCreateToolbar({
      mode: 'simple',
    })
    const defaultToolbar = customCreateToolbar()

    expect(simpleToolbar.getConfig().toolbarKeys).not.toEqual(
      defaultToolbar.getConfig().toolbarKeys,
    )
  })

  test('create toolbar can not be called twice with same container', () => {
    const toolbarContainer = document.createElement('div')

    document.body.appendChild(toolbarContainer)

    customCreateToolbar({
      selector: toolbarContainer,
    })
    try {
      customCreateToolbar({
        selector: toolbarContainer,
      })
    } catch (err) {
      expect((err as Error).message.indexOf('Repeated create toolbar by selector')).not.toBe(-1)
    }
  })

  test('create editor with html', () => {
    const html = `<h1>header</h1>
<p>hello&nbsp;<strong>world</strong>
</p><p><br></p>`

    const editor = customCreateEditor({ html })

    expect(editor.children).toEqual([
      { type: 'header1', children: [{ text: 'header' }] },
      {
        type: 'paragraph',
        children: [{ text: 'hello ' }, { text: 'world', bold: true }],
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ])
  })

  test('getHtml keeps images imported from span-wrapped html', () => {
    const html = '<p><span><img src="https://example.com/test.png" alt="Image" width="836" height="435" /></span></p><p>123</p>'

    const editor = customCreateEditor({ html })
    const exportedHtml = editor.getHtml()

    expect(exportedHtml).toContain('<img')
    expect(exportedHtml).toContain('src="https://example.com/test.png"')
    expect(exportedHtml).toContain('<p>123</p>')
  })

  test('getHtml exports explicit table width when imported table uses colgroup widths', () => {
    const html = `<table style="width: auto;table-layout: fixed;height:auto">
      <colgroup contentEditable="false">
        <col width="120"></col>
        <col width="80"></col>
      </colgroup>
      <tbody>
        <tr><td>A</td><td>B</td></tr>
      </tbody>
    </table>`

    const editor = customCreateEditor({ html })
    const exportedHtml = editor.getHtml()

    expect(exportedHtml).toContain('style="width: 200px;table-layout: fixed;')
    expect(exportedHtml).toContain('<colgroup contentEditable="false"><col width=120></col><col width=80></col></colgroup>')
  })
})
