/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseHtmlConf } from '../../src/modules/link/parse-elem-html'

describe('link - parse html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('without children', () => {
    const $link = $('<a href="http://localhost/" target="_blank"></a>')
    const table = [{ type: 'table-cell', children: [{ text: 'hello world' }] }]
    const image = [{ type: 'image', children: [{ text: '' }] }]

    // parse is block
    let res = parseHtmlConf.parseElemHtml($link[0], table, editor)

    expect(res).toEqual({
      type: 'link',
      url: 'http://localhost/',
      target: '_blank',
      children: [{ text: '' }],
    })

    // parse is inline
    res = parseHtmlConf.parseElemHtml($link[0], image, editor)
    expect(res).toEqual({
      type: 'link',
      url: 'http://localhost/',
      target: '_blank',
      children: [{ type: 'image', children: [{ text: '' }] }],
    })
  })

  it('with children', () => {
    const $link = $('<a href="http://localhost/" target="_blank"></a>')
    const children = [{ text: 'hello ' }, { text: 'world', bold: true }]

    // match selector
    expect($link[0].matches(parseHtmlConf.selector)).toBeTruthy()

    // parse
    const res = parseHtmlConf.parseElemHtml($link[0], children, editor)

    expect(res).toEqual({
      type: 'link',
      url: 'http://localhost/',
      target: '_blank',
      children: [{ text: 'hello ' }, { text: 'world', bold: true }],
    })
  })
})
