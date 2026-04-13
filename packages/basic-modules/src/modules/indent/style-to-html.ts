/**
 * @description textStyle to html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'

import $, { getOuterHTML } from '../../utils/dom'
import { appendStyleClassAndData, getTextStyleMode } from '../../utils/style-class'
import { IndentElement } from './custom-types'

export function styleToHtml(node: Descendant, elemHtml: string, editor?: IDomEditor): string {
  if (!Element.isElement(node)) { return elemHtml }

  const { indent } = node as IndentElement // 如 '2em'

  if (!indent) { return elemHtml }

  const $elem = $(elemHtml)

  if (getTextStyleMode(editor) === 'class') {
    appendStyleClassAndData($elem, 'indent', indent, editor, 'toHtml', () => {
      $elem.css('text-indent', indent)
    })
  } else {
    // 设置样式
    $elem.css('text-indent', indent)
  }

  // 输出 html
  return getOuterHTML($elem)
}
