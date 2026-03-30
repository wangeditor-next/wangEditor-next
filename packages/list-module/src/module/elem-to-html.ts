/**
 * @description to html
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Editor, Element, Path } from 'slate'

import { ELEM_TO_EDITOR } from '../utils/maps'
import { getListItemColor } from '../utils/util'
import { ListItemElement } from './custom-types'
import { hasSameOrderWithBrother } from './helpers'

/**
 * 当前 list-item 前面需要拼接几个 <ol> 或 <ul>
 * @param elem elem
 */
function getStartContainerTagNumber(elem: Element): number {
  const editor = ELEM_TO_EDITOR.get(elem)

  if (editor == null) { return 0 }

  const { type, ordered = false, level = 0 } = elem as ListItemElement

  const path = DomEditor.findPath(editor, elem)

  if (path[0] === 0) {
    // list-item 是第一个元素，再往前没有了。需要拼接 <ol> 或 <ul>
    return level + 1
  }

  // 获取上一个 elem
  const prevPath = Path.previous(path)
  const prevEntry = Editor.node(editor, prevPath)

  if (!prevEntry) { return 0 }
  const [prevElem] = prevEntry

  const prevType = DomEditor.getNodeType(prevElem)

  if (prevType !== type) {
    // 上一个 elem 不是 list-item ，需要拼接 <ol> 或 <ul>
    return level + 1
  }

  // 上一个 elem 是 list-item
  const { ordered: prevOrdered = false, level: prevLevel = 0 } = prevElem as ListItemElement

  if (prevLevel < level) {
    // 上一个 level 小于当前 level ，需要拼接 <ol> 或 <ul>
    return level - prevLevel
  }
  if (prevLevel > level) {
    // 此处需要看上一个同级兄弟节点 ordered 是否一致，如果一致则不需要拼接，否则需要拼接
    return hasSameOrderWithBrother(editor, elem as ListItemElement) ? 0 : 1
  }
  if (prevLevel === level) {
    // 上一个 level 等于当前 level
    if (prevOrdered === ordered) {
      // ordered 一致，则不需要拼接 <ol> 或 <ul>
      return 0
    }
    /// ordered 不一致，则需要拼接 <ol> 或 <ul>
    return 1

  }

  // 其他情况
  return 0
}

/**
 * 当前 list-item 后面面需要拼接几个 </ol> 或 </ul>
 * @param elem elem
 */
function getEndContainerTagNumber(elem: Element): number {
  const editor = ELEM_TO_EDITOR.get(elem)

  if (editor == null) { return 0 }

  const { type, ordered = false, level = 0 } = elem as ListItemElement

  const path = DomEditor.findPath(editor, elem)

  if (path[0] === editor.children.length - 1) {
    // list-item 是最后一个元素，再往后没有了。需要拼接 </ol> 或 </ul>
    return level + 1
  }

  // 获取下一个 elem
  const nextPath = Path.next(path)
  const nextEntry = Editor.node(editor, nextPath)

  if (!nextEntry) { return 0 }
  const [nextElem] = nextEntry

  const nextType = DomEditor.getNodeType(nextElem)

  if (nextType !== type) {
    // 下一个 elem 不是 list-item ，需要拼接 <ol> 或 <ul>
    return level + 1
  }

  // 下一个 elem 是 list-item
  const { ordered: nextOrdered = false, level: nextLevel = 0 } = nextElem as ListItemElement

  if (nextLevel < level) {
    // 下一个 level 小于当前 level，此处需要看上一个同级兄弟节点 ordered 是否一致，如果一致则不需要拼接，否则需要拼接
    if (hasSameOrderWithBrother(editor, nextElem as ListItemElement)) {
      // ordered 一致，则不需要额外拼接 </ol> 或 </ul>
      return level - nextLevel
    }
    // ordered 不一致，则需要额外拼接 </ol> 或 </ul>
    return level - nextLevel + 1

  }
  if (nextLevel > level) {
    // 下一个 level 大于当前 level ，不需要拼接 </ol> 或 </ul>
    return 0
  }
  if (nextLevel === level) {
    // 下一个 level 等于当前 level
    if (nextOrdered === ordered) {
      // ordered 一致，则不需要拼接 </ol> 或 </ul>
      return 0
    }
    /// ordered 不一致，则需要拼接 </ol> 或 </ul>
    return 1

  }

  // 其他情况
  return 0
}

// ol ul 栈
const CONTAINER_TAG_STACK: Array<string> = []

function normalizeColorValue(value: string): string {
  return (value || '').trim().replace(/\s+/g, '').toLowerCase()
}

function hashStyleValue(input: string): string {
  const MOD = 2147483647 // 2^31 - 1
  let hash = 7

  for (const char of input) {
    hash = (hash * 31 + (char.codePointAt(0) || 0)) % MOD
  }

  return hash.toString(36)
}

function genColorClassName(color: string): string {
  const normalized = normalizeColorValue(color)

  return `w-e-color-${hashStyleValue(`color:${normalized}`)}`
}

function getTextStyleMode(editor?: IDomEditor): 'inline' | 'class' {
  if (!editor) { return 'inline' }
  return editor.getConfig().textStyleMode === 'class' ? 'class' : 'inline'
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

  const { ordered = false } = elem as ListItemElement
  const containerTag = ordered ? 'ol' : 'ul'

  // 前面需要拼接几个 <ol> 或 <ul>
  const startContainerTagNumber = getStartContainerTagNumber(elem)

  if (startContainerTagNumber > 0) {
    for (let i = 0; i < startContainerTagNumber; i += 1) {
      startContainerStr += `<${containerTag}>` // 记录 start container tag ，如 `<ul>`
      CONTAINER_TAG_STACK.push(containerTag) // tag 压栈
    }
  }

  // 后面需要拼接几个 </ol> 或 </ul>
  const endContainerTagNumber = getEndContainerTagNumber(elem)

  if (endContainerTagNumber > 0) {
    for (let i = 0; i < endContainerTagNumber; i += 1) {
      const tag = CONTAINER_TAG_STACK.pop() // tag 从栈中获取

      endContainerStr += `</${tag}>` // 记录 end container tag ，如 `</ul>`
    }
  }

  // 获取前缀颜色
  const prefixColor = getListItemColor(elem)
  const textStyleMode = getTextStyleMode(editor)
  let colorAttr = ''

  if (prefixColor) {
    if (textStyleMode === 'class') {
      const colorClass = genColorClassName(prefixColor)

      colorAttr = ` class="${colorClass}" data-w-e-color="${prefixColor}"`
    } else {
      colorAttr = ` style="color:${prefixColor}"`
    }
  }

  return {
    html: `<li${colorAttr}>${childrenHtml}</li>`,
    prefix: startContainerStr,
    suffix: endContainerStr,
  }
}

const listItemToHtmlConf = {
  type: 'list-item',
  elemToHtml,
}

export default listItemToHtmlConf
