/**
 * @description parse html
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { DOMElement, getStyleValue, getTagName } from '../utils/dom'
import { TableCellElement, TableElement, TableRowElement } from './custom-types'

function parsePixelSize(value: string | null | undefined, fallback = 0): number {
  const parsedValue = parseInt(value || '', 10)

  if (Number.isNaN(parsedValue)) {
    return fallback
  }

  return parsedValue
}

function getColgroupWidths(colgroupElements: HTMLCollection | null): number[] {
  if (!colgroupElements || colgroupElements.length === 0) { return [] }

  const columnWidths: number[] = []

  Array.from(colgroupElements).forEach((col: any) => {
    const span = parseInt(col.getAttribute('span') || '1', 10)
    const width = parseInt(
      col.getAttribute('width') || getStyleValue($(col), 'width') || '90',
      10,
    )

    if (Number.isNaN(width)) { return }

    for (let i = 0; i < span; i += 1) {
      columnWidths.push(width)
    }
  })

  return columnWidths
}

function parseCellHtml(
  elem: DOMElement,
  children: Descendant[],
  editor: IDomEditor,
): TableCellElement {
  const $elem = $(elem)
  const cellText = $elem.text().replace(/\s+/gm, ' ').trim()

  children = children.filter(child => {
    if (DomEditor.getNodeType(child) === 'paragraph') { return true }
    if (Text.isText(child)) { return true }
    if (editor.isInline(child)) { return true }
    return false
  })

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{ text: $elem.text().replace(/\s+/gm, ' ') }]
  }

  const colSpan = parseInt($elem.attr('colSpan') || '1', 10)
  const rowSpan = parseInt($elem.attr('rowSpan') || '1', 10)
  const hidden = getStyleValue($elem, 'display') === 'none' && cellText.length === 0
  const width = $elem.attr('width') || 'auto'

  return {
    type: 'table-cell',
    isHeader: getTagName($elem) === 'th',
    colSpan,
    rowSpan,
    width,
    // @ts-ignore
    children,
    hidden,
  }
}

export const parseCellHtmlConf = {
  selector: 'td:not([data-w-e-type]),th:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseCellHtml,
}

function parseRowHtml(
  elem: DOMElement,
  children: Descendant[],
  _editor: IDomEditor,
): TableRowElement {
  const $elem = $(elem)
  const tableCellChildren: TableCellElement[] = []

  for (let i = 0; i < children.length; i += 1) {
    const child = children[i]

    // 确保是 table-cell 类型
    if (DomEditor.getNodeType(child) === 'table-cell') {
      const tableCell = child as TableCellElement

      // 如果是隐藏的单元格，则跳过（删除）
      if (tableCell.hidden) {
        continue
      }

      tableCellChildren.push(tableCell) // 只添加非隐藏的单元格
    }
  }

  // 解析行高度（style / class-mode data attr / legacy attr）
  const rowHeightRaw = getStyleValue($elem, 'height')
    || $elem.attr('data-w-e-row-height')
    || $elem.attr('height')
  const height = parsePixelSize(rowHeightRaw) || undefined

  return {
    type: 'table-row',
    height,
    children: tableCellChildren,
  }
}

export const parseRowHtmlConf = {
  selector: 'tr:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseRowHtml,
}

function parseTableHtml(
  elem: DOMElement,
  children: Descendant[],
  _editor: IDomEditor,
): TableElement {
  const $elem = $(elem)

  // 计算宽度
  let tableWidth = 'auto'

  const styleWidth = getStyleValue($elem, 'width')
  const widthAttr = $elem.attr('width') || ''
  const isClassModeTable = $elem.hasClass('w-e-table-layout-fixed') || !!$elem.attr('data-w-e-table-height')

  if (styleWidth === '100%') { tableWidth = '100%' }
  if ($elem.attr('width') === '100%') { tableWidth = '100%' } // 兼容 v4 格式
  if (isClassModeTable && widthAttr && widthAttr !== 'auto' && widthAttr !== '100%') {
    tableWidth = widthAttr
  }

  // 计算高度
  const tableHeightRaw = getStyleValue($elem, 'height')
    || $elem.attr('data-w-e-table-height')
    || $elem.attr('height')
  const height = parsePixelSize(tableHeightRaw)

  const tableELement: TableElement = {
    type: 'table',
    width: tableWidth,
    height,
    // @ts-ignore
    children: children.filter(child => DomEditor.getNodeType(child) === 'table-row'),
  }
  const tdList = $elem.find('tr')[0]?.children || []
  const colgroupElments: HTMLCollection = $elem.find('colgroup')[0]?.children || null
  const colgroupWidths = getColgroupWidths(colgroupElments)

  if (colgroupWidths.length > 0) {
    tableELement.columnWidths = colgroupWidths
  } else if (tdList.length > 0) {
    const columnWidths: number[] = []

    Array.from(tdList).forEach(td => {
      const colSpan = parseInt($(td).attr('colSpan') || '1', 10) // 获取 colSpan，默认为 1
      const width = parseInt(getStyleValue($(td), 'width') || '90', 10) // 获取 width，默认为 90

      // 根据 colSpan 的值来填充 columnWidths 数组
      columnWidths.push(width)
      for (let i = 1; i < colSpan; i += 1) {
        columnWidths.push(90)
      }
    })
    tableELement.columnWidths = columnWidths
  }
  return tableELement
}

export const parseTableHtmlConf = {
  selector: 'table:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseTableHtml,
}
