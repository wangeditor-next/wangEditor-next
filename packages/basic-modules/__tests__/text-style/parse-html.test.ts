/**
 * @description parse html test
 * @author wangfupeng
 */

import { parseStyleHtml } from '../../src/modules/text-style/parse-style-html'

describe('text style - parse style html', () => {
  const createElem = (html: string) => {
    const wrapper = document.createElement('div')

    wrapper.innerHTML = html
    return wrapper.firstElementChild as Element
  }

  it('parse style tags', () => {
    const cases = [
      { html: '<b>hello</b>', key: 'bold' },
      { html: '<strong>hello</strong>', key: 'bold' },
      { html: '<i>hello</i>', key: 'italic' },
      { html: '<em>hello</em>', key: 'italic' },
      { html: '<u>hello</u>', key: 'underline' },
      { html: '<s>hello</s>', key: 'through' },
      { html: '<strike>hello</strike>', key: 'through' },
      { html: '<sub>hello</sub>', key: 'sub' },
      { html: '<sup>hello</sup>', key: 'sup' },
      { html: '<code>hello</code>', key: 'code' },
      { html: '<span><b>hello</b></span>', key: 'bold' },
    ]

    cases.forEach(({ html, key }) => {
      const elem = createElem(html)
      const textNode = { text: 'hello' }
      const res = parseStyleHtml(elem, textNode, null as any) as any

      expect(res.text).toBe('hello')
      expect(res[key]).toBeTruthy()
    })
  })
})
