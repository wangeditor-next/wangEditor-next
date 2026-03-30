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
})
