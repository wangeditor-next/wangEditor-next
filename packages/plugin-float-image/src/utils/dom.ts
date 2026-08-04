/**
 * @description DOM 操作
 * @author cycleccc
 */

import $, {
  addClass,
  append,
  attr,
  children,
  css,
  dataset,
  Dom7Array,
  empty,
  filter,
  find,
  focus,
  hasClass,
  height,
  hide,
  html,
  off,
  on,
  parents,
  prepend,
  remove,
  removeAttr,
  removeClass,
  show,
  text,
  val,
  width,
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

export type { Dom7Array } from 'dom7'

if (css) { $.fn.css = css }
if (append) { $.fn.append = append }
if (prepend) { $.fn.prepend = prepend }
if (addClass) { $.fn.addClass = addClass }
if (removeClass) { $.fn.removeClass = removeClass }
if (hasClass) { $.fn.hasClass = hasClass }
if (on) { $.fn.on = on }
if (off) { $.fn.off = off }
if (focus) { $.fn.focus = focus }
if (attr) { $.fn.attr = attr }
if (removeAttr) { $.fn.removeAttr = removeAttr }
if (hide) { $.fn.hide = hide }
if (show) { $.fn.show = show }
if (parents) { $.fn.parents = parents }
if (dataset) { $.fn.dataset = dataset }
if (val) { $.fn.val = val }
if (text) { $.fn.text = text }
if (html) { $.fn.html = html }
if (children) { $.fn.children = children }
if (remove) { $.fn.remove = remove }
if (find) { $.fn.find = find }
if (width) { $.fn.width = width }
if (height) { $.fn.height = height }
if (filter) { $.fn.filter = filter }
if (empty) { $.fn.empty = empty }

export function getStyleValue($elem: Dom7Array, styleKey: string): string {
  let res = ''

  const styleStr = $elem.attr('style') || ''
  const styleArr = styleStr.split(';')
  const length = styleArr.length

  for (let i = 0; i < length; i += 1) {
    const styleItemStr = styleArr[i]

    if (styleItemStr) {
      const arr = styleItemStr.split(':')

      if (arr[0].trim() === styleKey) {
        res = arr[1].trim()
      }
    }
  }

  return res
}

export default $
export {
  DOMComment, DOMElement, DOMNode, DOMRange, DOMSelection, DOMStaticRange, DOMText,
}
