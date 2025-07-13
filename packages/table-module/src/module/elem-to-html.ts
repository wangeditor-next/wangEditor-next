/**
 * @description to html
 * @author wangfupeng
 */

import { Element } from 'slate'

import { TableCellElement, TableElement } from './custom-types'

function tableToHtml(elemNode: Element, childrenHtml: string): string {
  const { width = 'auto', columnWidths, height = 'auto' } = elemNode as TableElement
  const cols = columnWidths
    ?.map(colWidth => {
      return `<col width=${colWidth}></col>`
    })
    .join('')

  const colgroupStr = cols ? `<colgroup contentEditable="false">${cols}</colgroup>` : ''

  return `<table style="width: ${width};table-layout: fixed;height:${height}">${colgroupStr}<tbody>${childrenHtml}</tbody></table>`
}

function tableRowToHtml(elem: Element, childrenHtml: string): string {
  return `<tr>${childrenHtml}</tr>`
}

function tableCellToHtml(cellNode: Element, childrenHtml: string): string {
  const {
    colSpan = 1,
    rowSpan = 1,
    isHeader = false,
    width = 'auto',
    hidden = false,
  } = cellNode as TableCellElement

  // 如果单元格被隐藏，直接返回空字符串，不生成 HTML 元素
  if (hidden) {
    return ''
  }

  const tag = isHeader ? 'th' : 'td'

  return `<${tag} colSpan="${colSpan}" rowSpan="${rowSpan}" width="${width}">${childrenHtml}</${tag}>`
}

export const tableToHtmlConf = {
  type: 'table',
  elemToHtml: tableToHtml,
}

export const tableRowToHtmlConf = {
  type: 'table-row',
  elemToHtml: tableRowToHtml,
}

export const tableCellToHtmlConf = {
  type: 'table-cell',
  elemToHtml: tableCellToHtml,
}
