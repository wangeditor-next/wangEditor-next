/**
 * @description color - render text style test
 * @author wangfupeng
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from 'snabbdom'

import { renderStyle } from '../../src/modules/color/render-style'

describe('color - render text style', () => {
  it('render color style', () => {
    const color = 'rgb(51, 51, 51)'
    const bgColor = 'rgb(204, 204, 204)'
    const textNode = { text: 'hello', color, bgColor }
    const vnode = <span>hello</span>

    // @ts-ignore
    const newVnode = renderStyle(textNode, vnode) as any

    expect(newVnode.sel).toBe('span')
    expect(newVnode.data.style.color).toBe(color)
    expect(newVnode.data.style.backgroundColor).toBe(bgColor)
  })

  it('render color class in class mode', () => {
    const color = 'rgb(51, 51, 51)'
    const bgColor = 'rgb(204, 204, 204)'
    const textNode = { text: 'hello', color, bgColor }
    const vnode = <span>hello</span>
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }

    // @ts-ignore
    const newVnode = renderStyle(textNode, vnode, editor) as any

    expect(newVnode.sel).toBe('span')
    expect(newVnode.data.style).toBeUndefined()
    expect(newVnode.data.props.className).toContain('w-e-color-')
    expect(newVnode.data.props.className).toContain('w-e-bg-color-')
    expect(newVnode.data.dataset.wEColor).toBe(color)
    expect(newVnode.data.dataset.wEBgColor).toBe(bgColor)
  })
})
