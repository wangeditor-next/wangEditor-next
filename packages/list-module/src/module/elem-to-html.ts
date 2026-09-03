/**
 * @description to html
 * @author wangfupeng
 */

import { DomEditor, getTextStyleMode, IDomEditor } from '@wangeditor-next/core'
import { Element, Node, Path } from 'slate'

import { ELEM_TO_EDITOR } from '../utils/maps'
import { getListItemColor } from '../utils/util'
import { ListItemElement } from './custom-types'
import {
  getHeadingType,
  getNormalizedOrderedListStart,
  getNormalizedOrderedListType,
  hasSameListConfig,
  isOutlineListNode,
} from './helpers'
import { genListColorClassName, resolveListColorAction } from './style-class'

// ol ul stack for streaming list-item serialization
const CONTAINER_TAG_STACK: Array<string> = []
let STACK_EDITOR: IDomEditor | null = null
let FALLBACK_CONTEXTS: WeakMap<Element, { siblings: any[]; index: number }> | null = null

function buildElementContexts(editor: IDomEditor) {
  const contexts = new WeakMap<Element, { siblings: any[]; index: number }>()

  const visit = (children: any[]) => {
    children.forEach((child, index) => {
      if (!Element.isElement(child)) { return }

      contexts.set(child, { siblings: children, index })
      visit(child.children)
    })
  }

  visit(editor.children)
  return contexts
}

function getContainerTag(elem: ListItemElement): 'ol' | 'ul' {
  return elem.ordered ? 'ol' : 'ul'
}

function getFallbackContainerTag(elem: ListItemElement): string {
  return elem.ordered ? 'ol' : 'ul'
}

function genContainerStartTag(elem: ListItemElement): string {
  const { ordered = false } = elem

  if (!ordered) { return '<ul>' }

  const attrs: string[] = []
  const orderType = getNormalizedOrderedListType(elem)
  const orderStart = getNormalizedOrderedListStart(elem)

  if (orderType !== '1') {
    attrs.push(`type="${orderType}"`)
  }
  if (orderStart !== 1) {
    attrs.push(`start="${orderStart}"`)
  }
  if (getHeadingType(elem) != null) {
    attrs.push('data-w-e-list-mode="standard"')
  }

  if (attrs.length === 0) { return '<ol>' }
  return `<ol ${attrs.join(' ')}>`
}

function getAdjacentListItem(
  siblings: any[],
  index: number,
  direction: 'prev' | 'next',
): ListItemElement | null {
  if (direction === 'prev' && index === 0) { return null }
  if (direction === 'next' && index === siblings.length - 1) { return null }

  const targetIndex = direction === 'prev' ? index - 1 : index + 1
  const targetNode = siblings[targetIndex] as any

  if (!DomEditor.checkNodeType(targetNode, 'list-item') || isOutlineListNode(targetNode)) {
    return null
  }
  return targetNode as ListItemElement
}

function getPrevSameLevelListItem(
  siblings: any[],
  index: number,
  level: number,
): ListItemElement | null {
  for (let i = index - 1; i >= 0; i -= 1) {
    const node = siblings[i] as any

    if (!DomEditor.checkNodeType(node, 'list-item') || isOutlineListNode(node)) { continue }
    if ((node.level || 0) === level) {
      return node as ListItemElement
    }
  }
  return null
}

function elemToHtml(
  elem: Element,
  childrenHtml: string,
  editor?: IDomEditor,
): {
  html: string
  prefix?: string
  suffix?: string
} {
  let startContainerStr = ''
  let endContainerStr = ''

  const listItemElem = elem as ListItemElement
  const headingType = getHeadingType(listItemElem)
  const headingTag = headingType == null ? null : headingType.replace('header', 'h')

  if (isOutlineListNode(listItemElem) && headingTag != null) {
    return {
      html: `<${headingTag}>${childrenHtml}</${headingTag}>`,
      prefix: '',
      suffix: '',
    }
  }

  if (headingTag != null) {
    childrenHtml = `<${headingTag}>${childrenHtml}</${headingTag}>`
  }

  const { level = 0 } = listItemElem
  const containerTag = getContainerTag(listItemElem)
  const containerStartTag = genContainerStartTag(listItemElem)
  const bindEditor = ELEM_TO_EDITOR.get(elem)
  const bindEditorWithChildren = bindEditor && Array.isArray((bindEditor as any).children)
    ? bindEditor
    : null
  const passedEditorWithChildren = editor && Array.isArray((editor as any).children)
    ? editor
    : null
  const getElementContext = (
    candidate: IDomEditor | null | undefined,
    allowFallback = false,
  ) => {
    if (!candidate) { return null }

    try {
      const path = DomEditor.findPath(candidate, elem)
      const parent = path.length === 1 ? candidate : Node.get(candidate, Path.parent(path))
      const siblings = Array.isArray((parent as any).children) ? (parent as any).children : []
      const index = path[path.length - 1]

      return siblings[index] === elem ? { siblings, index } : null
    } catch {
      if (!allowFallback) { return null }

      FALLBACK_CONTEXTS ||= buildElementContexts(candidate)
      return FALLBACK_CONTEXTS.get(elem) || null
    }
  }

  let finalEditor = passedEditorWithChildren || bindEditorWithChildren

  const passedContext = getElementContext(passedEditorWithChildren)
  const bindContext = getElementContext(bindEditorWithChildren)

  if (passedContext) {
    finalEditor = passedEditorWithChildren
  } else if (bindContext) {
    finalEditor = bindEditorWithChildren
  }
  const styleEditor = editor || bindEditor

  if (finalEditor == null) {
    return {
      html: `<li>${childrenHtml}</li>`,
      prefix: '',
      suffix: '',
    }
  }

  if (STACK_EDITOR !== finalEditor) {
    CONTAINER_TAG_STACK.length = 0
    STACK_EDITOR = finalEditor
    FALLBACK_CONTEXTS = null
  }

  const context = getElementContext(finalEditor, true)

  if (!context) {
    return {
      html: `<li>${childrenHtml}</li>`,
      prefix: '',
      suffix: '',
    }
  }

  const { siblings, index } = context
  const prevItem = getAdjacentListItem(siblings, index, 'prev')
  const nextItem = getAdjacentListItem(siblings, index, 'next')
  const hasNestedNext = !!nextItem && (nextItem.level || 0) > level

  if (!prevItem) {
    // list block start
    CONTAINER_TAG_STACK.length = 0
    for (let i = 0; i < level + 1; i += 1) {
      startContainerStr += containerStartTag
      CONTAINER_TAG_STACK.push(containerTag)
    }
  } else {
    const prevLevel = prevItem.level || 0

    if (level > prevLevel) {
      // Enter nested lists inside previous <li>.
      for (let i = 0; i < level - prevLevel; i += 1) {
        startContainerStr += containerStartTag
        CONTAINER_TAG_STACK.push(containerTag)
      }
    } else if (level === prevLevel) {
      // Split same-level lists when ordered/type/start differ.
      if (!hasSameListConfig(prevItem, listItemElem)) {
        const closeTag = CONTAINER_TAG_STACK.pop() || getFallbackContainerTag(prevItem)

        startContainerStr += `</${closeTag}>${containerStartTag}`
        CONTAINER_TAG_STACK.push(containerTag)
      }
    } else {
      // Climb up: close nested list containers and parent <li>.
      let diff = prevLevel - level

      while (diff > 0) {
        const closeTag = CONTAINER_TAG_STACK.pop() || getFallbackContainerTag(prevItem)

        startContainerStr += `</${closeTag}></li>`
        diff -= 1
      }

      // Split target-level list container when config changed.
      const brother = getPrevSameLevelListItem(siblings, index, level)

      if (brother && !hasSameListConfig(brother, listItemElem)) {
        const closeTag = CONTAINER_TAG_STACK.pop() || getFallbackContainerTag(brother)

        startContainerStr += `</${closeTag}>${containerStartTag}`
        CONTAINER_TAG_STACK.push(containerTag)
      }
    }
  }

  // 获取前缀颜色
  const prefixColor = getListItemColor(elem)
  const textStyleMode = getTextStyleMode(styleEditor)
  let colorStyle = ''
  let colorClass = ''
  let colorData = ''

  if (prefixColor) {
    if (textStyleMode === 'class') {
      colorData = ` data-w-e-color="${prefixColor}"`
      const action = resolveListColorAction(styleEditor, prefixColor)

      if (action === 'class') {
        colorClass = ` class="${genListColorClassName(prefixColor)}"`
      } else if (action === 'inline') {
        colorStyle = ` style="color:${prefixColor}"`
      }
    } else {
      colorStyle = ` style="color:${prefixColor}"`
    }
  }

  const html = `<li${colorClass}${colorData}${colorStyle}>${childrenHtml}${hasNestedNext ? '' : '</li>'}`

  if (!nextItem) {
    // list block end
    while (CONTAINER_TAG_STACK.length > 0) {
      const tag = CONTAINER_TAG_STACK.pop()

      if (!tag) { break }
      endContainerStr += `</${tag}>`
      if (CONTAINER_TAG_STACK.length > 0) {
        endContainerStr += '</li>'
      }
    }
    STACK_EDITOR = null
    FALLBACK_CONTEXTS = null
  }

  return {
    html,
    prefix: startContainerStr,
    suffix: endContainerStr,
  }
}

const listItemToHtmlConf = {
  type: 'list-item',
  elemToHtml,
}

export default listItemToHtmlConf
