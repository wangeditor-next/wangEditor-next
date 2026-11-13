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

  it('elemToHtml should output loading attribute when set', () => {
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      href: '',
      loading: 'lazy',
      style: { float: 'left' },
      children: [{ text: '' }],
    } as any
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any

    expect(elemToHtmlConf.elemToHtml(elem, '')).toBe(
      '<img src="https://example.com/a.png" alt="a" data-href="" style="float: left;" loading="lazy"/>',
    )
    expect(elemToHtmlConf.elemToHtml(elem, '', mockEditor)).toBe(
      '<img src="https://example.com/a.png" alt="a" data-href="" width="" height="" class="w-e-float-image-left" data-w-e-style-float="left" loading="lazy"/>',
    )
    expect(elemToHtmlConf.elemToHtml({ ...elem, loading: 'auto' }, '')).not.toContain('loading=')
  })

  it('parseHtml should keep supported loading attribute only', () => {
    const parse = (html: string) => parseHtmlConf.parseElemHtml($(html)[0], [], {} as any)

    expect(parse('<img src="a.png" loading="lazy"/>').loading).toBe('lazy')
    expect(parse('<img src="a.png" loading="Eager"/>').loading).toBe('eager')
    expect(parse('<img src="a.png" loading="auto"/>')).not.toHaveProperty('loading')
    expect(parse('<img src="a.png"/>')).not.toHaveProperty('loading')
  })

  it('should keep loading attribute through toHtml -> parse round-trip', () => {
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      href: '',
      loading: 'lazy',
      style: { width: '100px', float: 'left' },
      children: [{ text: '' }],
    } as any
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any

    const inlineHtml = elemToHtmlConf.elemToHtml(elem, '')
    const classHtml = elemToHtmlConf.elemToHtml(elem, '', mockEditor)

    expect(inlineHtml).toBe(
      '<img src="https://example.com/a.png" alt="a" data-href="" style="width: 100px;float: left;" loading="lazy"/>',
    )
    expect(classHtml).toContain(' loading="lazy"/>')
    expect(parseHtmlConf.parseElemHtml($(inlineHtml)[0], [], {} as any)).toMatchObject({ loading: 'lazy' })
    expect(parseHtmlConf.parseElemHtml($(classHtml)[0], [], {} as any)).toMatchObject({ loading: 'lazy' })
  })

  it('parseHtml should ignore missing or unsupported loading attribute', () => {
    const $img = $('<img src="https://example.com/a.png" alt="a"/>')
    const $autoImg = $('<img src="https://example.com/a.png" alt="a" loading="auto"/>')
    const $eagerImg = $('<img src="https://example.com/a.png" alt="a" loading="Eager"/>')

    expect(parseHtmlConf.parseElemHtml($img[0], [], {} as any)).not.toHaveProperty('loading')
    expect(parseHtmlConf.parseElemHtml($autoImg[0], [], {} as any)).not.toHaveProperty('loading')
    expect(parseHtmlConf.parseElemHtml($eagerImg[0], [], {} as any)).toMatchObject({ loading: 'eager' })
    expect(elemToHtmlConf.elemToHtml(parseHtmlConf.parseElemHtml($img[0], [], {} as any) as any, '')).not.toContain('loading=')
  })
})
