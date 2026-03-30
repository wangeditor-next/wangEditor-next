/**
 * @description textStyle to html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'

import $, { getOuterHTML } from '../../utils/dom'
import { appendStyleClassAndData, getTextStyleMode } from '../../utils/style-class'
import { JustifyElement } from './custom-types'

export function styleToHtml(node: Descendant, elemHtml: string, editor?: IDomEditor): string {
  if (!Element.isElement(node)) { return elemHtml }

  const { textAlign } = node as JustifyElement // 如 'left'/'right'/'center' 等

  if (!textAlign) { return elemHtml }

  const $elem = $(elemHtml)

  if (getTextStyleMode(editor) === 'class') {
    appendStyleClassAndData($elem, 'textAlign', textAlign)
  } else {
    // 设置样式
    $elem.css('text-align', textAlign)
  }

  // 输出 html
  const outerHtml = getOuterHTML($elem)

  return outerHtml
}
