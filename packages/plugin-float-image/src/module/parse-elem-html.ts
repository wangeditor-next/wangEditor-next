/**
 * @description parse elem html
 * @author cycleccc
 */

import { IDomEditor, SlateDescendant } from '@wangeditor-next/editor'

import $, { Dom7Array, DOMElement, getStyleValue } from '../utils/dom'
import { ImageElement } from './custom-types'

function getFloatValue($elem: Dom7Array): string {
  const styleFloat = getStyleValue($elem, 'float')

  if (styleFloat) { return styleFloat }

  const dataFloat = ($elem.attr('data-w-e-style-float') || '').trim()

  if (dataFloat) { return dataFloat }

  const classAttr = $elem.attr('class') || ''
  const classList = classAttr.trim().split(/\s+/).filter(Boolean)

  if (classList.includes('w-e-float-image-left')) { return 'left' }
  if (classList.includes('w-e-float-image-right')) { return 'right' }
  if (classList.includes('w-e-float-image-none')) { return 'none' }

  return ''
}

function parseHtml(elem: DOMElement, _children: SlateDescendant[], _editor: IDomEditor): ImageElement {
  const $elem = $(elem)
  let href = $elem.attr('data-href') || ''
  const widthAttr = $elem.attr('width') || ''
  const heightAttr = $elem.attr('height') || ''
  const styleWidth = getStyleValue($elem, 'width') || $elem.attr('data-w-e-style-width') || widthAttr
  const styleHeight = getStyleValue($elem, 'height') || $elem.attr('data-w-e-style-height') || heightAttr
  const styleFloat = getFloatValue($elem)

  href = decodeURIComponent(href) // 兼容 V4

  return {
    type: 'image',
    src: $elem.attr('src') || '',
    alt: $elem.attr('alt') || '',
    href,
    style: {
      width: styleWidth,
      height: styleHeight,
      float: styleFloat,
    },
    width: widthAttr,
    height: heightAttr,
    children: [{ text: '' }], // void node 有一个空白 text
  }
}

export const parseHtmlConf = {
  selector: 'img:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseHtml,
}
