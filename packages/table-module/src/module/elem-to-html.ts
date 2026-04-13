/**
 * @description to html
 * @author wangfupeng
 */

import { getTextStyleMode, IDomEditor } from '@wangeditor-next/core'
import { Element } from 'slate'

import { TableCellElement, TableElement, TableRowElement } from './custom-types'

function getExportTableWidth(tableNode: TableElement): string {
  const { width = 'auto', columnWidths = [] } = tableNode

  if (width && width !== 'auto') {
    return width
  }

  const totalWidth = columnWidths.reduce((sum, columnWidth) => {
    if (!Number.isFinite(columnWidth)) { return sum }
    if (columnWidth <= 0) { return sum }
    return sum + columnWidth
  }, 0)

  if (totalWidth > 0) {
    return `${totalWidth}px`
  }

  return 'auto'
}

function tableToHtml(elemNode: Element, childrenHtml: string, editor?: IDomEditor): string {
  const tableNode = elemNode as TableElement
  const { columnWidths, height = 'auto' } = tableNode
  const cols = columnWidths
    ?.map(colWidth => {
      return `<col width=${colWidth}></col>`
    })
    .join('')

  const colgroupStr = cols ? `<colgroup contentEditable="false">${cols}</colgroup>` : ''
  const exportedWidth = getExportTableWidth(tableNode)
  const textStyleMode = getTextStyleMode(editor)

  if (textStyleMode === 'class') {
    const widthAttr = exportedWidth ? ` width="${exportedWidth}"` : ''
    const heightValue = String(height || '').trim()
    const heightAttr = heightValue && heightValue !== 'auto' ? ` height="${heightValue}"` : ''
    const heightDataAttr = heightValue ? ` data-w-e-table-height="${heightValue}"` : ''

    return `<table class="w-e-table-layout-fixed"${widthAttr}${heightAttr}${heightDataAttr}>${colgroupStr}<tbody>${childrenHtml}</tbody></table>`
  }

  return `<table style="width: ${exportedWidth};table-layout: fixed;height:${height}">${colgroupStr}<tbody>${childrenHtml}</tbody></table>`
}

function tableRowToHtml(elem: Element, childrenHtml: string, editor?: IDomEditor): string {
  const { height } = elem as TableRowElement
  const textStyleMode = getTextStyleMode(editor)

  if (textStyleMode === 'class') {
    if (height) {
      return `<tr height="${height}" data-w-e-row-height="${height}px">${childrenHtml}</tr>`
    }
    return `<tr>${childrenHtml}</tr>`
  }

  const heightStyle = height ? ` style="height: ${height}px"` : ''

  return `<tr${heightStyle}>${childrenHtml}</tr>`
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
