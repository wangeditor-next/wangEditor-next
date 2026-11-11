/**
 * @description pre parse html
 * @author wangfupeng
 */

import $, { DOMElement, getTagName } from '../utils/dom'

function hasExplicitColgroupWidths($table: ReturnType<typeof $>): boolean {
  const table = $table[0] as HTMLTableElement
  const colgroupElements = Array.from(table.children).filter(child => {
    return child.tagName.toLowerCase() === 'colgroup'
  })

  for (let i = 0; i < colgroupElements.length; i += 1) {
    const colgroup = colgroupElements[i]

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
  const table = $table[0] as HTMLTableElement
  const rows = Array.from(table.children).filter(child => {
    return child.tagName.toLowerCase() === 'tr'
  })
  const cells = rows.flatMap(row => {
    return Array.from(row.children).filter(child => {
      const tag = child.tagName.toLowerCase()

      return tag === 'td' || tag === 'th'
    })
  })

  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i] as HTMLTableCellElement
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
    const firstRow = Array.from(tableClone.children).find(child => {
      return child.tagName.toLowerCase() === 'tr'
    }) as HTMLTableRowElement | undefined

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

  const existingColgroup = Array.from(tableElem.children).find(child => {
    return child.tagName.toLowerCase() === 'colgroup'
  })

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

  const firstRow = Array.from(tableElem.children).find(child => {
    return child.tagName.toLowerCase() === 'tr'
  })

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

/**
 * pre-prase table and remove the tbody wrapper while preserving cell blocks.
 * @param table table elem
 */
function preParse(tableElem: DOMElement): DOMElement {
  const $table = $(tableElem)
  const tagName = getTagName($table)

  if (tagName !== 'table') {
    return tableElem
  }

  // Only unwrap direct row sections. Using `$table.find('tr')` here also
  // collects rows from nested tables and turns them into siblings of the
  // outer table, which silently corrupts pasted Word content.
  const tableElement = $table[0] as HTMLTableElement
  const directSections = Array.from(tableElement.children).filter(child => {
    const tag = child.tagName.toLowerCase()

    return tag === 'thead' || tag === 'tbody' || tag === 'tfoot'
  })
  const hasDirectTbody = directSections.some(section => {
    return section.tagName.toLowerCase() === 'tbody'
  })

  // Preserve the historical behavior for tables without a tbody (for
  // example a thead-only table), while processing all direct row sections
  // when a tbody is present. Nested tables are intentionally excluded.
  if (!hasDirectTbody) {
    return tableElem
  }

  // 去掉 <tbody> ，把 <tr> 移动到 <table> 下面
  const directRows = directSections.flatMap(section => {
    return Array.from(section.children).filter(child => child.tagName.toLowerCase() === 'tr')
  })

  directRows.forEach(row => $table.append(row))
  directSections.forEach(section => section.remove())

  // Process cells from the direct rows only. Descendant cells belong to a
  // nested table and must stay inside that nested structure for the parser's
  // explicit fallback policy to handle them.
  const cells = directRows.flatMap(row => {
    return Array.from(row.children).filter(child => {
      const tag = child.tagName.toLowerCase()

      return tag === 'td' || tag === 'th'
    })
  })

  for (let i = 0; i < cells.length; i += 1) {
    const cell = cells[i]
    const $cell = $(cell)

    // 设置 width 属性为 auto
    $cell.attr('width', 'auto')

    // Keep block paragraphs/lists intact so the Slate parser can preserve them.
    let cellHtml = $cell.html() || ''

    // 先清理Word特殊标签
    cellHtml = cellHtml.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '') // 删除 <o:p> 标签
    cellHtml = cellHtml.replace(/<\/o:p>/gi, '') // 删除可能的自闭合标签

    $cell.html(cellHtml)
  }

  tryApplyAutoFittedColumnWidths($table)

  return $table[0]
}

export const preParseTableHtmlConf = {
  selector: 'table',
  preParseHtml: preParse,
}
