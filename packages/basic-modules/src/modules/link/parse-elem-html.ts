/**
 * @description parse html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element, Text } from 'slate'

import $, { DOMElement } from '../../utils/dom'
import { ImageElement } from '../image/custom-types'
import { LinkElement } from './custom-types'
import { normalizeLinkUrl } from './url'

function parseHtml(
  elem: DOMElement,
  children: Descendant[],
  editor: IDomEditor
): LinkElement | ImageElement {
  const $elem = $(elem)

  children = children.filter(child => {
    if (Text.isText(child)) {
      return true
    }
    if (editor.isInline(child)) {
      return true
    }
    return false
  })

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{ text: $elem.text().replace(/\s+/gm, ' ') }]
  }

  // Images store their link on the image node, so restore that shape when
  // reading the semantic anchor emitted by the image serializer.
  const imageChild = children[0]
  const imageHref =
    Element.isElement(imageChild) && imageChild.type === 'image'
      ? (imageChild as { href?: string }).href || ''
      : ''
  const dataHref = $elem.find('img').attr('data-href') || ''

  if (
    children.length === 1 &&
    Element.isElement(imageChild) &&
    imageChild.type === 'image' &&
    (imageHref || dataHref)
  ) {
    return {
      ...(imageChild as ImageElement),
      href: normalizeLinkUrl($elem.attr('href') || ''),
    }
  }

  return {
    type: 'link',
    url: normalizeLinkUrl($elem.attr('href') || ''),
    target: $elem.attr('target') || '',
    // @ts-ignore
    children,
  }
}

export const parseHtmlConf = {
  selector: 'a:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseHtml,
}
