/**
 * @description DOM 操作
 * @author wangfupeng
 */

import $, {
  append, attr, Dom7Array, empty, focus, hasClass, html, on, parent, val,
} from 'dom7'

import { videoStyle } from '../module/custom-types'

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

export { Dom7Array } from 'dom7'

if (append) { $.fn.append = append }
if (on) { $.fn.on = on }
if (focus) { $.fn.focus = focus }
if (attr) { $.fn.attr = attr }
if (val) { $.fn.val = val }
if (html) { $.fn.html = html }
if (parent) { $.fn.parent = parent }
if (hasClass) { $.fn.hasClass = hasClass }
if (empty) { $.fn.empty = empty }

export default $

/**
 * 获取 tagName lower-case
 * @param $elem $elem
 */
export function getTagName($elem: Dom7Array): string {
  if ($elem.length) { return $elem[0].tagName.toLowerCase() }
  return ''
}

/**
 * 生成带 size 样式的 iframe html
 * @param iframeHtml iframe html string
 * @param width width
 * @param height height
 * @returns iframe html string with size style
 */
export function genSizeStyledIframeHtml(
  iframeHtml: string,
  width = 'auto',
  height = 'auto',
  style: videoStyle = {},
  classMode = false,
): string {
  const $iframe = $(iframeHtml)
  const { width: styleWidth = '', height: styleHeight = '' } = style
  const widthData = styleWidth ? `data-w-e-style-width="${styleWidth}"` : ''
  const heightData = styleHeight ? `data-w-e-style-height="${styleHeight}"` : ''

  $iframe.attr('width', width)
  $iframe.attr('height', height)

  if (!classMode) {
    let styleStr = ''

    if (styleWidth) { styleStr += `width: ${styleWidth};` }
    if (styleHeight) { styleStr += `height: ${styleHeight};` }
    $iframe.attr('style', styleStr)
  } else {
    if (widthData) { $iframe.attr('data-w-e-style-width', styleWidth) }
    if (heightData) { $iframe.attr('data-w-e-style-height', styleHeight) }
    $iframe.removeAttr('style')
  }
  return $iframe[0].outerHTML
}
export {
  DOMComment, DOMElement, DOMNode, DOMRange, DOMSelection, DOMStaticRange, DOMText,
}
