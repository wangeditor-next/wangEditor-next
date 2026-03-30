/**
 * @description justify - text style to html test
 * @author wangfupeng
 */

import { styleToHtml } from '../../src/modules/justify/style-to-html'

describe('justify text-style-to-html', () => {
  it('text style to html', () => {
    const elem = { type: 'paragraph', textAlign: 'center', children: [] }
    const html = styleToHtml(elem, '<span>hello</span>')

    expect(html).toBe('<span style="text-align: center;">hello</span>')
  })

  it('text style to html with class mode', () => {
    const elem = { type: 'paragraph', textAlign: 'center', children: [] }
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }
    const html = styleToHtml(elem, '<span>hello</span>', editor as any)

    expect(html).toContain('class="')
    expect(html).toContain('data-w-e-text-align="center"')
    expect(html).not.toContain('style=')
  })
})
