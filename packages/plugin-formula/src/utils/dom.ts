/**
 * @description DOM 操作
 * @author wangfupeng
 */

import $, {
  append, find, focus, html, is, on, parents, val,
} from 'dom7'

// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Slate's types with the same name as globals. (2019/11/27)
// https://github.com/microsoft/TypeScript/issues/35002
import DOMNode = globalThis.Node
import DOMComment = globalThis.Comment
import DOMElement = globalThis.Element
import DOMText = globalThis.Text
import DOMRange = globalThis.Range
import DOMSelection = globalThis.Selection
import DOMStaticRange = globalThis.StaticRange

if (append) { $.fn.append = append }
if (html) { $.fn.html = html }
if (val) { $.fn.val = val }
if (on) { $.fn.on = on }
if (focus) { $.fn.focus = focus }
if (is) { $.fn.is = is }
if (parents) { $.fn.parents = parents }
if (find) { $.fn.find = find }

export type { Dom7Array } from 'dom7'
export default $
export {
  DOMComment, DOMElement, DOMNode, DOMRange, DOMSelection, DOMStaticRange, DOMText,
}
