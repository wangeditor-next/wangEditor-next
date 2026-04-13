/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { DOMElement, getStyleValue } from '../../utils/dom'
import { getStyleValueFromDataOrClass } from '../../utils/style-class'
import { FontSizeAndFamilyText } from './custom-types'

export function parseStyleHtml(
  text: DOMElement,
  node: Descendant,
  _editor: IDomEditor,
): Descendant {
  const $text = $(text)

  if (!Text.isText(node)) {
    return node
  }

  const textNode = node as FontSizeAndFamilyText

  // -------- 处理 font-size --------
  let fontSize = getStyleValue($text, 'font-size')

  if (!fontSize) { fontSize = getStyleValueFromDataOrClass($text, 'fontSize', _editor) }

  if (fontSize) {
    textNode.fontSize = fontSize
  }

  // 这里需要替换掉 "， css 设置 font-family，会将有空格的字体使用 " 包裹
  const styleFontFamily = getStyleValue($text, 'font-family')
  const classFontFamily = getStyleValueFromDataOrClass($text, 'fontFamily', _editor)
  const fontFamily = (styleFontFamily || classFontFamily).replace(/"/g, '')

  if (fontFamily) {
    textNode.fontFamily = fontFamily
  }

  return textNode
}
