/**
 * @description parse html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant } from 'slate'

import $, { DOMElement, getStyleValue } from '../../utils/dom'
import { ImageElement } from './custom-types'

function parseHtml(elem: DOMElement, _children: Descendant[], _editor: IDomEditor): ImageElement {
  const $elem = $(elem)
  let href = $elem.attr('data-href') || ''
  const widthAttr = $elem.attr('width') || ''
  const heightAttr = $elem.attr('height') || ''
  const styleWidth = getStyleValue($elem, 'width') || $elem.attr('data-w-e-style-width') || widthAttr
  const styleHeight = getStyleValue($elem, 'height') || $elem.attr('data-w-e-style-height') || heightAttr

  href = decodeURIComponent(href) // 兼容 V4

  return {
    type: 'image',
    src: $elem.attr('src') || '',
    alt: $elem.attr('alt') || '',
    href,
    style: {
      width: styleWidth,
      height: styleHeight,
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
