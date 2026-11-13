/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseHtmlConf } from '../../src/modules/image/parse-elem-html'

describe('image - parse html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('parse html', () => {
    const $img = $(
      '<img src="hello.png" alt="hello" data-href="http://localhost/" width="20" height="15" style="width: 10px; height: 5px;"/>',
    )

    // match selector
    expect($img[0].matches(parseHtmlConf.selector)).toBeTruthy()

    // parse
    const res = parseHtmlConf.parseElemHtml($img[0], [], editor)

    expect(res).toEqual({
      type: 'image',
      src: 'hello.png',
      alt: 'hello',
      href: 'http://localhost/',
      width: '20',
      height: '15',
      style: {
        width: '10px',
        height: '5px',
      },
      children: [{ text: '' }],
    })
  })

  it('parse html - class mode attrs', () => {
    const $img = $(
      '<img src="hello.png" alt="hello" data-href="http://localhost/" width="120px" height="90px" data-w-e-style-width="120px" data-w-e-style-height="90px"/>',
    )

    expect($img[0].matches(parseHtmlConf.selector)).toBeTruthy()

    const res = parseHtmlConf.parseElemHtml($img[0], [], editor)

    expect(res).toEqual({
      type: 'image',
      src: 'hello.png',
      alt: 'hello',
      href: 'http://localhost/',
      width: '120px',
      height: '90px',
      style: {
        width: '120px',
        height: '90px',
      },
      children: [{ text: '' }],
    })
  })

  it('parse html - keeps supported loading attribute', () => {
    const $lazyImg = $('<img src="hello.png" alt="hello" loading="lazy"/>')
    const $eagerImg = $('<img src="hello.png" alt="hello" loading="EAGER"/>')

    expect(parseHtmlConf.parseElemHtml($lazyImg[0], [], editor).loading).toBe('lazy')
    expect(parseHtmlConf.parseElemHtml($eagerImg[0], [], editor).loading).toBe('eager')
  })

  it('parse html - ignores missing or unsupported loading attribute', () => {
    const $img = $('<img src="hello.png" alt="hello"/>')
    const $autoImg = $('<img src="hello.png" alt="hello" loading="auto"/>')

    expect(parseHtmlConf.parseElemHtml($img[0], [], editor)).not.toHaveProperty('loading')
    expect(parseHtmlConf.parseElemHtml($autoImg[0], [], editor)).not.toHaveProperty('loading')
  })

  it('keeps loading attribute after setHtml -> getHtml round-trip', () => {
    editor.setHtml('<p><img src="hello.png" alt="hello" loading="lazy"/></p>')

    const [image] = editor.getElemsByTypePrefix('image') as any[]

    expect(image.loading).toBe('lazy')
    expect(editor.getHtml()).toContain('loading="lazy"')
  })
})
