/**
 * @description textStyle to html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'

import $, { getOuterHTML } from '../../utils/dom'
import { appendStyleClassAndData, getTextStyleMode } from '../../utils/style-class'
import { LineHeightElement } from './custom-types'

export function styleToHtml(node: Descendant, elemHtml: string, editor?: IDomEditor): string {
  if (!Element.isElement(node)) { return elemHtml }

  const { lineHeight } = node as LineHeightElement // 如 '1' '1.5'

  if (!lineHeight) { return elemHtml }

  const $elem = $(elemHtml)

  if (getTextStyleMode(editor) === 'class') {
    appendStyleClassAndData($elem, 'lineHeight', lineHeight)
  } else {
    // 设置样式
    $elem.css('line-height', lineHeight)
  }

  // 输出 html
  return getOuterHTML($elem)
}
