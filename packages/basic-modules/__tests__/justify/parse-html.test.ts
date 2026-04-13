/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseStyleHtml } from '../../src/modules/justify/parse-style-html'
import { genStyleClassName } from '../../src/utils/style-class'

describe('text align - parse style', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('parse style', () => {
    const $p = $('<p style="text-align: center;"></p>')
    const paragraph = { type: 'paragraph', children: [{ text: 'hello' }] }

    // parse
    const res = parseStyleHtml($p[0], paragraph, editor)

    expect(res).toEqual({
      type: 'paragraph',
      textAlign: 'center',
      children: [{ text: 'hello' }],
    })
  })

  it('parse class', () => {
    const textAlign = 'center'
    const justifyClass = genStyleClassName('textAlign', textAlign)
    const $p = $(`<p class="${justifyClass}" data-w-e-text-align="${textAlign}"></p>`)
    const paragraph = { type: 'paragraph', children: [{ text: 'hello' }] }
    const res = parseStyleHtml($p[0], paragraph, editor)

    expect(res).toEqual({
      type: 'paragraph',
      textAlign: 'center',
      children: [{ text: 'hello' }],
    })
  })
})
