import { $ } from 'dom7'

import elemToHtmlConf from '../src/module/elem-to-html'
import parseHtmlConf from '../src/module/parse-elem-html'

describe('plugin-link-card elem html', () => {
  it('preserves target through slate to html to slate', () => {
    const elem = {
      type: 'link-card',
      title: 'wangEditor',
      link: 'https://www.wangeditor.com/',
      target: '_self',
      iconImgSrc: 'https://www.wangeditor.com/icon.png',
      children: [{ text: '' }],
    }

    const html = elemToHtmlConf.elemToHtml(elem, '')
    const parsed = parseHtmlConf.parseElemHtml($(html)[0], [], {} as any)

    expect(html).toContain('data-target="_self"')
    expect(parsed).toEqual(elem)
  })

  it('keeps historical cards without target structurally unchanged', () => {
    const html =
      '<div data-w-e-type="link-card" data-w-e-is-void data-title="title" data-link="https://example.com" data-iconImgSrc=""></div>'
    const parsed = parseHtmlConf.parseElemHtml($(html)[0], [], {} as any)

    expect(parsed).toEqual({
      type: 'link-card',
      title: 'title',
      link: 'https://example.com',
      iconImgSrc: '',
      children: [{ text: '' }],
    })
  })
})
