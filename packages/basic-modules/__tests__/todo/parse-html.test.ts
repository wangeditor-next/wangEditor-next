/**
 * @description todo parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseHtmlConf } from '../../src/modules/todo/parse-elem-html'

describe('todo - parse html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('with children, checked', () => {
    const $todo = $('<div data-w-e-type="todo"><input type="checkbox" disabled checked>hello</div>')

    // match selector
    expect($todo[0].matches(parseHtmlConf.selector)).toBeTruthy()

    // parse
    const res = parseHtmlConf.parseElemHtml($todo[0], [], editor)

    expect(res).toEqual({
      type: 'todo',
      checked: true,
      children: [{ text: 'hello' }],
    })
  })

  it('without children, unchecked', () => {
    const $todo = $('<div data-w-e-type="todo"><input type="checkbox" disabled></div>')
    const children = [{ text: 'hello ' }, { text: 'world', bold: true }]
    const image = [{ type: 'image', children: [{ text: '' }] }]
    const table = [{ type: 'table-cell', children: [{ text: 'hello world' }] }]

    // match selector
    expect($todo[0].matches(parseHtmlConf.selector)).toBeTruthy()

    // parse
    let res = parseHtmlConf.parseElemHtml($todo[0], children, editor)

    expect(res).toEqual({
      type: 'todo',
      checked: false,
      children: [{ text: 'hello ' }, { text: 'world', bold: true }],
    })
    res = parseHtmlConf.parseElemHtml($todo[0], image, editor)
    expect(res).toEqual({
      type: 'todo',
      checked: false,
      children: [{ type: 'image', children: [{ text: '' }] }],
    })
    res = parseHtmlConf.parseElemHtml($todo[0], table, editor)
    expect(res).toEqual({
      type: 'todo',
      checked: false,
      children: [{ text: '' }],
    })
  })
})
