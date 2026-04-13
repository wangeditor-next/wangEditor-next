/**
 * @description color - text style to html test
 * @author wangfupeng
 */

import { styleToHtml } from '../../src/modules/color/style-to-html'

describe('color - text style to html', () => {
  it('color to html', () => {
    const color = 'rgb(51, 51, 51)'
    const bgColor = 'rgb(204, 204, 204)'
    const textNode = { text: '', color, bgColor }

    let html = styleToHtml(textNode, '<span>hello</span>')

    expect(html).toBe(`<span style="color: ${color}; background-color: ${bgColor};">hello</span>`)

    // 测试纯文本
    html = styleToHtml(textNode, 'hello')
    expect(html).toBe(`<span style="color: ${color}; background-color: ${bgColor};">hello</span>`)

    // 测试 非 span 标签
    html = styleToHtml(textNode, '<p>hello</p>')
    expect(html).toBe(
      `<span style="color: ${color}; background-color: ${bgColor};"><p>hello</p></span>`,
    )
  })

  it('color to html with class mode', () => {
    const color = 'rgb(66, 144, 247)'
    const bgColor = 'rgb(231, 246, 213)'
    const textNode = { text: '', color, bgColor }
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }

    const html = styleToHtml(textNode, '<span>hello</span>', editor as any)

    expect(html).toContain('class="')
    expect(html).toContain('data-w-e-color="rgb(66, 144, 247)"')
    expect(html).toContain('data-w-e-bg-color="rgb(231, 246, 213)"')
    expect(html).not.toContain('style="')
  })
})
