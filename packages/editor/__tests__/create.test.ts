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
    const createBoot = () => new Boot()

    expect(() => {
      createBoot()
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
    expect(exportedHtml).not.toContain('height:NaN')
    expect(exportedHtml).toContain('<colgroup contentEditable="false"><col width=120></col><col width=80></col></colgroup>')
  })

  test('class mode preserve-data policy keeps unknown token through setHtml/getHtml', () => {
    const html = '<p><span style="color: rgb(1, 2, 3);">hello</span></p>'
    const editor = customCreateEditor({
      html,
      config: {
        textStyleMode: 'class',
      },
    })

    const exportedHtml = editor.getHtml()

    expect(exportedHtml).toContain('data-w-e-color="rgb(1, 2, 3)"')
    expect(exportedHtml).not.toMatch(/class="[^"]*w-e-color-/)
    expect(exportedHtml).not.toMatch(/style="[^"]*color:/)

    editor.setHtml(exportedHtml)
    const roundTripHtml = editor.getHtml()

    expect(roundTripHtml).toContain('data-w-e-color="rgb(1, 2, 3)"')
    expect(roundTripHtml).not.toMatch(/class="[^"]*w-e-color-/)
    expect(roundTripHtml).not.toMatch(/style="[^"]*color:/)
  })

  test('class mode supports custom styleClassTokens in round-trip', () => {
    const html = '<p><span style="color: rgb(1, 2, 3);">hello</span></p>'
    const editor = customCreateEditor({
      html,
      config: {
        textStyleMode: 'class',
        styleClassTokens: {
          color: ['rgb(1, 2, 3)'],
        },
      },
    })

    const exportedHtml = editor.getHtml()

    expect(exportedHtml).toContain('data-w-e-color="rgb(1, 2, 3)"')
    expect(exportedHtml).toMatch(/class="[^"]*w-e-color-/)
    expect(exportedHtml).not.toMatch(/style="[^"]*color:/)

    editor.setHtml(exportedHtml)
    const roundTripHtml = editor.getHtml()

    expect(roundTripHtml).toContain('data-w-e-color="rgb(1, 2, 3)"')
    expect(roundTripHtml).toMatch(/class="[^"]*w-e-color-/)
    expect(roundTripHtml).not.toMatch(/style="[^"]*color:/)
  })

  test('class mode strict policy throws for unsupported token', () => {
    const html = '<p><span style="color: rgb(1, 2, 3);">hello</span></p>'
    const editor = customCreateEditor({
      html,
      config: {
        textStyleMode: 'inline',
      },
    })

    editor.getConfig().textStyleMode = 'class'
    editor.getConfig().classStylePolicy = 'strict'

    expect(() => editor.getHtml()).toThrow('policy=strict')
  })

  test('class mode round-trip keeps list image video table module attrs', () => {
    const html = `
<ul><li style="color: rgb(66, 144, 247);"><span style="color: rgb(66, 144, 247);">hello</span></li></ul>
<p><img src="https://example.com/a.png" alt="a" data-href="https://example.com" style="width: 120px;height: 80px;"/></p>
<div data-w-e-type="video" data-w-e-is-void style="text-align: right;">
<video poster="poster.png" controls="true" width="640" height="360" style="width: 640px;height: 360px;"><source src="test.mp4" type="video/mp4"/></video>
</div>
<table style="width: 100%;table-layout: fixed;height:60px"><tbody><tr style="height: 50px"><td style="text-align: right;border-style: dashed;border-width: 2px;border-color: rgb(10, 20, 30);background-color: rgb(0, 0, 0);">A</td></tr></tbody></table>
`

    const editor = customCreateEditor({
      html,
      config: {
        textStyleMode: 'class',
      },
    })

    const exportedHtml = editor.getHtml()

    expect(exportedHtml).toContain('w-e-list-color-')
    expect(exportedHtml).toContain('data-w-e-color="rgb(66, 144, 247)"')

    expect(exportedHtml).toContain('data-w-e-style-width="120px"')
    expect(exportedHtml).toContain('data-w-e-style-height="80px"')
    expect(exportedHtml).not.toMatch(/<img[^>]*style=/)

    expect(exportedHtml).toContain('data-w-e-type="video"')
    expect(exportedHtml).toContain('w-e-video-align-right')
    expect(exportedHtml).toContain('data-w-e-style-width="640px"')
    expect(exportedHtml).toContain('data-w-e-style-height="360px"')
    expect(exportedHtml).not.toMatch(/<div data-w-e-type="video"[^>]*style=/)

    expect(exportedHtml).toContain('w-e-table-layout-fixed')
    expect(exportedHtml).toContain('data-w-e-row-height="50px"')
    expect(exportedHtml).toContain('w-e-table-border-style-dashed')
    expect(exportedHtml).toContain('data-w-e-border-width="2px"')
    expect(exportedHtml).toContain('data-w-e-border-color="rgb(10, 20, 30)"')
    expect(exportedHtml).not.toMatch(/<table[^>]*style=/)
    expect(exportedHtml).not.toMatch(/<tr[^>]*style=/)

    editor.setHtml(exportedHtml)
    const roundTripHtml = editor.getHtml()

    expect(roundTripHtml).toContain('w-e-list-color-')
    expect(roundTripHtml).toContain('data-w-e-color="rgb(66, 144, 247)"')
    expect(roundTripHtml).toContain('data-w-e-style-width="120px"')
    expect(roundTripHtml).toContain('w-e-video-align-right')
    expect(roundTripHtml).toContain('w-e-table-layout-fixed')
    expect(roundTripHtml).toContain('w-e-table-border-style-dashed')
    expect(roundTripHtml).toContain('data-w-e-row-height="50px"')
    expect(roundTripHtml).not.toMatch(/<img[^>]*style=/)
    expect(roundTripHtml).not.toMatch(/<div data-w-e-type="video"[^>]*style=/)
    expect(roundTripHtml).not.toMatch(/<table[^>]*style=/)
    expect(roundTripHtml).not.toMatch(/<tr[^>]*style=/)
  })
})
