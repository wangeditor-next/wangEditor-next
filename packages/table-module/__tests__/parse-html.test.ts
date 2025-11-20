/**
 * @description parse html test
 * @author wangfupeng
 */
import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import { registerParseElemHtmlConf } from '../../core/src/parse-html'
import { registerParseStyleHtmlHandler } from '../../core/src/parse-html/index'
import parseElemHtmlFromCore from '../../core/src/parse-html/parse-elem-html'
import wangEditorTableModule from '../src/index'
import {
  parseCellHtmlConf,
  parseRowHtmlConf,
  parseTableHtmlConf,
} from '../src/module/parse-elem-html'
import { preParseTableHtmlConf } from '../src/module/pre-parse-html'

const TABLE_CELL_BASE_PROPS = {
  type: 'table-cell',
  isHeader: false,
  colSpan: 1,
  rowSpan: 1,
  width: 'auto',
  hidden: false,
}

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

  beforeEach(() => {
    wangEditorTableModule.parseElemsHtml!.forEach(item => {
      registerParseElemHtmlConf(item)
    })
    registerParseStyleHtmlHandler(wangEditorTableModule.parseStyleHtml!)
  })

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

  // ============== 测试table的border相关属性 start ==============

  it('table cell (TD) without border style should use default border (1px)', () => {
    const $cell = $('<td>Cell A</td>')
    const children = [{ text: 'Cell A' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: undefined,
      },
    ])
  })

  it('table cell with full border shorthand property (4px)', () => {
    const $cell = $('<td style="border: 4px solid red;">Cell B</td>')
    const children = [{ text: 'Cell B' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: '4px',
        borderStyle: 'solid',
        borderColor: 'red',
      },
    ])
  })

  it('table cell with explicit float border-width (1.5em)', () => {
    const $cell = $(
      '<td style="border-width: 1.5em; border-style: dotted; border-color: orange;">Cell C</td>',
    )
    const children = [{ text: 'Cell C' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: '1.5em',
        borderStyle: 'dotted',
        borderColor: 'orange',
      },
    ])
  })

  it('table cell with keyword border-width (thin) should be retained', () => {
    const $cell = $(
      '<td style="border-width: thin; border-style: dotted; border-color: blue;">Cell D</td>',
    )
    const children = [{ text: 'Cell D' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: 'thin',
        borderStyle: 'dotted',
        borderColor: 'blue',
      },
    ])
  })

  it('table cell with multi-value should be retained', () => {
    const $cell = $(
      '<td style="border-width: 2px 1em; border-style: dotted solid dashed; border-color: #ff0000 #00ff00 #0000ff rgb(250,0,255)">Cell E</td>',
    )
    const children = [{ text: 'Cell E' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: '2px 1em',
        borderStyle: 'dotted solid dashed',
        borderColor: '#ff0000 #00ff00 #0000ff rgb(250,0,255)',
      },
    ])
  })

  it('table cell with border-width using "pt" unit should convert to "px"', () => {
    const $cell = $('<td style="border-width: 1pt; border-style: solid;">Cell G</td>')
    const children = [{ text: 'Cell G' }]

    const expectedPx = `${((1 * 4) / 3).toFixed(2)}px`

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: expectedPx,
        borderStyle: 'solid',
        borderColor: undefined,
      },
    ])
  })

  it('table cell with multi-value border-width mixing keywords, pt, and px should convert correctly', () => {
    const multiPtWidth = 'medium 1pt 0.5pt 2px'
    const $cell = $(
      `<td style="border-width: ${multiPtWidth}; border-style: dashed; border-color: red;">Cell H</td>`,
    )
    const children = [{ text: 'Cell H' }]

    const expected1pt = ((1 * 4) / 3).toFixed(2)
    const expected05pt = ((0.5 * 4) / 3).toFixed(2)
    const expectedBorderWidth = `medium ${expected1pt}px ${expected05pt}px 2px`

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: expectedBorderWidth,
        borderStyle: 'dashed',
        borderColor: 'red',
      },
    ])
  })

  it('Cell with border-width containing pt should convert width correctly', () => {
    const $cell = $('<td style="border-width: 2.25pt;">Cell I</td>')
    const children = [{ text: 'Cell I' }]

    const expectedPx = `${((2.25 * 4) / 3).toFixed(2)}px`

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: expectedPx,
        borderStyle: 'solid',
        borderColor: undefined,
      },
    ])
  })

  it('should use specific border-width/style/color over border shorthand', () => {
    const $cell = $(
      '<td style="border: 1px solid red; border-width: 5px; border-style: dashed; border-color: blue;">Cell I</td>',
    )
    const children = [{ text: 'Cell I' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: '5px',
        borderStyle: 'dashed',
        borderColor: 'blue',
      },
    ])
  })

  it('should use specific border-width/color over border shorthand', () => {
    const $cell = $(
      '<td style="border: 1px dashed red; border-width: 5px; border-color: blue;">Cell I</td>',
    )
    const children = [{ text: 'Cell I' }]

    expect(parseElemHtmlFromCore($($cell[0]), editor)).toEqual([
      {
        ...TABLE_CELL_BASE_PROPS,
        children,
        borderWidth: '5px',
        borderStyle: 'dashed',
        borderColor: 'blue',
      },
    ])
  })

  // ============== 测试table的border相关属性 end ==============

  it('table row', () => {
    const $tr = $('<tr></tr>')
    const children = [{ type: 'table-cell', children: [{ text: 'hello world' }] }]

    expect($tr[0].matches(parseRowHtmlConf.selector)).toBeTruthy()

    expect(parseRowHtmlConf.parseElemHtml($tr[0], children, editor)).toEqual({
      type: 'table-row',
      children,
    })
  })

  it('table row with height', () => {
    const $tr = $('<tr style="height: 60px"></tr>')
    const children = [{ type: 'table-cell', children: [{ text: 'hello world' }] }]

    expect($tr[0].matches(parseRowHtmlConf.selector)).toBeTruthy()

    expect(parseRowHtmlConf.parseElemHtml($tr[0], children, editor)).toEqual({
      type: 'table-row',
      height: 60,
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
