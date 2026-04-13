/**
 * @description justify - render text style test
 * @author wangfupeng
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from 'snabbdom'

import { renderStyle } from '../../src/modules/justify/render-style'

describe('justify - render text style', () => {
  it('render text style', () => {
    const elem = { type: 'paragraph', textAlign: 'center', children: [] }
    const vnode = <span>hello</span>
    // @ts-ignore 忽略 vnode 格式
    const newVnode = renderStyle(elem, vnode)
    // @ts-ignore 忽略 vnode 格式

    expect(newVnode.data.style?.textAlign).toBe('center')
  })

  it('render text style with class mode', () => {
    const elem = { type: 'paragraph', textAlign: 'center', children: [] }
    const vnode = <span>hello</span>
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }
    // @ts-ignore 忽略 vnode 格式
    const newVnode = renderStyle(elem, vnode, editor)
    // @ts-ignore 忽略 vnode 格式

    expect(newVnode.data.style).toBeUndefined()
    // @ts-ignore 忽略 vnode 格式
    expect(newVnode.data.props.className).toContain('w-e-text-align-')
    // @ts-ignore 忽略 vnode 格式
    expect(newVnode.data.dataset.wETextAlign).toBe('center')
  })
})
