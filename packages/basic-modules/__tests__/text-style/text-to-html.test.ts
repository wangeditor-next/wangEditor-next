/**
 * @description text to html test
 * @author wangfupeng
 */

import { styleToHtml } from '../../src/modules/text-style/style-to-html'

describe('text style - text to html', () => {
  it('text to html', () => {
    const textNode = {
      text: '',
      bold: true,
      italic: true,
      underline: true,
      code: true,
      through: true,
      sub: true,
      sup: true,
    }

    // is plain text
    const html1 = styleToHtml(textNode, 'hello')

    expect(html1).toBe(
      '<sup><sub><s><u><em><code><strong>hello</strong></code></em></u></s></sub></sup>',
    )

    // is text tag (exclude <br>)
    const html2 = styleToHtml(textNode, '<span>world</span>')

    expect(html2).toBe(
      '<span><sup><sub><s><u><em><code><strong>world</strong></code></em></u></s></sub></sup></span>',
    )
  })

  it('serializes independent underline decorations', () => {
    const textNode = {
      text: 'hello',
      underline: true,
      wavyUnderline: true,
      emphasisDot: true,
    }

    expect(styleToHtml(textNode, 'hello')).toBe(
      '<span style="text-emphasis-style: filled dot; text-emphasis-position: under left; line-height: 2;">' +
        '<span style="text-decoration-line: underline; text-decoration-style: wavy; ' +
        'text-underline-offset: 0.8em;"><u style="text-underline-offset: 0.15em;">hello</u></span>' +
        '</span>'
    )

    expect(styleToHtml(textNode, '<span>world</span>')).toBe(
      '<span><span style="text-emphasis-style: filled dot; text-emphasis-position: under left; line-height: 2;">' +
        '<span style="text-decoration-line: underline; text-decoration-style: wavy; ' +
        'text-underline-offset: 0.8em;"><u style="text-underline-offset: 0.15em;">world</u></span>' +
        '</span></span>'
    )
  })

  it('uses static classes for independent underline decorations in class mode', () => {
    const textNode = {
      text: 'hello',
      underline: true,
      wavyUnderline: true,
      emphasisDot: true,
    }
    const editor = {
      getConfig: () => ({ textStyleMode: 'class' as const, classStylePolicy: 'strict' as const }),
    }

    expect(styleToHtml(textNode, 'hello', editor as any)).toBe(
      '<span class="w-e-text-style-emphasis-dot w-e-text-style-emphasis-dot-with-wavy">' +
        '<span class="w-e-text-style-wavy-underline w-e-text-style-wavy-underline-with-emphasis">' +
        '<u class="w-e-text-style-underline-offset">hello</u></span></span>'
    )
  })
})
