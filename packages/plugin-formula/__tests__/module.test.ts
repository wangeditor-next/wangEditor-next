import { DomEditor } from '@wangeditor-next/editor'
import { afterEach, vi } from 'vitest'

import module from '../src'

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
})
