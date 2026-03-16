/**
 * @description parse text html
 * @author wangfupeng
 */

import { Dom7Array } from 'dom7'
import { Text } from 'slate'

import { IDomEditor } from '../editor/interface'
import { deReplaceHtmlSpecialSymbols } from '../utils/util'
import { replaceSpace160 } from './helper'
import { PARSE_STYLE_HTML_FN_LIST } from './index'

/**
 * 处理 text elem ，如 <span> <strong> <em> 等（并不是 DOM Text Node）
 * @param $text $text
 * @param editor editor
 * @returns slate text
 */
function parseTextElemHtml($text: Dom7Array, editor: IDomEditor): Text {
  if ($text.parents('pre').length === 0) {
    // 不在 <pre> 内部
    // 1. 去掉 html 格式化带来的换行和 tab；2. 将 <br> 替换为 `\n`
    // 注意不能压缩普通空格，否则会丢失连续空格和 emsp 等宽字符
    $text[0].innerHTML = $text[0].innerHTML.replace(/[\r\n\t]+/g, '').replace(/<br>/g, '\n')
  }

  // 用 textContent ，不能用 .text() 。后者无法识别 text 开头和末尾的 &nbsp;
  let text = $text[0].textContent || ''

  // 【翻转】替换 html 特殊字符，如 &lt; 替换为 <
  text = deReplaceHtmlSpecialSymbols(text)

  // 把 charCode 160 的空格（`&nbsp` 转换的），替换为 charCode 32 的空格（JS 默认的）
  text = replaceSpace160(text)

  // 生成 text node
  let textNode = { text }

  // 处理 style
  PARSE_STYLE_HTML_FN_LIST.forEach(fn => {
    textNode = fn($text[0], textNode, editor) as Text
  })

  return textNode
}

export function parseTextElemHtmlToStyle($text: Dom7Array, editor: IDomEditor): Text {
  let textNode = { text: '' }
  // 处理 style

  PARSE_STYLE_HTML_FN_LIST.forEach(fn => {
    textNode = fn($text[0], textNode, editor) as Text
  })

  return textNode
}

export default parseTextElemHtml
