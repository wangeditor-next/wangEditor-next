/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { Dom7Array, DOMElement, getStyleValue } from '../../utils/dom'
import { StyledText } from './custom-types'

/**
 * $text 是否匹配 tags
 * @param $text $text
 * @param selector selector 如 'b,strong' 或 'sub'
 */
function isMatch($text: Dom7Array, selector: string): boolean {
  if ($text.length === 0) { return false }

  return $text[0].matches(selector)
}

function isBoldStyle($text: Dom7Array): boolean {
  const fontWeight = getStyleValue($text, 'font-weight')

  if (!fontWeight) { return false }
  if (fontWeight === 'bold' || fontWeight === 'bolder') { return true }

  const numericFontWeight = Number(fontWeight)

  return !Number.isNaN(numericFontWeight) && numericFontWeight >= 600
}

function hasTextDecoration($text: Dom7Array, value: string): boolean {
  const textDecoration = getStyleValue($text, 'text-decoration')
  const textDecorationLine = getStyleValue($text, 'text-decoration-line')

  return textDecoration.includes(value) || textDecorationLine.includes(value)
}

export function parseStyleHtml(
  textElem: DOMElement,
  node: Descendant,
  _editor: IDomEditor,
): Descendant {
  const $text = $(textElem)

  if (!Text.isText(node)) { return node }

  const textNode = node as StyledText

  // bold
  if (isMatch($text, 'b,strong') || isBoldStyle($text)) {
    textNode.bold = true
  }

  // italic
  if (isMatch($text, 'i,em') || ['italic', 'oblique'].includes(getStyleValue($text, 'font-style'))) {
    textNode.italic = true
  }

  // underline
  if (isMatch($text, 'u') || hasTextDecoration($text, 'underline')) {
    textNode.underline = true
  }

  // through
  if (isMatch($text, 's,strike') || hasTextDecoration($text, 'line-through')) {
    textNode.through = true
  }

  // sub
  if (isMatch($text, 'sub') || getStyleValue($text, 'vertical-align') === 'sub') {
    textNode.sub = true
  }

  // sup
  if (isMatch($text, 'sup') || getStyleValue($text, 'vertical-align') === 'super') {
    textNode.sup = true
  }

  // code
  if (isMatch($text, 'code')) {
    textNode.code = true
  }

  return textNode
}
