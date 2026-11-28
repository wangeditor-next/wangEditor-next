/**
 * @description link - elem to html test
 * @author wangfupeng
 */

import { linkToHtmlConf } from '../../src/modules/link/elem-to-html'

describe('link elem to html', () => {
  it('link to html', () => {
    expect(linkToHtmlConf.type).toBe('link')

    const url = 'https://www.wangeditor.com/'
    const target = '_blank'
    const elem = {
      type: 'link', url, target, children: [],
    }

    const html = linkToHtmlConf.elemToHtml(elem, 'hello')

    expect(html).toBe(`<a href="${url}" target="${target}">hello</a>`)
  })

  it('escapes the href attribute while preserving URL percent escapes', () => {
    const elem = {
      type: 'link',
      url: 'https://example.org/a%20b?x="a"&y=&copy;',
      children: [{ text: 'docs' }],
    }

    expect(linkToHtmlConf.elemToHtml(elem, 'docs')).toBe(
      '<a href="https://example.org/a%20b?x=&quot;a&quot;&amp;y=&amp;copy;" target="_blank">docs</a>',
    )
  })
})
