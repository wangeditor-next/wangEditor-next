/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseStyleHtml } from '../../src/modules/indent/parse-style-html'
import { preParseHtmlConf } from '../../src/modules/indent/pre-parse-html'
import { genStyleClassName } from '../../src/utils/style-class'

describe('indent - parse style', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('parse style', () => {
    const $p = $('<p style="text-indent: 2em;"></p>')
    const paragraph = { type: 'paragraph', children: [{ text: 'hello' }] }

    // parse
    const res = parseStyleHtml($p[0], paragraph, editor)

    expect(res).toEqual({
      type: 'paragraph',
      indent: '2em',
      children: [{ text: 'hello' }],
    })
  })

  it('parse class', () => {
    const indent = '2em'
    const indentClass = genStyleClassName('indent', indent)
    const $p = $(`<p class="${indentClass}" data-w-e-indent="${indent}"></p>`)
    const paragraph = { type: 'paragraph', children: [{ text: 'hello' }] }
    const res = parseStyleHtml($p[0], paragraph, editor)

    expect(res).toEqual({
      type: 'paragraph',
      indent: '2em',
      children: [{ text: 'hello' }],
    })
  })

  it('should ignore non-indent target elements', () => {
    const $img = $('<img style="text-indent: 2em;" />')
    const image = {
      type: 'image',
      src: 'https://example.com/1.png',
      href: '',
      alt: '',
      style: {},
      children: [{ text: '' }],
    } as any
    const res = parseStyleHtml($img[0], image, editor) as any

    expect(res.indent).toBeUndefined()
  })
})

describe('indent - pre parse html', () => {
  it('pre parse', () => {
    expect(preParseHtmlConf.selector).toBe('p,h1,h2,h3,h4,h5')

    const $p = $('<p style="padding-left: 2em;"></p>')

    // parse
    const res = preParseHtmlConf.preParseHtml($p[0])

    expect((res as HTMLParagraphElement).style.textIndent).toBe('2em')
  })

  it('pre parse with px unit', () => {
    expect(preParseHtmlConf.selector).toBe('p,h1,h2,h3,h4,h5')

    const $p = $('<p style="padding-left: 32px;"></p>')

    // parse
    const res = preParseHtmlConf.preParseHtml($p[0])

    expect((res as HTMLParagraphElement).style.textIndent).toBe('2em')
  })
})
