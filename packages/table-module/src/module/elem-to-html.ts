/**
 * @description to html
 * @author wangfupeng
 */

import { getTextStyleMode, IDomEditor } from '@wangeditor-next/core'
import { Element } from 'slate'

import { TableCellElement, TableElement, TableRowElement } from './custom-types'

type TableWidthExportMode = 'adaptive' | 'explicit'

const CSS_LENGTH_WITH_UNIT_REGEXP = /^-?(?:\d+|\d*\.\d+)(?:px|em|rem|%|vh|vw|vmin|vmax|pt|pc|cm|mm|in|ch|ex|lh|rlh)$/i

function escapeHtml(raw: string): string {
  return raw
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function getTableWidthExportMode(editor?: IDomEditor): TableWidthExportMode {
  if (!editor || typeof editor.getMenuConfig !== 'function') {
    return 'explicit'
  }

  const menuConf = editor.getMenuConfig('insertTable') as { widthExportMode?: TableWidthExportMode }

  return menuConf?.widthExportMode === 'explicit' ? 'explicit' : 'adaptive'
}

function getExportTableWidth(tableNode: TableElement, editor?: IDomEditor): string {
  const { width = 'auto', columnWidths = [] } = tableNode

  if (width && width !== 'auto') {
    return width
  }

  const widthExportMode = getTableWidthExportMode(editor)

  // In adaptive mode, keep imported or generated auto-width tables as auto
  // and only persist explicit fixed widths when width is not auto.
  if (widthExportMode === 'adaptive') {
    return 'auto'
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

function formatTableHeight(height: TableElement['height'] | string = 'auto'): string {
  const heightValue = `${height || ''}`.trim()

  if (!heightValue || heightValue === 'auto') {
    return 'auto'
  }

  const numericHeight = Number(heightValue)

  if (Number.isFinite(numericHeight)) {
    return `${numericHeight}px`
  }

  if (CSS_LENGTH_WITH_UNIT_REGEXP.test(heightValue)) {
    return heightValue
  }

  return 'auto'
}

function tableToHtml(elemNode: Element, childrenHtml: string, editor?: IDomEditor): string {
  const tableNode = elemNode as TableElement
  const { columnWidths, caption, height = 'auto' } = tableNode
  const cols = columnWidths
    ?.map(colWidth => {
      return `<col width=${colWidth}></col>`
    })
    .join('')

  const captionStr = caption ? `<caption>${escapeHtml(caption)}</caption>` : ''
  const colgroupStr = cols ? `<colgroup contentEditable="false">${cols}</colgroup>` : ''
  const exportedWidth = getExportTableWidth(tableNode, editor)
  const textStyleMode = getTextStyleMode(editor)
  const exportedHeight = formatTableHeight(height)

  if (textStyleMode === 'class') {
    const widthAttr = exportedWidth ? ` width="${exportedWidth}"` : ''
    const heightAttr = exportedHeight !== 'auto' ? ` height="${exportedHeight}"` : ''
    const heightDataAttr = ` data-w-e-table-height="${exportedHeight}"`

    return `<table class="w-e-table-layout-fixed"${widthAttr}${heightAttr}${heightDataAttr}>${captionStr}${colgroupStr}<tbody>${childrenHtml}</tbody></table>`
  }

  return `<table style="width: ${exportedWidth};table-layout: fixed;height:${exportedHeight}">${captionStr}${colgroupStr}<tbody>${childrenHtml}</tbody></table>`
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
