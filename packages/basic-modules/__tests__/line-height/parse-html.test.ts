/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseStyleHtml } from '../../src/modules/line-height/parse-style-html'
import { genStyleClassName } from '../../src/utils/style-class'

describe('line height - parse style', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('parse style', () => {
    const $p = $('<p style="line-height: 2.5;"></p>')
    const paragraph = { type: 'paragraph', children: [{ text: 'hello' }] }

    // parse
    const res = parseStyleHtml($p[0], paragraph, editor)

    expect(res).toEqual({
      type: 'paragraph',
      lineHeight: '2.5',
      children: [{ text: 'hello' }],
    })
  })

  it('parse class', () => {
    const lineHeight = '2.5'
    const lineHeightClass = genStyleClassName('lineHeight', lineHeight)
    const $p = $(`<p class="${lineHeightClass}" data-w-e-line-height="${lineHeight}"></p>`)
    const paragraph = { type: 'paragraph', children: [{ text: 'hello' }] }
    const res = parseStyleHtml($p[0], paragraph, editor)

    expect(res).toEqual({
      type: 'paragraph',
      lineHeight: '2.5',
      children: [{ text: 'hello' }],
    })
  })
})
