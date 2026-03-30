/**
 * @description indent - render text style
 * @author wangfupeng
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from 'snabbdom'

import { renderStyle } from '../../src/modules/indent/render-style'

describe('indent - render text style', () => {
  it('render text style', () => {
    const indent = '2em'
    const elem = { type: 'paragraph', indent, children: [] }
    const vnode = <p>hello</p>

    // @ts-ignore
    const newVnode = renderStyle(elem, vnode)
    // @ts-ignore

    expect(newVnode.data.style.textIndent).toBe(indent)
  })

  it('render text style with class mode', () => {
    const indent = '2em'
    const elem = { type: 'paragraph', indent, children: [] }
    const vnode = <p>hello</p>
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }

    // @ts-ignore
    const newVnode = renderStyle(elem, vnode, editor)
    // @ts-ignore

    expect(newVnode.data.style).toBeUndefined()
    // @ts-ignore
    expect(newVnode.data.props.className).toContain('w-e-indent-')
    // @ts-ignore
    expect(newVnode.data.dataset.wEIndent).toBe(indent)
  })
})
