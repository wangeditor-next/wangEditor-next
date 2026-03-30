/**
 * @description font size and family - text style to html test
 * @author wangfupeng
 */

import { styleToHtml } from '../../src/modules/font-size-family/style-to-html'

describe('font size and family - text style to html', () => {
  it('text style to html', () => {
    const fontSize = '20px'
    const fontFamily = '黑体'
    const textNode = { text: '', fontSize, fontFamily }

    const html = styleToHtml(textNode, '<span>hello</span>')

    expect(html).toBe(
      `<span style="font-size: ${fontSize}; font-family: ${fontFamily};">hello</span>`,
    )

    const textHtml = styleToHtml(textNode, 'hello')

    expect(textHtml).toBe(
      `<span style="font-size: ${fontSize}; font-family: ${fontFamily};">hello</span>`,
    )
    const pHtml = styleToHtml(textNode, '<p>hello</p>')

    expect(pHtml).toBe(
      `<span style="font-size: ${fontSize}; font-family: ${fontFamily};"><p>hello</p></span>`,
    )
  })

  it('text style to html with class mode', () => {
    const fontSize = '20px'
    const fontFamily = '黑体'
    const textNode = { text: '', fontSize, fontFamily }
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }

    const html = styleToHtml(textNode, '<span>hello</span>', editor as any)

    expect(html).toContain('class="')
    expect(html).toContain('data-w-e-font-size="20px"')
    expect(html).toContain('data-w-e-font-family="黑体"')
    expect(html).not.toContain('style="')
  })
})
