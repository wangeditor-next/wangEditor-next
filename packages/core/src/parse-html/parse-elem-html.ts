/**
 * @description parse node html
 * @author wangfupeng
 */

import $, { Dom7Array } from 'dom7'
import { Descendant } from 'slate'

import { IDomEditor } from '../editor/interface'
import { PRE_PARSE_HTML_CONF_LIST, TEXT_TAGS } from '../index'
import {
  getTagName, isDOMComment, isDOMElement, isDOMText,
} from '../utils/dom'
import { deReplaceHtmlSpecialSymbols } from '../utils/util'
import { replaceSpace160 } from './helper'
import parseCommonElemHtml from './parse-common-elem-html'
import parseTextElemHtml, { parseTextElemHtmlToStyle } from './parse-text-elem-html'

function normalizeTextNodeContent(text: string, childNode: Node): string {
  const parentElem = childNode.parentElement

  if (parentElem == null) { return text }
  if (parentElem.closest('pre') == null) {
    text = text.replace(/[\r\n\t]+/g, '')
  }

  text = deReplaceHtmlSpecialSymbols(text)
  text = replaceSpace160(text)

  return text
}

type DescendantRecord = Record<string, unknown>

function mergeParentStyle(parentStyle: Descendant, node: Descendant): Descendant {
  const merged: DescendantRecord = {
    ...(parentStyle as DescendantRecord),
    ...(node as DescendantRecord),
  }

  Object.keys(node as DescendantRecord).forEach(key => {
    // `false` means the child explicitly clears a parent style mark.
    if ((node as DescendantRecord)[key] === false) {
      delete merged[key]
    }
  })

  return merged as Descendant
}

function parseChildNode(
  $childElem: Dom7Array,
  parentStyle: Descendant,
  editor: IDomEditor,
): Descendant[] | null {
  const childNode = $childElem[0] as unknown as Node

  if (isDOMElement(childNode)) {
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    const elem = parseElemHtml($childElem, editor)
    const styleWithoutText: DescendantRecord = { ...(parentStyle as DescendantRecord) }

    // Element 节点不应该继承传入的 { text: '' } 默认值，该值会导致slate识别错误
    delete styleWithoutText.text

    return Array.isArray(elem)
      ? elem.map(v => mergeParentStyle(styleWithoutText as Descendant, v))
      : [mergeParentStyle(styleWithoutText as Descendant, elem)]
  }

  if (isDOMComment(childNode)) { return null } // 过滤掉注释节点

  const text = isDOMText(childNode)
    ? { text: normalizeTextNodeContent(childNode.textContent || '', childNode) }
    : parseTextElemHtml($childElem, editor)

  return [mergeParentStyle(parentStyle, text)]
}

/**
 * 处理 DOM Elem html
 * @param $elem $elem
 * @param editor editor
 * @returns slate Descendant
 */
function parseElemHtml($elem: Dom7Array, editor: IDomEditor): Descendant | Descendant[] {
  // pre-parse
  PRE_PARSE_HTML_CONF_LIST.forEach(conf => {
    const { selector, preParseHtml } = conf

    if ($elem[0].matches(selector)) {
      $elem = $(preParseHtml($elem[0]))
    }
  })

  const tagName = getTagName($elem)

  // <span> 判断有没有 data-w-e-type 属性。有则是 elem ，没有则是 text
  if (tagName === 'span') {
    if ($elem.attr('data-w-e-type')) {
      return parseCommonElemHtml($elem, editor)
    }

    const childNodes = Array.from($elem[0].childNodes)
    const hasNonTextChild = childNodes.some(child => !isDOMText(child) && !isDOMComment(child))

    if (hasNonTextChild) {
      const parentStyle = parseTextElemHtmlToStyle($($elem[0]), editor)

      return childNodes.flatMap((child): Descendant[] => {
        const parsed = parseChildNode($(child), parentStyle, editor)

        return parsed || []
      })

    }

    return parseTextElemHtml($elem, editor)
  }

  // <code> 特殊处理
  if (tagName === 'code') {
    const parentTagName = getTagName($elem.parent())

    if (parentTagName === 'pre') {
      // <code> 在 <pre> 内，则是 elem
      return parseCommonElemHtml($elem, editor)
    }
    // <code> 不在 <pre> 内，则是 text
    return parseTextElemHtml($elem, editor)

  }

  // 非 <code> ，正常处理
  if (TEXT_TAGS.includes(tagName)) {
    const childNodes = Array.from($elem[0].childNodes)
    const hasNonTextChild = childNodes.some(child => !isDOMText(child) && !isDOMComment(child))

    if (hasNonTextChild) {
      const parentStyle = parseTextElemHtmlToStyle($($elem[0]), editor)

      return childNodes.flatMap((child): Descendant[] => {
        const parsed = parseChildNode($(child), parentStyle, editor)

        return parsed || []
      })
    }
    // text node
    return parseTextElemHtml($elem, editor)
  }
  // elem node
  return parseCommonElemHtml($elem, editor)

}

export default parseElemHtml
