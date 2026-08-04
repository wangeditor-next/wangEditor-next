/**
 * @description DOM 操作
 * @author wangfupeng
 */

import $, { attr } from 'dom7'

// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Slate's types with the same name as globals. (2019/11/27)
// https://github.com/microsoft/TypeScript/issues/35002
/* eslint-disable  no-undef */
import DOMNode = globalThis.Node
import DOMComment = globalThis.Comment
import DOMElement = globalThis.Element
import DOMText = globalThis.Text
import DOMRange = globalThis.Range
import DOMSelection = globalThis.Selection
import DOMStaticRange = globalThis.StaticRange
/* eslint-disable  no-undef */

if (attr) { $.fn.attr = attr }

export type { Dom7Array } from 'dom7'

export default $
export {
  DOMComment, DOMElement, DOMNode, DOMRange, DOMSelection, DOMStaticRange, DOMText,
}
