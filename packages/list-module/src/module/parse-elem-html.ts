/**
 * @description parse list HTML
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Dom7Array } from 'dom7'
import { Descendant, Element as SlateElement, Text } from 'slate'

import $, { DOMElement, getTagName } from '../utils/dom'
import { HeadingType, ListItemElement, OrderedListType } from './custom-types'
import { isHeadingType, isListNode } from './helpers'

function getOrdered($elem: Dom7Array): boolean {
  return getTagName($elem.parent()) === 'ol'
}

function getOrderedStart($elem: Dom7Array): number | undefined {
  const $list = $elem.parent()

  if (getTagName($list) !== 'ol') {
    return undefined
  }

  const value = ($list.attr('start') || '').trim()
  const start = Number.parseInt(value, 10)

  return Number.isNaN(start) ? undefined : start
}

function getOrderedType($elem: Dom7Array): OrderedListType | undefined {
  const $list = $elem.parent()

  if (getTagName($list) !== 'ol') {
    return undefined
  }

  const orderType = ($list.attr('type') || '').trim()

  if (orderType === '1' || orderType === 'a' || orderType === 'A' || orderType === 'i' || orderType === 'I') {
    return orderType
  }

  return undefined
}

function getLevel($elem: Dom7Array): number {
  const indent = ($elem.attr('data-w-e-list-indent') || '').trim()

  if (/^\d+$/.test(indent)) {
    return Number.parseInt(indent, 10)
  }

  let listAncestorCount = 0
  let $current: Dom7Array = $elem.parent()

  while ($current.length > 0) {
    const tagName = getTagName($current)

    if (tagName === 'ul' || tagName === 'ol') {
      listAncestorCount += 1
    }
    $current = $current.parent()
  }

  return Math.max(0, listAncestorCount - 1)
}

function getListMode($elem: Dom7Array, children: Descendant[]): 'standard' | 'outline' {
  const declaredMode = $elem.parent().attr('data-w-e-list-mode')

  if (declaredMode === 'outline' || declaredMode === 'standard') {
    return declaredMode
  }

  return getOrdered($elem) && children.some(child => {
    return SlateElement.isElement(child) && isHeadingType(child.type)
  })
    ? 'outline'
    : 'standard'
}

function getRestart($elem: Dom7Array): number | undefined {
  const value = ($elem.attr('data-w-e-list-restart') || '').trim()

  if (!/^\d+$/.test(value)) {
    return undefined
  }

  const restart = Number.parseInt(value, 10)

  return restart > 0 ? restart : undefined
}

function isFirstListItem($elem: Dom7Array): boolean {
  let previous = $elem[0]?.previousElementSibling

  while (previous != null) {
    if (previous.tagName.toLowerCase() === 'li') {
      return false
    }
    previous = previous.previousElementSibling
  }

  return true
}

function getOutlineRestart($elem: Dom7Array): number | undefined {
  const restart = getRestart($elem)

  if (restart !== undefined) {
    return restart
  }
  if ($elem.attr('data-w-e-outline-number') != null || !isFirstListItem($elem)) {
    return undefined
  }

  return getOrderedStart($elem)
}

function isStructuralWhitespaceText(child: Descendant): boolean {
  return Text.isText(child) && child.text.trim() === ''
}

function appendTextLikeChildren(target: Descendant[], children: Descendant[], editor: IDomEditor) {
  children.forEach(child => {
    if (isStructuralWhitespaceText(child)) {
      return
    }
    if (Text.isText(child) || editor.isInline(child)) {
      target.push(child)
      return
    }
    if (SlateElement.isElement(child)) {
      appendTextLikeChildren(target, child.children, editor)
    }
  })
}

function getHeadingNode(children: Descendant[]): SlateElement | null {
  for (const child of children) {
    if (SlateElement.isElement(child) && isHeadingType(child.type)) {
      return child
    }
  }

  return null
}

function parseItemHtml(
  elem: DOMElement,
  children: Descendant[],
  editor: IDomEditor
): ListItemElement | ListItemElement[] {
  const $elem = $(elem)
  const level = getLevel($elem)
  const directChildren: Descendant[] = []
  const nestedListChildren: ListItemElement[] = []

  children.forEach(child => {
    if (isStructuralWhitespaceText(child)) {
      return
    }
    if (isListNode(child) && child.level > level) {
      nestedListChildren.push(child)
      return
    }
    directChildren.push(child)
  })

  const headingNode = getHeadingNode(directChildren)
  const headingType = headingNode != null && isHeadingType(headingNode.type)
    ? (headingNode.type as HeadingType)
    : undefined
  const listMode = getListMode($elem, directChildren)
  const normalizedChildren: Descendant[] = []

  appendTextLikeChildren(normalizedChildren, directChildren, editor)

  if (normalizedChildren.length === 0) {
    normalizedChildren.push(
      nestedListChildren.length > 0 ? { text: '' } : { text: $elem.text().replace(/\s+/gm, ' ') }
    )
  }

  const ordered = getOrdered($elem)
  const start = getOrderedStart($elem)
  const orderType = getOrderedType($elem)
  const outline = ordered && listMode === 'outline' && headingType !== undefined
  const listRestart = outline ? getOutlineRestart($elem) : undefined
  const item: ListItemElement = {
    type: 'list-item',
    ordered,
    level: outline ? Number.parseInt(headingType.slice('header'.length), 10) - 1 : level,
    ...(start !== undefined && !outline ? { start } : {}),
    ...(orderType !== undefined ? { orderType } : {}),
    ...(headingType !== undefined ? { headingType } : {}),
    ...(outline ? { listMode: 'outline' as const } : {}),
    ...(listRestart !== undefined ? { listRestart } : {}),
    // @ts-ignore List items retain the established text/inline children shape.
    children: normalizedChildren,
  }

  return nestedListChildren.length === 0 ? item : [item, ...nestedListChildren]
}

export const parseItemHtmlConf = {
  selector: 'li:not([data-w-e-type])',
  parseElemHtml: parseItemHtml,
}

function parseListHtml(
  _elem: DOMElement,
  children: Descendant[],
  _editor: IDomEditor
): ListItemElement[] {
  // @ts-ignore Nested lists return arrays which must be flattened.
  return children.flat(Infinity)
}

export const parseListHtmlConf = {
  selector: 'ul:not([data-w-e-type]),ol:not([data-w-e-type])',
  parseElemHtml: parseListHtml,
}
