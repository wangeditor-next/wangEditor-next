/**
 * @description parse elem html
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Dom7Array } from 'dom7'
import { Descendant, Element as SlateElement, Text } from 'slate'

import $, { DOMElement, getTagName } from '../utils/dom'
import { ListItemElement, OrderedListType } from './custom-types'

/**
 * 获取 ordered
 * @param $elem list $elem
 */
function getOrdered($elem: Dom7Array): boolean {
  const $list = $elem.parent()
  const listTagName = getTagName($list)

  if (listTagName === 'ol') { return true }
  return false
}

function getOrderedStart($elem: Dom7Array): number | undefined {
  const $list = $elem.parent()

  if (getTagName($list) !== 'ol') { return undefined }
  const startStr = ($list.attr('start') || '').trim()

  if (startStr === '') { return undefined }
  const start = Number.parseInt(startStr, 10)

  if (Number.isNaN(start)) { return undefined }
  return start
}

function getOrderedType($elem: Dom7Array): OrderedListType | undefined {
  const $list = $elem.parent()

  if (getTagName($list) !== 'ol') { return undefined }
  const orderType = ($list.attr('type') || '').trim()

  if (orderType === '1'
    || orderType === 'a'
    || orderType === 'A'
    || orderType === 'i'
    || orderType === 'I') {
    return orderType
  }

  return undefined
}

/**
 * 获取 level
 * @param $elem list $elem
 */
function getLevel($elem: Dom7Array): number {
  let listAncestorCount = 0
  let $cur: Dom7Array = $elem.parent()

  while ($cur.length > 0) {
    const tagName = getTagName($cur)

    if (tagName === 'ul' || tagName === 'ol') {
      listAncestorCount += 1
    }
    $cur = $cur.parent()
  }

  return Math.max(0, listAncestorCount - 1)
}

function isStructuralWhitespaceText(child: Descendant): boolean {
  return Text.isText(child) && child.text.trim() === ''
}

function appendTextLikeChildren(
  target: Descendant[],
  children: Descendant[],
  editor: IDomEditor,
) {
  children.forEach(child => {
    if (isStructuralWhitespaceText(child)) {
      return
    }

    if (Text.isText(child)) {
      target.push(child)
      return
    }

    if (editor.isInline(child)) {
      target.push(child)
      return
    }

    if (SlateElement.isElement(child)) {
      appendTextLikeChildren(target, child.children, editor)
    }
  })
}

function parseItemHtml(
  elem: DOMElement,
  children: Descendant[],
  editor: IDomEditor,
): ListItemElement | ListItemElement[] {
  const $elem = $(elem)
  const normalizedChildren: Descendant[] = []
  const nestedListChildren: ListItemElement[] = []

  children.forEach(child => {
    if (isStructuralWhitespaceText(child)) {
      return
    }

    if (Text.isText(child)) {
      normalizedChildren.push(child)
      return
    }

    if (editor.isInline(child)) {
      normalizedChildren.push(child)
      return
    }

    if (DomEditor.checkNodeType(child, 'list-item')) {
      nestedListChildren.push(child as ListItemElement)
      return
    }

    if (SlateElement.isElement(child)) {
      appendTextLikeChildren(normalizedChildren, child.children, editor)
    }
  })

  // 无 children ，则用纯文本
  if (normalizedChildren.length === 0) {
    if (nestedListChildren.length > 0) {
      normalizedChildren.push({ text: '' })
    } else {
      normalizedChildren.push({ text: $elem.text().replace(/\s+/gm, ' ') })
    }
  }

  const ordered = getOrdered($elem)
  const level = getLevel($elem)
  const start = getOrderedStart($elem)
  const orderType = getOrderedType($elem)

  const currentItem: ListItemElement = {
    type: 'list-item',
    ordered,
    level,
    ...(start !== undefined ? { start } : {}),
    ...(orderType !== undefined ? { orderType } : {}),
    // @ts-ignore
    children: normalizedChildren,
  }

  if (nestedListChildren.length === 0) { return currentItem }
  return [currentItem, ...nestedListChildren]
}

export const parseItemHtmlConf = {
  selector: 'li:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseItemHtml,
}

function parseListHtml(
  _elem: DOMElement,
  children: Descendant[],
  _editor: IDomEditor,
): ListItemElement[] {
  // @ts-ignore flatten 因为可能有 ul/ol 嵌套，重要！！！
  return children.flat(Infinity)
}

export const parseListHtmlConf = {
  selector: 'ul:not([data-w-e-type]),ol:not([data-w-e-type])', // data-w-e-type 属性，留给自定义元素，保证扩展性
  parseElemHtml: parseListHtml,
}
