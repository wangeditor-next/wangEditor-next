import { $ } from 'dom7'

import elemToHtmlConf from '../src/module/elem-to-html'
import { parseHtmlConf } from '../src/module/parse-elem-html'

describe('plugin-float-image elem/parse html', () => {
  it('elemToHtml should keep inline style in default mode', () => {
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      href: 'https://example.com',
      style: {
        width: '100px',
        height: '80px',
        float: 'left',
      },
      children: [{ text: '' }],
    } as any

    const html = elemToHtmlConf.elemToHtml(elem, '')

    expect(html).toBe(
      '<img src="https://example.com/a.png" alt="a" data-href="https://example.com" style="width: 100px;height: 80px;float: left;"/>',
    )
  })

  it('elemToHtml should avoid inline style in class mode', () => {
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      href: 'https://example.com',
      style: {
        width: '100px',
        height: '80px',
        float: 'right',
      },
      children: [{ text: '' }],
    } as any
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any

    const html = elemToHtmlConf.elemToHtml(elem, '', mockEditor)

    expect(html).toBe(
      '<img src="https://example.com/a.png" alt="a" data-href="https://example.com" width="100px" height="80px" class="w-e-float-image-right" data-w-e-style-width="100px" data-w-e-style-height="80px" data-w-e-style-float="right"/>',
    )
    expect(html).not.toContain('style=')
  })

  it('parseHtml should parse class mode attrs', () => {
    const $img = $(
      '<img src="https://example.com/a.png" alt="a" data-href="https://example.com" width="100px" height="80px" class="w-e-float-image-left" data-w-e-style-width="100px" data-w-e-style-height="80px" data-w-e-style-float="left"/>',
    )

    expect($img[0].matches(parseHtmlConf.selector)).toBeTruthy()

    const res = parseHtmlConf.parseElemHtml($img[0], [], {} as any)

    expect(res).toEqual({
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      href: 'https://example.com',
      style: {
        width: '100px',
        height: '80px',
        float: 'left',
      },
      width: '100px',
      height: '80px',
      children: [{ text: '' }],
    })
  })

  it('class mode html should be stable after parse -> toHtml round-trip', () => {
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      href: 'https://example.com',
      style: {
        width: '100px',
        height: '80px',
        float: 'right',
      },
      children: [{ text: '' }],
    } as any

    const firstHtml = elemToHtmlConf.elemToHtml(elem, '', mockEditor)
    const $img = $(firstHtml)
    const parsedElem = parseHtmlConf.parseElemHtml($img[0], [], {} as any)
    const roundTripHtml = elemToHtmlConf.elemToHtml(parsedElem as any, '', mockEditor)

    expect(roundTripHtml).toBe(firstHtml)
    expect(roundTripHtml).toContain('class="w-e-float-image-right"')
    expect(roundTripHtml).not.toContain('style=')
  })
})
