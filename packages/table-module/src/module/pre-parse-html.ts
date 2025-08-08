/**
 * @description pre parse html
 * @author wangfupeng
 */

import $, { DOMElement, getTagName } from '../utils/dom'

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
        $cell.remove()
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

    // 一次性处理所有p标签
    cellHtml = cellHtml.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (match, content) => {
      // 处理空内容或只包含空白字符的情况
      const trimmedContent = content.trim()

      if (!trimmedContent || trimmedContent === '&nbsp;') {
        return '' // 删除空的p标签
      }
      return content // 返回p标签的内容
    })

    $cell.html(cellHtml)
  }

  return $table[0]
}

export const preParseTableHtmlConf = {
  selector: 'table',
  preParseHtml: preParse,
}
