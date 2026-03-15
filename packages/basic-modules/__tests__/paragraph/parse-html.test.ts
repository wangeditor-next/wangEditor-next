/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseParagraphHtmlConf } from '../../src/modules/paragraph/parse-elem-html'

describe('paragraph - parse html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('without children', () => {
    const $elem = $('<p>hello&nbsp;world</p>')
    const image = [{ type: 'image', children: [{ text: '' }] }]
    const table = [{ type: 'table-cell', children: [{ text: 'hello world' }] }]

    // match selector
    expect($elem[0].matches(parseParagraphHtmlConf.selector)).toBeTruthy()

    // parse
    let res = parseParagraphHtmlConf.parseElemHtml($elem[0], [], editor)

    expect(res).toEqual({
      type: 'paragraph',
      children: [{ text: 'hello world' }],
    })
    res = parseParagraphHtmlConf.parseElemHtml($elem[0], image, editor)
    expect(res).toEqual({
      type: 'paragraph',
      children: [{ type: 'image', children: [{ text: '' }] }],
    })
    res = parseParagraphHtmlConf.parseElemHtml($elem[0], table, editor)
    expect(res).toEqual({
      type: 'paragraph',
      children: [{ text: 'hello world' }],
    })
  })

  it('with children', () => {
    const $elem = $('<p></p>')
    const children = [{ text: 'hello ' }, { text: 'world', bold: true }]

    // parse
    const res = parseParagraphHtmlConf.parseElemHtml($elem[0], children, editor)

    expect(res).toEqual({
      type: 'paragraph',
      children: [{ text: 'hello ' }, { text: 'world', bold: true }],
    })
  })
})
