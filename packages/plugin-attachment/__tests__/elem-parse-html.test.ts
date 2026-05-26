import { AttachmentElement } from '../src'
import elemToHtmlConf from '../src/module/elem-to-html'
import parseHtmlConf from '../src/module/parse-elem-html'

describe('plugin-attachment elem/parse html', () => {
  const elem: AttachmentElement = {
    type: 'attachment',
    fileName: 'demo.zip',
    link: 'https://example.com/demo.zip',
    children: [{ text: '' }],
  }

  it('elemToHtml should output expected html', () => {
    const html = elemToHtmlConf.elemToHtml(elem, '')

    expect(html).toBe('<a data-w-e-type="attachment" data-w-e-is-void data-w-e-is-inline href="https://example.com/demo.zip" download="demo.zip">demo.zip</a>')
  })

  it('parseHtml should parse attachment attrs', () => {
    const dom = document.createElement('a')

    dom.setAttribute('data-w-e-type', 'attachment')
    dom.setAttribute('href', 'https://example.com/demo.zip')
    dom.setAttribute('download', 'demo.zip')

    expect(dom.matches(parseHtmlConf.selector)).toBeTruthy()

    const res = parseHtmlConf.parseElemHtml(dom, [], {} as any)

    expect(res).toEqual({
      type: 'attachment',
      fileName: 'demo.zip',
      link: 'https://example.com/demo.zip',
      children: [{ text: '' }],
    })
  })

  it('html should be stable after parse -> toHtml round-trip', () => {
    const firstHtml = elemToHtmlConf.elemToHtml(elem, '')
    const dom = document.createElement('div')

    dom.innerHTML = firstHtml

    const parsedElem = parseHtmlConf.parseElemHtml(dom.firstElementChild as Element, [], {} as any)
    const roundTripHtml = elemToHtmlConf.elemToHtml(parsedElem as any, '')

    expect(roundTripHtml).toBe(firstHtml)
  })
})
