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

  console.log('remove cell1')
  for (let i = 0; i < $allCells.length; i += 1) {
    const cell = $allCells[i]
    const $cell = $(cell)
    const styleAttr = $cell.attr('style')

    // 检查style属性是否包含display:none或display: none
    if (styleAttr) {
      // 使用正则表达式匹配display:none，支持空格变化
      console.log('remove cell2', styleAttr)
      const displayNoneRegex = /display\s*:\s*none/i

      if (displayNoneRegex.test(styleAttr)) {
        console.log('remove cell3')
        console.log('remove cell', $cell)
        $cell.remove()
      }
    }
  }

  // 处理表格单元格中的 <p> 标签（通常来自Word复制）
  const $cells = $table.find('td, th')

  for (let i = 0; i < $cells.length; i += 1) {
    const cell = $cells[i]
    const $cell = $(cell)
    const $paragraphs = $cell.find('p')

    if ($paragraphs.length > 0) {
      // 如果单元格只包含一个p标签，直接用p标签的内容替换
      if ($paragraphs.length === 1 && $cell.children().length === 1) {
        const $p = $($paragraphs[0])
        let content = $p.html() || ''

        // 处理空内容或只包含空白字符的情况
        if (!content.trim() || content.trim() === '&nbsp;') {
          content = ''
        }

        $cell.html(content)
      } else {
        // 如果有多个p标签，将它们用<br>分隔合并
        const contents: string[] = []

        for (let j = 0; j < $paragraphs.length; j += 1) {
          const p = $paragraphs[j]
          const $p = $(p)
          const content = $p.html() || ''

          // 跳过空的p标签或只包含空白字符的p标签
          if (content.trim() && content.trim() !== '&nbsp;') {
            contents.push(content)
          }
        }

        // 如果没有有效内容，保持空字符串
        $cell.html(contents.length > 0 ? contents.join('<br>') : '')
      }
    }
  }

  return $table[0]
}

export const preParseTableHtmlConf = {
  selector: 'table',
  preParseHtml: preParse,
}
