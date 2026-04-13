/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element } from 'slate'

import $, { DOMElement, getStyleValue } from '../../utils/dom'
import { getStyleValueFromDataOrClass } from '../../utils/style-class'
import { IndentElement } from './custom-types'

export function parseStyleHtml(elem: DOMElement, node: Descendant, _editor: IDomEditor): Descendant {
  const $elem = $(elem)

  if (!Element.isElement(node)) { return node }

  const elemNode = node as IndentElement

  const indent = getStyleValue($elem, 'text-indent') || getStyleValueFromDataOrClass($elem, 'indent', _editor)
  const indentNumber = parseInt(indent, 10)

  if (indent && indentNumber > 0) {
    elemNode.indent = indent
  }

  return elemNode
}
