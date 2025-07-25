/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import {
  parseCellHtmlConf,
  parseRowHtmlConf,
  parseTableHtmlConf,
} from '../src/module/parse-elem-html'
import { preParseTableHtmlConf } from '../src/module/pre-parse-html'

describe('table - pre parse html', () => {
  it('pre parse', () => {
    const $table = $('<table><tbody><tr><td>hello</td></tr></tbody></table>')

    // match selector
    expect($table[0].matches(preParseTableHtmlConf.selector)).toBeTruthy()

    // pre parse
    const res = preParseTableHtmlConf.preParseHtml($table[0])

    expect(res.outerHTML).toBe('<table><tr><td width="auto">hello</td></tr></table>')
  })

  it('it should return fake element if pass fake table element', () => {
    const fakeTable = $('<div>hello</div>')

    // pre parse
    const res = preParseTableHtmlConf.preParseHtml(fakeTable[0])

    expect(res.outerHTML).toBe('<div>hello</div>')
  })

  it('it should return directly if pass table element without body', () => {
    const table = $('<table><tr><td>hello</td></tr></table>')

    // pre parse
    const res = preParseTableHtmlConf.preParseHtml(table[0])

    expect(res.outerHTML).toBe('<table><tr><td width="auto">hello</td></tr></table>')
  })
})

describe('table - parse html', () => {
  const editor = createEditor()

  it('table cell', () => {
    const $cell1 = $('<td>hello&nbsp;world</td>')

    expect($cell1[0].matches(parseCellHtmlConf.selector)).toBeTruthy()
    expect(parseCellHtmlConf.parseElemHtml($cell1[0], [], editor)).toEqual({
      type: 'table-cell',
      isHeader: false,
      colSpan: 1,
      rowSpan: 1,
      width: 'auto',
      children: [{ text: 'hello world' }],
      hidden: false,
    })

    const $cell2 = $('<th style="display:none"></th>')
    const children = [{ text: 'hello ' }, { text: 'world', bold: true }]

    expect($cell2[0].matches(parseCellHtmlConf.selector)).toBeTruthy()
    expect(parseCellHtmlConf.parseElemHtml($cell2[0], children, editor)).toEqual({
      type: 'table-cell',
      isHeader: true,
      colSpan: 1,
      rowSpan: 1,
      width: 'auto',
      children,
      hidden: true,
    })
  })

  it('table row', () => {
    const $tr = $('<tr></tr>')
    const children = [{ type: 'table-cell', children: [{ text: 'hello world' }] }]

    expect($tr[0].matches(parseRowHtmlConf.selector)).toBeTruthy()

    expect(parseRowHtmlConf.parseElemHtml($tr[0], children, editor)).toEqual({
      type: 'table-row',
      children,
    })
  })

  it('table', () => {
    const $table = $('<table style="width: 100%;"></table>')
    const children = [
      {
        type: 'table-row',
        children: [{ type: 'table-cell', children: [{ text: 'hello world' }] }],
      },
    ]
    const mergeChildren = [
      {
        type: 'table-row',
        children: [
          {
            type: 'table-cell',
            isHeader: false,
            colSpan: 2,
            rowSpan: 1,
            width: 'auto',
            children: [
              {
                text: '',
              },
            ],
            hidden: false,
            borderWidth: '1',
            borderStyle: 'solid',
            borderColor: '#ccc',
          },
          {
            type: 'table-cell',
            children: [
              {
                text: '',
              },
            ],
            hidden: true,
          },
          {
            type: 'table-cell',
            isHeader: false,
            colSpan: 1,
            rowSpan: 1,
            width: 'auto',
            children: [
              {
                text: '',
              },
            ],
            hidden: true,
            borderWidth: '1',
            borderStyle: 'solid',
            borderColor: '#ccc',
          },
        ],
      },
    ]

    expect($table[0].matches(parseTableHtmlConf.selector)).toBeTruthy()

    expect(parseTableHtmlConf.parseElemHtml($table[0], children, editor)).toEqual({
      type: 'table',
      width: '100%',
      children,
      height: 0,
    })

    expect(parseTableHtmlConf.parseElemHtml($table[0], mergeChildren, editor)).toEqual({
      type: 'table',
      width: '100%',
      children: mergeChildren,
      height: 0,
    })
  })
})
