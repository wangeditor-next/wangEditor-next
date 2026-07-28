/**
 * @description list helpers
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Editor, Node, Path } from 'slate'

import {
  HeadingType,
  ListItemElement,
  OrderedListType,
  OutlineListItemElement,
} from './custom-types'

export function isListNode(node: Node): node is ListItemElement {
  return DomEditor.checkNodeType(node, 'list-item')
}

// Keep the legacy name for callers that distinguish the persisted list shape.
export const isLegacyListItem = isListNode

export function isHeadingType(value: unknown): value is HeadingType {
  return typeof value === 'string' && /^header[1-6]$/.test(value)
}

export function getHeadingType(node: Node): HeadingType | null {
  if (!isListNode(node) || !isHeadingType(node.headingType)) {
    return null
  }

  return node.headingType
}

export function getListIndent(node: Node): number {
  if (!isListNode(node)) {
    return 0
  }

  return node.level > 0 ? Math.floor(node.level) : 0
}

export function getListMode(node: Node): 'standard' | 'outline' {
  return isListNode(node) && node.listMode === 'outline' ? 'outline' : 'standard'
}

export function isOutlineListNode(node: Node): node is OutlineListItemElement {
  return (
    isListNode(node) &&
    node.ordered === true &&
    node.listMode === 'outline' &&
    isHeadingType(node.headingType)
  )
}

export function getOutlineLevel(node: Node): number {
  const headingType = getHeadingType(node)
  const match = headingType == null ? null : /^header([1-6])$/.exec(headingType)

  if (match != null) {
    return Number.parseInt(match[1], 10)
  }

  return getListIndent(node) + 1
}

export function getNormalizedOrderedListStart(elem: ListItemElement): number {
  const { ordered = false, start } = elem

  if (!ordered || typeof start !== 'number' || Number.isNaN(start)) {
    return 1
  }

  return start
}

export function getNormalizedOrderedListType(elem: ListItemElement): OrderedListType {
  const { orderType } = elem

  if (orderType === 'a' || orderType === 'A' || orderType === 'i' || orderType === 'I') {
    return orderType
  }

  return '1'
}

export function hasSameListConfig(a: ListItemElement, b: ListItemElement): boolean {
  if (a.ordered !== b.ordered) {
    return false
  }
  if (!a.ordered) {
    return true
  }

  return (
    getNormalizedOrderedListType(a) === getNormalizedOrderedListType(b) &&
    getNormalizedOrderedListStart(a) === getNormalizedOrderedListStart(b)
  )
}

export function getOrderedItemNumber(editor: IDomEditor, elem: ListItemElement): number {
  if (!elem.ordered) {
    return 1
  }

  const level = getListIndent(elem)
  let number = getNormalizedOrderedListStart(elem)
  const index = DomEditor.findPath(editor, elem)[0]

  if (index <= 0) {
    return number
  }

  for (let previousIndex = index - 1; previousIndex >= 0; previousIndex -= 1) {
    const previous = editor.children[previousIndex]

    if (!isListNode(previous)) {
      break
    }

    const previousLevel = getListIndent(previous)

    if (previousLevel < level) {
      break
    }
    if (previousLevel === level) {
      if (!hasSameListConfig(previous, elem) || isOutlineListNode(previous)) {
        break
      }
      number += 1
    }
  }

  return number
}

export function getOutlineNumber(editor: IDomEditor, elem: ListItemElement): string {
  const counters = Array.from({ length: 6 }, () => 0)

  for (const current of editor.children) {
    if (!isOutlineListNode(current)) {
      continue
    }

    const level = getOutlineLevel(current)
    const index = level - 1

    for (let parentIndex = 0; parentIndex < index; parentIndex += 1) {
      if (counters[parentIndex] === 0) {
        counters[parentIndex] = 1
      }
    }

    if (typeof current.listRestart === 'number' && current.listRestart > 0) {
      counters[index] = Math.floor(current.listRestart)
    } else if (counters[index] === 0) {
      counters[index] = 1
    } else {
      counters[index] += 1
    }

    for (let childIndex = index + 1; childIndex < counters.length; childIndex += 1) {
      counters[childIndex] = 0
    }

    if (current === elem) {
      const label = counters.slice(0, level).join('.')

      return level === 1 ? `${label}.` : label
    }
  }

  return ''
}

/**
 * 获取上一个同一 level 的 list item
 * @param editor editor
 * @param elem elem
 */
export function getBrotherListNodeByLevel(
  editor: IDomEditor,
  elem: ListItemElement,
  level?: number
): ListItemElement | null {
  const elemLevel = level !== undefined ? level : elem.level || 0
  let brotherPath = DomEditor.findPath(editor, elem)

  while (true) {
    if (brotherPath.length === 0 || brotherPath[brotherPath.length - 1] === 0) {
      return null
    }
    brotherPath = Path.previous(brotherPath)
    const brotherEntry = Editor.node(editor, brotherPath)

    if (brotherEntry == null || !isListNode(brotherEntry[0])) {
      return null
    }
    if (getListIndent(brotherEntry[0]) === elemLevel) {
      return brotherEntry[0]
    }
  }
}

export function hasSameOrderWithBrother(
  editor: IDomEditor,
  elem: ListItemElement,
  level?: number
): boolean {
  const brotherElem = getBrotherListNodeByLevel(editor, elem, level)

  return brotherElem != null && hasSameListConfig(brotherElem, elem)
}
