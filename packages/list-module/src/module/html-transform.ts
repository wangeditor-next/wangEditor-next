/**
 * @description compose semantic outline HTML from additive list-item metadata
 */

import { getTextStyleMode, HtmlTransformFnType, IDomEditor } from '@wangeditor-next/core'

import { getListItemColor } from '../utils/util'
import { ListItemElement } from './custom-types'
import {
  getOutlineLevel,
  getOutlineNumber,
  hasSameListConfig,
  isOutlineListNode,
} from './helpers'
import { genListColorClassName, resolveListColorAction } from './style-class'

type OutlineItem = {
  node: ListItemElement
  html: string
  children: OutlineContainer[]
}

type OutlineContainer = {
  node: ListItemElement
  items: OutlineItem[]
}

type OutlineLevel = {
  container: OutlineContainer
  lastItem: OutlineItem
}

type OutlineContext = {
  roots: OutlineContainer[]
  levels: OutlineLevel[]
}

function getOutlineContainerStart(editor: IDomEditor, node: ListItemElement): number {
  const lastSegment = getOutlineNumber(editor, node).split('.').filter(Boolean).pop()
  const start = Number.parseInt(lastSegment || '', 10)

  return Number.isFinite(start) && start > 0 ? start : 1
}

function getContainerStartTag(container: OutlineContainer, editor: IDomEditor): string {
  const start = getOutlineContainerStart(editor, container.node)
  const startAttr = start === 1 ? '' : ` start="${start}"`

  return `<ol${startAttr} data-w-e-list-mode="outline">`
}

function getColorAttrs(node: ListItemElement, editor: IDomEditor): string[] {
  const color = getListItemColor(node)

  if (!color) {
    return []
  }

  if (getTextStyleMode(editor) !== 'class') {
    return [`style="color:${color}"`]
  }

  const attrs = [`data-w-e-color="${color}"`]
  const action = resolveListColorAction(editor, color)

  if (action === 'class') {
    attrs.unshift(`class="${genListColorClassName(color)}"`)
  } else if (action === 'inline') {
    attrs.push(`style="color:${color}"`)
  }

  return attrs
}

function getListItemStartTag(node: ListItemElement, editor: IDomEditor): string {
  const attrs = getColorAttrs(node, editor)

  attrs.push(`data-w-e-list-indent="${getOutlineLevel(node) - 1}"`)

  if (typeof node.listRestart === 'number') {
    attrs.push(`data-w-e-list-restart="${node.listRestart}"`)
  }
  attrs.push(`data-w-e-outline-number="${getOutlineNumber(editor, node)}"`)

  return `<li ${attrs.join(' ')}>`
}

function renderContainer(container: OutlineContainer, editor: IDomEditor): string {
  const itemsHtml = container.items
    .map(item => {
      const childrenHtml = item.children.map(child => renderContainer(child, editor)).join('')

      return `${getListItemStartTag(item.node, editor)}${item.html}${childrenHtml}</li>`
    })
    .join('')

  return `${getContainerStartTag(container, editor)}${itemsHtml}</ol>`
}

function addOutlineItem(
  roots: OutlineContainer[],
  levels: OutlineLevel[],
  node: ListItemElement,
  html: string
): OutlineItem {
  let level = Math.max(0, getOutlineLevel(node) - 1)

  // A standalone h3 cannot have a semantic parent. Preserve the source depth
  // in data-w-e-list-indent while emitting valid nested HTML.
  if (level > levels.length) {
    level = levels.length
  }

  levels.length = level + 1
  const parent = level > 0 ? levels[level - 1]?.lastItem : null
  const current = levels[level]
  const restart = typeof node.listRestart === 'number'
  const needsNewContainer =
    current == null || !hasSameListConfig(current.container.node, node) || restart

  let container: OutlineContainer

  if (needsNewContainer) {
    container = { node, items: [] }
    if (parent != null) {
      parent.children.push(container)
    } else {
      roots.push(container)
    }
  } else {
    container = current.container
  }

  const item: OutlineItem = { node, html, children: [] }

  container.items.push(item)
  levels[level] = { container, lastItem: item }

  return item
}

/**
 * List-item serialization remains backward compatible for ordinary lists.
 * Only outline list items need document-level composition to create valid
 * `ol > li > hN` structure.
 */
export const transformListHtml: HtmlTransformFnType = (htmlList, nodes, editor) => {
  const result: string[] = []
  let outlineContext: OutlineContext | null = null

  const flushOutline = () => {
    if (outlineContext == null || outlineContext.roots.length === 0) {
      return
    }

    result.push(outlineContext.roots.map(container => renderContainer(container, editor)).join(''))
    outlineContext = null
  }

  nodes.forEach((node, index) => {
    const html = htmlList[index] || ''

    if (isOutlineListNode(node)) {
      if (outlineContext == null) {
        outlineContext = { roots: [], levels: [] }
      }

      addOutlineItem(outlineContext.roots, outlineContext.levels, node, html)
      return
    }

    flushOutline()
    result.push(html)
  })

  flushOutline()

  return result
}
