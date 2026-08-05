/**
 * @description text style test
 * @author wangfupeng
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx } from 'snabbdom'

import { StyledText } from '../../src/modules/text-style/custom-types'
import { renderStyle } from '../../src/modules/text-style/render-style'

describe('text style - render text style', () => {
  it('render text style', () => {
    const vnode = <span>hello</span>
    let newVnode

    const textNode: StyledText = { text: '' }

    textNode.bold = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('strong')

    textNode.code = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('code')

    textNode.italic = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('em')

    textNode.underline = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('u')

    textNode.through = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('s')

    textNode.sub = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('sub')

    textNode.sup = true
    // @ts-ignore 忽略 vnode 格式
    newVnode = renderStyle(textNode, vnode)
    expect(newVnode.sel).toBe('sup')
  })

  it('renders wavy underline and lower dot emphasis as independent wrappers', () => {
    const vnode = <span>hello</span>
    const textNode: StyledText = {
      text: 'hello',
      underline: true,
      wavyUnderline: true,
      emphasisDot: true,
    }

    // @ts-ignore 忽略 vnode 格式
    const rendered = renderStyle(textNode, vnode) as any

    expect(rendered.sel).toBe('span')
    expect(rendered.data.style).toEqual({
      textEmphasisStyle: 'filled dot',
      textEmphasisPosition: 'under left',
      lineHeight: '2',
    })

    const wavyVnode = rendered.children[0]

    expect(wavyVnode.sel).toBe('span')
    expect(wavyVnode.data.style).toEqual({
      textDecorationLine: 'underline',
      textDecorationStyle: 'wavy',
      textUnderlineOffset: '0.8em',
    })

    const underlineVnode = wavyVnode.children[0]

    expect(underlineVnode.sel).toBe('u')
    expect(underlineVnode.data.style).toEqual({ textUnderlineOffset: '0.15em' })
  })

  it('uses static classes for independent underline decorations in class mode', () => {
    const vnode = <span>hello</span>
    const textNode: StyledText = {
      text: 'hello',
      underline: true,
      wavyUnderline: true,
      emphasisDot: true,
    }
    const editor = {
      getConfig: () => ({ textStyleMode: 'class' as const }),
    }

    // @ts-ignore 忽略 vnode 格式
    const rendered = renderStyle(textNode, vnode, editor) as any

    expect(rendered.data.props.className).toBe(
      'w-e-text-style-emphasis-dot w-e-text-style-emphasis-dot-with-wavy'
    )
    expect(rendered.data.style).toBeUndefined()

    const wavyVnode = rendered.children[0]

    expect(wavyVnode.data.props.className).toBe(
      'w-e-text-style-wavy-underline w-e-text-style-wavy-underline-with-emphasis'
    )
    expect(wavyVnode.data.style).toBeUndefined()

    const underlineVnode = wavyVnode.children[0]

    expect(underlineVnode.data.props.className).toBe('w-e-text-style-underline-offset')
    expect(underlineVnode.data.style).toBeUndefined()
  })
})
