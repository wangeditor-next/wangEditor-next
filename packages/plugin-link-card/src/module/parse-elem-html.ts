/**
 * @description parse elem html
 * @author wangfupeng
 */

import { IDomEditor, SlateDescendant, SlateElement } from '@wangeditor-next/editor'

import { DOMElement } from '../utils/dom'
import { LinkCardElement } from './custom-types'

function parseHtml(
  elem: DOMElement,
  _children: SlateDescendant[],
  _editor: IDomEditor,
): SlateElement {
  const link = elem.getAttribute('data-link') || ''
  const title = elem.getAttribute('data-title') || ''
  const target = elem.getAttribute('data-target') || undefined
  const iconImgSrc = elem.getAttribute('data-iconImgSrc') || ''

  return {
    type: 'link-card',
    link,
    title,
    ...(target ? { target } : {}),
    iconImgSrc,
    children: [{ text: '' }], // void node 必须有一个空白 text
  } as LinkCardElement
}

const parseHtmlConf = {
  selector: 'div[data-w-e-type="link-card"]',
  parseElemHtml: parseHtml,
}

export default parseHtmlConf
