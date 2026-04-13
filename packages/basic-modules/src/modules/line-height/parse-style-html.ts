/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'

import $, { DOMElement, getStyleValue } from '../../utils/dom'
import { getStyleValueFromDataOrClass } from '../../utils/style-class'
import { LineHeightElement } from './custom-types'

export function parseStyleHtml(elem: DOMElement, node: Descendant, editor: IDomEditor): Descendant {
  const $elem = $(elem)

  if (!Element.isElement(node)) { return node }

  const elemNode = node as LineHeightElement

  const { lineHeightList = [] } = editor.getMenuConfig('lineHeight')
  const lineHeight = getStyleValue($elem, 'line-height') || getStyleValueFromDataOrClass($elem, 'lineHeight', editor)

  if (lineHeight && lineHeightList.includes(lineHeight)) {
    elemNode.lineHeight = lineHeight
  }

  return elemNode
}
