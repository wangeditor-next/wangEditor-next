/**
 * @description indent - text style to html test
 * @author wangfupeng
 */

import { styleToHtml } from '../../src/modules/indent/style-to-html'

describe('indent - text style to html', () => {
  it('text style to html', () => {
    const indent = '2em'
    const elem = { type: 'paragraph', indent, children: [] }
    const html = styleToHtml(elem, '<p>hello</p>')

    expect(html).toBe(`<p style="text-indent: ${indent};">hello</p>`)
  })

  it('text style to html with class mode', () => {
    const indent = '2em'
    const elem = { type: 'paragraph', indent, children: [] }
    const editor = {
      getConfig() {
        return { textStyleMode: 'class' as const }
      },
    }
    const html = styleToHtml(elem, '<p>hello</p>', editor as any)

    expect(html).toContain('class="')
    expect(html).toContain('data-w-e-indent="2em"')
    expect(html).not.toContain('style=')
  })
})
