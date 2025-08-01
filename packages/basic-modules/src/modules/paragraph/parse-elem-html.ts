/**
 * @description parse html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import { CustomElement } from '../../../../custom-types'
import $, { DOMElement } from '../../utils/dom'
import { ParagraphElement } from './custom-types'

function hasTypeInChildren(node: CustomElement, targetType: string) {
  if (!node.children) { return false }

  for (const child of node.children) {
    if ('type' in child && child.type === targetType) { return true }
    if ('children' in child && hasTypeInChildren(child as CustomElement, targetType)) { return true }
  }

  return false
}

function parseParagraphHtml(
  elem: DOMElement,
  children: Descendant[],
  editor: IDomEditor,
): ParagraphElement {
  const $elem = $(elem)

  children = children.filter(child => {
    if (Text.isText(child)) { return true }
    if (editor.isInline(child)) { return true }

    // 包含 image、link、video、iframe 保留, 目前仅额外支持这四种类型
    if (hasTypeInChildren(child, 'image')) { return true }
    if (hasTypeInChildren(child, 'link')) { return true }
    if (hasTypeInChildren(child, 'video')) { return true }
    if (hasTypeInChildren(child, 'iframe')) { return true }

    return false
  })

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{ text: $elem.text().replace(/\s+/gm, ' ') }]
  }

  return {
    type: 'paragraph',
    // @ts-ignore
    children,
  }
}

export const parseParagraphHtmlConf = {
  selector: 'p:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseParagraphHtml,
}
