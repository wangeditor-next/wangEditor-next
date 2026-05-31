/**
 * @description pre parse html
 * @author wangfupeng
 */

import $, { DOMElement, getTagName } from '../utils/dom'

function hasExplicitColgroupWidths($table: ReturnType<typeof $>): boolean {
  const colgroupElements = $table.find('colgroup')

  for (let i = 0; i < colgroupElements.length; i += 1) {
    const colgroup = colgroupElements[i] as HTMLTableColElement

    for (let j = 0; j < colgroup.children.length; j += 1) {
      const col = colgroup.children[j] as HTMLTableColElement
      const widthAttr = (col.getAttribute('width') || '').trim().toLowerCase()
      const styleWidth = (col.style.width || '').trim().toLowerCase()

      if (widthAttr && widthAttr !== 'auto') {
        return true
      }
      if (styleWidth && styleWidth !== 'auto') {
        return true
      }
    }
  }

  return false
}

function hasExplicitCellWidths($table: ReturnType<typeof $>): boolean {
  const $cells = $table.find('td, th')

  for (let i = 0; i < $cells.length; i += 1) {
    const cell = $cells[i] as HTMLTableCellElement
    const widthAttr = (cell.getAttribute('width') || '').trim().toLowerCase()
    const styleWidth = (cell.style.width || '').trim().toLowerCase()

    if (widthAttr && widthAttr !== 'auto') {
      return true
    }
    if (styleWidth && styleWidth !== 'auto') {
      return true
    }
  }

  return false
}

function isAutoWidthFixedLayoutTable($table: ReturnType<typeof $>): boolean {
  const widthAttr = ($table.attr('width') || '').trim().toLowerCase()
  const styleWidth = ($table[0] as HTMLTableElement).style.width.trim().toLowerCase()
  const tableLayout = ($table[0] as HTMLTableElement).style.tableLayout.trim().toLowerCase()

  const isClassModeTable =
    $table.hasClass('w-e-table-layout-fixed') || !!$table.attr('data-w-e-table-height')
  const isAutoWidth = widthAttr === 'auto' || styleWidth === 'auto'

  if (isClassModeTable) {
    return false
  }
  if (!isAutoWidth) {
    return false
  }
  if (tableLayout !== 'fixed') {
    return false
  }

  return true
}

function measureColumnWidthsFromLayout(tableElem: HTMLTableElement): number[] {
  if (typeof document === 'undefined' || !document.body) {
    return []
  }

  const sandbox = document.createElement('div')

  sandbox.style.position = 'fixed'
  sandbox.style.top = '-10000px'
  sandbox.style.left = '0'
  sandbox.style.visibility = 'hidden'
  sandbox.style.pointerEvents = 'none'

  const tableClone = tableElem.cloneNode(true) as HTMLTableElement

  sandbox.appendChild(tableClone)
  document.body.appendChild(sandbox)

  try {
    const firstRow = tableClone.querySelector('tr')

    if (!firstRow) {
      return []
    }

    const cells = Array.from(firstRow.children).filter(cell => {
      const tag = cell.tagName.toLowerCase()

      return tag === 'td' || tag === 'th'
    }) as HTMLTableCellElement[]

    if (cells.length === 0) {
      return []
    }

    const measuredWidths: number[] = []

    for (let i = 0; i < cells.length; i += 1) {
      const cell = cells[i]
      const span = parseInt(cell.getAttribute('colspan') || '1', 10)
      const safeSpan = Number.isFinite(span) && span > 0 ? span : 1
      const cellWidth = cell.getBoundingClientRect().width

      if (!Number.isFinite(cellWidth) || cellWidth <= 0) {
        return []
      }

      const widthPerColumn = Math.max(1, Math.round(cellWidth / safeSpan))

      for (let j = 0; j < safeSpan; j += 1) {
        measuredWidths.push(widthPerColumn)
      }
    }

    return measuredWidths
  } finally {
    sandbox.remove()
  }
}

function applyMeasuredColumnWidths(tableElem: HTMLTableElement, columnWidths: number[]) {
  if (columnWidths.length === 0) {
    return
  }

  const existingColgroup = tableElem.querySelector('colgroup')

  if (existingColgroup) {
    existingColgroup.remove()
  }

  const colgroupElem = document.createElement('colgroup')

  colgroupElem.setAttribute('contentEditable', 'false')
  columnWidths.forEach(width => {
    const colElem = document.createElement('col')

    colElem.setAttribute('width', `${width}`)
    colgroupElem.appendChild(colElem)
  })

  const firstRow = tableElem.querySelector('tr')

  if (firstRow) {
    tableElem.insertBefore(colgroupElem, firstRow)
  } else {
    tableElem.appendChild(colgroupElem)
  }
}

function tryApplyAutoFittedColumnWidths($table: ReturnType<typeof $>) {
  if (!isAutoWidthFixedLayoutTable($table)) {
    return
  }
  if (hasExplicitColgroupWidths($table)) {
    return
  }
  if (hasExplicitCellWidths($table)) {
    return
  }

  const columnWidths = measureColumnWidthsFromLayout($table[0] as HTMLTableElement)

  if (columnWidths.length === 0) {
    return
  }

  applyMeasuredColumnWidths($table[0] as HTMLTableElement, columnWidths)
}

function normalizeCellParagraphs(cellHtml: string): string {
  const container = document.createElement('div')

  container.innerHTML = cellHtml

  const normalizedNodes: Node[] = []
  let hasMeaningfulContent = false

  Array.from(container.childNodes).forEach(node => {
    if (node.nodeType === Node.TEXT_NODE) {
      if ((node.textContent || '').trim()) {
        normalizedNodes.push(node.cloneNode(true))
        hasMeaningfulContent = true
      }
      return
    }

    if (!(node instanceof HTMLElement) || node.tagName.toLowerCase() !== 'p') {
      normalizedNodes.push(node.cloneNode(true))
      hasMeaningfulContent = true
      return
    }

    const paragraphHtml = node.innerHTML
    const trimmedHtml = paragraphHtml.trim()

    if (!trimmedHtml || trimmedHtml === '&nbsp;') {
      return
    }

    if (hasMeaningfulContent) {
      normalizedNodes.push(document.createElement('br'))
    }

    const paragraphContainer = document.createElement('div')

    paragraphContainer.innerHTML = paragraphHtml

    Array.from(paragraphContainer.childNodes).forEach(childNode => {
      normalizedNodes.push(childNode.cloneNode(true))
    })
    hasMeaningfulContent = true
  })

  container.replaceChildren(...normalizedNodes)

  return container.innerHTML
}

/**
 * pre-prase table ，去掉 <tbody> 和处理单元格中的 <p> 标签
 * @param table table elem
 */
function preParse(tableElem: DOMElement): DOMElement {
  const $table = $(tableElem)
  const tagName = getTagName($table)

  if (tagName !== 'table') {
    return tableElem
  }

  // 没有 <tbody> 则直接返回
  const $tbody = $table.find('tbody')

  if ($tbody.length === 0) {
    return tableElem
  }

  // 去掉 <tbody> ，把 <tr> 移动到 <table> 下面
  const $tr = $table.find('tr')

  $table.append($tr)
  $tbody.remove()

  const $cells = $table.find('td, th')

  for (let i = 0; i < $cells.length; i += 1) {
    const cell = $cells[i]
    const $cell = $(cell)

    // 设置 width 属性为 auto
    $cell.attr('width', 'auto')

    // 直接处理单元格中的所有 <p> 标签
    let cellHtml = $cell.html() || ''

    // 先清理Word特殊标签
    cellHtml = cellHtml.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '') // 删除 <o:p> 标签
    cellHtml = cellHtml.replace(/<\/o:p>/gi, '') // 删除可能的自闭合标签

    cellHtml = normalizeCellParagraphs(cellHtml)

    $cell.html(cellHtml)
  }

  tryApplyAutoFittedColumnWidths($table)

  return $table[0]
}

export const preParseTableHtmlConf = {
  selector: 'table',
  preParseHtml: preParse,
}
