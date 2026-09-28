import {
  Boot,
  createEditor,
  DomEditor,
  SlateEditor,
  SlateTransforms,
} from '@wangeditor-next/editor'
import { afterEach, vi } from 'vitest'

import module from '../src'

Boot.registerModule(module)

afterEach(() => {
  vi.restoreAllMocks()
})

describe('plugin-formula module', () => {
  it('exposes module config', () => {
    expect(module).toBeTruthy()
    expect(typeof module.editorPlugin).toBe('function')
    expect(module.renderElems?.length).toBeGreaterThan(0)
    expect(module.elemsToHtml?.length).toBeGreaterThan(0)
    expect(module.parseElemsHtml?.length).toBeGreaterThan(0)
    expect(module.menus?.length).toBeGreaterThan(0)
  })

  it('constrains wide formulas to the editor width', () => {
    vi.spyOn(DomEditor, 'isNodeSelected').mockReturnValue(false)

    const renderElem = module.renderElems?.[0].renderElem
    const vnode = renderElem?.(
      { type: 'formula', value: 'x', children: [{ text: '' }] },
      null,
      {} as any,
    ) as any

    expect(vnode.data.style.maxWidth).toBe('100%')
    expect(vnode.data.style.overflowX).toBe('auto')
  })

  it('updates a formula after the editor loses focus while its modal is open', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    const editor = createEditor({
      selector: container,
      html: '<p><span data-w-e-type="formula" data-w-e-is-void data-w-e-is-inline data-value="x"></span></p>',
      mode: 'simple',
    })

    await new Promise(resolve => setTimeout(resolve, 0))

    const [, formulaPath] = [...SlateEditor.nodes(editor, {
      at: [],
      match: node => 'type' in node && node.type === 'formula',
      universal: true,
    })][0] as any

    SlateTransforms.select(editor, {
      anchor: { path: [...formulaPath, 0], offset: 0 },
      focus: { path: [...formulaPath, 0], offset: 0 },
    })
    editor.onChange()

    const menu = (module.menus?.find(item => item.key === 'editFormula') as any).factory()
    const content = menu.getModalContentElem(editor)
    const textarea = content.querySelector('textarea') as HTMLTextAreaElement

    textarea.value = 'y'

    editor.blur()
    expect(editor.selection).toBeNull()
    expect(() => (content.querySelector('button') as HTMLButtonElement).click()).not.toThrow()

    const updatedFormula = (editor.children[0] as any).children
      .find((node: any) => node.type === 'formula')

    expect(updatedFormula.value).toBe('y')
    editor.destroy()
  })
})
