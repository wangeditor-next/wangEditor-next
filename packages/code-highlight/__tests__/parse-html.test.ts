/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import { parseCodeStyleHtml } from '../src/module/parse-style-html'

describe('code highlight - parse style html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('v5 format', () => {
    const $code = $('<code class="language-javascript"></code>') // v5 html format
    const code = { type: 'code', children: [{ text: 'var a = 100;' }], language: '' }

    const res = parseCodeStyleHtml($code[0], code, editor)

    expect(res).toEqual({
      type: 'code',
      language: 'javascript',
      children: [{ text: 'var a = 100;' }],
    })
  })

  it('v4 format', () => {
    const $code = $('<code class="Javascript"></code>') // v4 html format
    const code = { type: 'code', children: [{ text: 'var a = 100;' }], language: '' }

    const res = parseCodeStyleHtml($code[0], code, editor)

    expect(res).toEqual({
      type: 'code',
      language: 'javascript',
      children: [{ text: 'var a = 100;' }],
    })
  })
})
