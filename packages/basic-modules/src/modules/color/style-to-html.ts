/**
 * @description textStyle to html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { getOuterHTML, getTagName, isPlainText } from '../../utils/dom'
import { appendStyleClassAndData, getTextStyleMode } from '../../utils/style-class'
import { ColorText } from './custom-types'

/**
 * style to html
 * @param textNode slate text node
 * @param textHtml text html
 * @param editor editor instance
 * @returns styled html
 */
export function styleToHtml(textNode: Descendant, textHtml: string, editor?: IDomEditor): string {
  if (!Text.isText(textNode)) { return textHtml }

  const { color, bgColor } = textNode as ColorText

  if (!color && !bgColor) { return textHtml }

  let $text

  if (isPlainText(textHtml)) {
    // textHtml 是纯文本，不是 html tag
    $text = $(`<span>${textHtml}</span>`)
  } else {
    // textHtml 是 html tag
    $text = $(textHtml)
    const tagName = getTagName($text)

    if (tagName !== 'span') {
      // 如果不是 span ，则包裹一层，接下来要设置 css
      $text = $(`<span>${textHtml}</span>`)
    }
  }

  const textStyleMode = getTextStyleMode(editor)

  if (textStyleMode === 'class') {
    if (color) { appendStyleClassAndData($text, 'color', color) }
    if (bgColor) { appendStyleClassAndData($text, 'bgColor', bgColor) }
  } else {
    // 设置样式
    if (color) { $text.css('color', color) }
    if (bgColor) { $text.css('background-color', bgColor) }
  }

  // 输出 html
  return getOuterHTML($text)
}
