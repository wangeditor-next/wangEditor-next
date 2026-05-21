/**
 * @description parse html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import {
  Descendant, Element as SlateElement, Node, Text,
} from 'slate'

import $, { DOMElement } from '../../utils/dom'
import { BlockQuoteElement } from './custom-types'

function isTextOrInline(child: Descendant, editor: IDomEditor): boolean {
  if (Text.isText(child)) { return true }
  if (editor.isInline(child)) { return true }
  return false
}

function appendLineBreak(children: Descendant[]) {
  const lastChild = children[children.length - 1]

  // avoid duplicate '\n' during flattening
  if (Text.isText(lastChild) && lastChild.text.endsWith('\n')) { return }
  children.push({ text: '\n' })
}

function hasNextBlockChild(children: Descendant[], startIndex: number, editor: IDomEditor): boolean {
  for (let i = startIndex + 1; i < children.length; i += 1) {
    const child = children[i]

    if (SlateElement.isElement(child) && !editor.isInline(child)) {
      return true
    }
  }
  return false
}

function flattenBlockChild(child: SlateElement, editor: IDomEditor): Descendant[] {
  const normalizedChildren = child.children.filter(node => isTextOrInline(node, editor))

  if (normalizedChildren.length > 0) { return normalizedChildren }

  // fallback for nested block content
  const text = Node.string(child)

  if (!text) { return [] }
  return [{ text }]
}

function parseHtml(
  elem: DOMElement,
  children: Descendant[],
  editor: IDomEditor,
): BlockQuoteElement {
  const $elem = $(elem)
  const normalizedChildren: Descendant[] = []

  children.forEach((child, index) => {
    if (isTextOrInline(child, editor)) {
      normalizedChildren.push(child)
      return
    }

    if (!SlateElement.isElement(child)) { return }

    normalizedChildren.push(...flattenBlockChild(child, editor))

    // Compatibility for HTML like <blockquote><div>line1</div><div>line2</div></blockquote>
    if (hasNextBlockChild(children, index, editor)) {
      appendLineBreak(normalizedChildren)
    }
  })

  children = normalizedChildren

  // 无 children ，则用纯文本
  if (children.length === 0) {
    children = [{ text: $elem.text().replace(/\s+/gm, ' ') }]
  }

  return {
    type: 'blockquote',
    // @ts-ignore
    children,
  }
}

export const parseHtmlConf = {
  selector: 'blockquote:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseHtml,
}
