/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { DOMElement, getStyleValue } from '../../utils/dom'
import { getStyleValueFromDataOrClass } from '../../utils/style-class'
import { ColorText } from './custom-types'

export function parseStyleHtml(text: DOMElement, node: Descendant, _editor: IDomEditor): Descendant {
  const $text = $(text)

  if (!Text.isText(node)) { return node }

  const textNode = node as ColorText

  let color = getStyleValue($text, 'color')

  if (!color) { color = getStyleValueFromDataOrClass($text, 'color', _editor) }

  if (color) {
    textNode.color = color
  }

  let bgColor = getStyleValue($text, 'background-color')

  if (!bgColor) { bgColor = getStyleValue($text, 'background') } // word 背景色
  if (!bgColor) { bgColor = getStyleValueFromDataOrClass($text, 'bgColor', _editor) }
  if (bgColor) {
    textNode.bgColor = bgColor
  }

  return textNode
}
