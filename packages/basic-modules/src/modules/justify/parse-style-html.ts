/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'

import $, { DOMElement, getStyleValue } from '../../utils/dom'
import { getStyleValueFromDataOrClass } from '../../utils/style-class'
import { JustifyElement } from './custom-types'

export function parseStyleHtml(elem: DOMElement, node: Descendant, _editor: IDomEditor): Descendant {
  const $elem = $(elem)

  if (!Element.isElement(node)) { return node }

  const elemNode = node as JustifyElement

  const textAlign = getStyleValue($elem, 'text-align') || getStyleValueFromDataOrClass($elem, 'textAlign', _editor)

  if (textAlign) {
    elemNode.textAlign = textAlign
  }

  return elemNode
}
