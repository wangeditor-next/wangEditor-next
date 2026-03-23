/**
 * @description pre parse html
 * @author wangfupeng
 */

import $, { DOMElement, getTagName } from '../utils/dom'

function hasMeaningfulCellContent(cellHtml: string): boolean {
  const container = document.createElement('div')

  container.innerHTML = cellHtml

  const text = (container.textContent || '').replace(/\u00a0/g, ' ').trim()

  if (text) { return true }

  return (
    container.querySelector('img,video,audio,iframe,canvas,svg,hr,input,table') != null
  )
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

    if (!trimmedHtml || trimmedHtml === '&nbsp;') { return }

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
 * pre-prase table ，去掉 <tbody> 和处理单元格中的 <p> 标签，以及删除隐藏的单元格
 * @param table table elem
 */
function preParse(tableElem: DOMElement): DOMElement {
  const $table = $(tableElem)
  const tagName = getTagName($table)

  if (tagName !== 'table') { return tableElem }

  // 没有 <tbody> 则直接返回
  const $tbody = $table.find('tbody')

  if ($tbody.length === 0) { return tableElem }

  // 去掉 <tbody> ，把 <tr> 移动到 <table> 下面
  const $tr = $table.find('tr')

  $table.append($tr)
  $tbody.remove()

  // 删除带有 style="display:none" 的单元格（通常来自复制的隐藏内容）
  const $allCells = $table.find('td, th')

  for (let i = 0; i < $allCells.length; i += 1) {
    const cell = $allCells[i]
    const $cell = $(cell)
    const styleAttr = $cell.attr('style')

    // 检查style属性是否包含display:none或display: none
    if (styleAttr) {
      // 使用正则表达式匹配display:none，支持空格变化
      const displayNoneRegex = /display\s*:\s*none/i

      if (displayNoneRegex.test(styleAttr)) {
        if (hasMeaningfulCellContent($cell.html() || '')) {
          const htmlCell = cell as HTMLElement

          htmlCell.style.removeProperty('display')

          if (!htmlCell.getAttribute('style')) {
            $cell.removeAttr('style')
          }
        } else {
          $cell.remove()
          continue
        }
      }
    }
    // 设置width属性为auto
    $cell.attr('width', 'auto')
  }

  // 处理表格单元格中的 <p> 标签（通常来自Word复制）
  const $cells = $table.find('td, th')

  for (let i = 0; i < $cells.length; i += 1) {
    const cell = $cells[i]
    const $cell = $(cell)

    // 直接处理单元格中的所有 <p> 标签
    let cellHtml = $cell.html() || ''

    // 先清理Word特殊标签
    cellHtml = cellHtml.replace(/<o:p[^>]*>[\s\S]*?<\/o:p>/gi, '') // 删除 <o:p> 标签
    cellHtml = cellHtml.replace(/<\/o:p>/gi, '') // 删除可能的自闭合标签

    cellHtml = normalizeCellParagraphs(cellHtml)

    $cell.html(cellHtml)
  }

  return $table[0]
}

export const preParseTableHtmlConf = {
  selector: 'table',
  preParseHtml: preParse,
}
