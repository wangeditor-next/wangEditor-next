/**
 * @description DOM 操作 part1 - DOM7 文档 https://framework7.io/docs/dom7.html
 * @author wangfupeng
 */

import $, {
  addClass,
  append,
  attr,
  children as dom7Children,
  css,
  dataset,
  Dom7Array,
  each,
  empty,
  find,
  focus,
  hasClass,
  height,
  hide,
  html,
  is,
  // scrollTop,
  // scrollLeft,
  offset as dom7Offset,
  on,
  parent as dom7Parent,
  parents,
  remove,
  removeAttr,
  removeClass,
  show,
  text as dom7Text,
  val,
  width,
} from 'dom7'
import { htmlVoidElements } from 'html-void-elements'

import { toString } from './util'

// ------------------------------- 分割线，以下内容参考 slate-react dom.ts -------------------------------

// COMPAT: This is required to prevent TypeScript aliases from doing some very
// weird things for Slate's types with the same name as globals. (2019/11/27)
// https://github.com/microsoft/TypeScript/issues/35002
import DOMNode = globalThis.Node
import DOMComment = globalThis.Comment
import DOMElement = globalThis.Element
import DOMText = globalThis.Text
import DOMRange = globalThis.Range
import DOMSelection = globalThis.Selection
import DOMStaticRange = globalThis.StaticRange

export type { Dom7Array } from 'dom7'

if (css) { $.fn.css = css }
if (append) { $.fn.append = append }
if (addClass) { $.fn.addClass = addClass }
if (removeClass) { $.fn.removeClass = removeClass }
if (hasClass) { $.fn.hasClass = hasClass }
if (on) { $.fn.on = on }
if (focus) { $.fn.focus = focus }
if (attr) { $.fn.attr = attr }
if (removeAttr) { $.fn.removeAttr = removeAttr }
if (hide) { $.fn.hide = hide }
if (show) { $.fn.show = show }
// if (scrollTop) $.fn.scrollTop = scrollTop
// if (scrollLeft) $.fn.scrollLeft = scrollLeft
if (dom7Offset) { $.fn.offset = dom7Offset }
if (width) { $.fn.width = width }
if (height) { $.fn.height = height }
if (dom7Parent) { $.fn.parent = dom7Parent }
if (parents) { $.fn.parents = parents }
if (is) { $.fn.is = is }
if (dataset) { $.fn.dataset = dataset }
if (val) { $.fn.val = val }
if (dom7Text) { $.fn.text = dom7Text }
if (html) { $.fn.html = html }
if (dom7Children) { $.fn.children = dom7Children }
if (remove) { $.fn.remove = remove }
if (find) { $.fn.find = find }
if (each) { $.fn.each = each }
if (empty) { $.fn.empty = empty }

export default $

export enum NodeType {
  ELEMENT_NODE = 1,
  TEXT_NODE = 3,
  CDATA_SECTION_NODE = 4,
  PROCESSING_INSTRUCTION_NODE = 7,
  COMMENT_NODE = 8,
  DOCUMENT_NODE = 9,
  DOCUMENT_TYPE_NODE = 10,
  DOCUMENT_FRAGMENT_NODE = 11,
}

export const isDocument = (value: any): value is Document => {
  return toString(value) === '[object HTMLDocument]'
}

export const isShadowRoot = (value: any): value is ShadowRoot => {
  return toString(value) === '[object ShadowRoot]'
}

export const isDataTransfer = (value: any): value is DataTransfer => {
  return toString(value) === '[object DataTransfer]'
}

const HTML_ELEMENT_STR_REG_EXP = /\[object HTML([A-Z][a-z]*)*Element\]/

export const isUnprocessedListElement = (el: Element): boolean => {
  return 'matches' in el && /^[ou]l$/i.test(el.tagName) && !el.hasAttribute('data-w-e-type')
}
export const isHTMLElememt = (value: any): value is HTMLElement => {
  return HTML_ELEMENT_STR_REG_EXP.test(toString(value))
}
export {
  DOMComment, DOMElement, DOMNode, DOMRange, DOMSelection, DOMStaticRange, DOMText,
}

export type DOMPoint = [Node, number]

/**
 * Returns the host window of a DOM node
 */
export const getDefaultView = (value: any): Window | null => {
  return (value && value.ownerDocument && value.ownerDocument.defaultView) || null
}

/**
 * Check if a value is a DOM node.
 */
export const isDOMNode = (value: any): value is DOMNode => {
  return value != null && typeof value.nodeType === 'number'
}

/**
 * Check if a DOM node is a comment node.
 */
export const isDOMComment = (value: any): value is DOMComment => {
  return isDOMNode(value) && value.nodeType === NodeType.COMMENT_NODE
}

/**
 * Check if a DOM node is an element node.
 */
export const isDOMElement = (value: any): value is DOMElement => {
  return isDOMNode(value) && value.nodeType === NodeType.ELEMENT_NODE
}

/**
 * Check if a value is a DOM selection.
 */
export const isDOMSelection = (value: any): value is DOMSelection => {
  return toString(value) === '[object Selection]'
}

/**
 * Check if a DOM node is an element node.
 */
export const isDOMText = (value: any): value is DOMText => {
  return isDOMNode(value) && value.nodeType === NodeType.TEXT_NODE
}

/**
 * Checks whether a paste event is a plaintext-only event.
 */
export const isPlainTextOnlyPaste = (event: ClipboardEvent) => {
  return (
    event.clipboardData
    && event.clipboardData.getData('text/plain') !== ''
    && event.clipboardData.types.length === 1
  )
}

/**
 * Normalize a DOM point so that it always refers to a text node.
 */
export const normalizeDOMPoint = (domPoint: DOMPoint): DOMPoint => {
  let [node, offset] = domPoint

  // If it's an element node, its offset refers to the index of its children
  // including comment nodes, so try to find the right text child node.
  if (isDOMElement(node) && node.childNodes.length) {
    let isLast = offset === node.childNodes.length
    let index = isLast ? offset - 1 : offset;

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    [node, index] = getEditableChildAndIndex(node, index, isLast ? 'backward' : 'forward')

    // If the editable child found is in front of input offset, we instead seek to its end
    // 如果编辑区域的内容被发现在输入光标位置前面，也就是光标位置不正常，则修正光标的位置到结尾
    isLast = index < offset

    // If the node has children, traverse until we have a leaf node. Leaf nodes
    // can be either text nodes, or other void DOM nodes.
    while (isDOMElement(node) && node.childNodes.length) {
      const i = isLast ? node.childNodes.length - 1 : 0

      // eslint-disable-next-line @typescript-eslint/no-use-before-define
      node = getEditableChild(node, i, isLast ? 'backward' : 'forward')
    }

    // Determine the new offset inside the text node.
    offset = isLast && node.textContent != null ? node.textContent.length : 0
  }

  // Return the node and offset.
  return [node, offset]
}

/**
 * Determines wether the active element is nested within a shadowRoot
 */
export const hasShadowRoot = () => {
  return !!(window.document.activeElement && window.document.activeElement.shadowRoot)
}

/**
 * Get the element with the specified id
 */
export const getElementById = (id: string): null | HTMLElement => {
  return (
    (window && window.document.getElementById(id))
    ?? ((window && window.document.activeElement?.shadowRoot?.getElementById(id)) || null)
  )
}

/**
 * Get the nearest editable child and index at `index` in a `parent`, preferring `direction`.
 */
export const getEditableChildAndIndex = (
  parent: DOMElement,
  index: number,
  direction: 'forward' | 'backward',
): [DOMNode, number] => {
  const { childNodes } = parent
  let child = childNodes[index]
  let i = index
  let triedForward = false
  let triedBackward = false

  // While the child is a comment node, or an element node with no children,
  // keep iterating to find a sibling non-void, non-comment node.
  while (
    isDOMComment(child)
    || (isDOMElement(child) && child.childNodes.length === 0)
    || (isDOMElement(child) && child.getAttribute('contenteditable') === 'false')
  ) {
    if (triedForward && triedBackward) {
      break
    }

    if (i >= childNodes.length) {
      triedForward = true
      i = index - 1
      direction = 'backward'
      continue
    }

    if (i < 0) {
      triedBackward = true
      i = index + 1
      direction = 'forward'
      continue
    }

    child = childNodes[i]
    index = i
    i += direction === 'forward' ? 1 : -1
  }

  return [child, index]
}

/**
 * Get the nearest editable child at `index` in a `parent`, preferring
 * `direction`.
 */

export const getEditableChild = (
  parent: DOMElement,
  index: number,
  direction: 'forward' | 'backward',
): DOMNode => {
  const [child] = getEditableChildAndIndex(parent, index, direction)

  return child
}

/**
 * Get a plaintext representation of the content of a node, accounting for block
 * elements which get a newline appended.
 *
 * The domNode must be attached to the DOM.
 */
export const getPlainText = (domNode: DOMNode) => {
  let text = ''

  if (isDOMText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue
  }

  if (isDOMElement(domNode)) {
    for (const childNode of Array.from(domNode.childNodes)) {
      text += getPlainText(childNode)
    }

    const display = getComputedStyle(domNode).getPropertyValue('display')

    if (
      display === 'block'
      || display === 'list'
      || display === 'table-row'
      || domNode.tagName === 'BR'
    ) {
      text += '\n'
    }
  }

  return text
}

/**
 * 在下级节点中找到第一个 void elem
 * @param elem elem
 */
export function getFirstVoidChild(elem: DOMElement): DOMElement | null {
  // 深度优先遍历
  const stack: Array<DOMElement> = []

  stack.push(elem)

  let num = 0

  // 开始遍历
  while (stack.length > 0) {
    const curElem = stack.pop()

    if (curElem == null) { break }

    num += 1
    if (num > 10000) { break }

    const { nodeName, nodeType } = curElem

    if (nodeType === NodeType.ELEMENT_NODE) {
      const name = nodeName.toLowerCase()

      if (
        htmlVoidElements.includes(name)
        // 补充一些
        || name === 'iframe'
        || name === 'video'
      ) {
        return curElem // 得到 void elem 并返回
      }

      // 继续遍历子节点
      const children = curElem.children || []
      const length = children.length

      if (length) {
        for (let i = length - 1; i >= 0; i -= 1) {
          // 注意，需要**逆序**追加自节点
          stack.push(children[i])
        }
      }
    }
  }

  // 未找到结果，返回 null
  return null
}

/**
 * 遍历一个 elem 内所有的 text node ，执行函数
 * @param elem elem
 * @param handler handler
 */
export function walkTextNodes(
  elem: DOMElement,
  handler: (textNode: DOMNode, parent: DOMElement) => void,
) {
  // void elem 内部的 text 不处理
  if (isHTMLElememt(elem) && elem.dataset.slateVoid === 'true') { return }

  // eslint-disable-next-line no-cond-assign
  for (let nodes = elem.childNodes, i = nodes.length; i -= 1;) {
    const node = nodes[i]
    const nodeType = node.nodeType

    if (isDOMText(node)) {
      // 匹配到 text node ，执行函数
      handler(node, elem)
    } else if ([NodeType.ELEMENT_NODE, NodeType.DOCUMENT_NODE, NodeType.DOCUMENT_FRAGMENT_NODE].includes(nodeType)) {
      // 继续遍历子节点
      walkTextNodes(node as DOMElement, handler)
    }
  }
}

/**
 * 获取 tagName lower-case
 * @param $elem $elem
 */
export function getTagName($elem: Dom7Array): string {
  if ($elem.length === 0) { return '' }
  const elem = $elem[0]

  if (elem.nodeType !== NodeType.ELEMENT_NODE) { return '' }
  return elem.tagName.toLowerCase()
}
