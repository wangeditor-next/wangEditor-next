/**
 * @description render list elem
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import {
  Editor, Element as SlateElement, Path,
} from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

import { ELEM_TO_EDITOR } from '../utils/maps'
import { getListItemColor } from '../utils/util'
import { ListItemElement } from './custom-types'
import {
  getNormalizedOrderedListStart,
  getNormalizedOrderedListType,
  hasSameListConfig,
} from './helpers'

/**
 * 无序列表：根据 level 获取的前置符号
 * @param level 层级
 */
function genPreSymbol(level = 0): string {
  let s = ''

  switch (level) {
    case 0:
      s = '•' // 第一层级
      break
    case 1:
      s = '◦' // 第一层级
      break
    case 2:
      s = '▪' // 第三层级
      break
    default:
      s = '▪' // 其他层级
  }
  return s
}

function genAlphabetIndex(num: number, upper = false): string {
  if (num <= 0) { return String(num) }

  let n = num
  let result = ''

  while (n > 0) {
    const rem = (n - 1) % 26
    const charCode = (upper ? 65 : 97) + rem

    result = String.fromCharCode(charCode) + result
    n = Math.floor((n - 1) / 26)
  }

  return result
}

function genRomanIndex(num: number, upper = false): string {
  if (num <= 0 || num >= 4000) { return String(num) }

  const romanMap: Array<[number, string]> = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ]

  let n = num
  let result = ''

  for (const [value, roman] of romanMap) {
    while (n >= value) {
      result += roman
      n -= value
    }
  }

  return upper ? result : result.toLowerCase()
}

function genOrderedPrefix(num: number, orderType: string): string {
  switch (orderType) {
    case 'a':
      return `${genAlphabetIndex(num)}.`
    case 'A':
      return `${genAlphabetIndex(num, true)}.`
    case 'i':
      return `${genRomanIndex(num)}.`
    case 'I':
      return `${genRomanIndex(num, true)}.`
    default:
      return `${num}.`
  }
}

/**
 * 有序列表：获取前缀 number
 * @param editor editor
 * @param elem listItem elem
 */
function getOrderedItemNumber(editor: IDomEditor, elem: SlateElement): number {
  const listItemElem = elem as ListItemElement
  const { type, level = 0, ordered = false } = listItemElem

  let num = getNormalizedOrderedListStart(listItemElem)
  let curElem = elem
  let curPath = DomEditor.findPath(editor, curElem)

  // 第一个元素，直接返回起始值
  if (curPath[0] === 0) { return num }

  while (curPath[0] > 0) {
    const prevPath = Path.previous(curPath)
    const prevEntry = Editor.node(editor, prevPath)

    if (prevEntry == null) { break }
    const prevElem = prevEntry[0] as ListItemElement // 上一个节点
    const { level: prevLevel = 0, type: prevType, ordered: prevOrdered } = prevElem

    // type 不一致，退出循环，不再累加 num
    if (prevType !== type) { break }
    // prevLevel 更小，退出循环，不再累加 num
    if (prevLevel < level) { break }

    if (prevLevel === level) {
      // level 一样，如果 list 配置不一致，则退出循环，不再累加 num
      if (prevOrdered !== ordered || !hasSameListConfig(prevElem, listItemElem)) { break }
      // level 一样，order 配置一致，则累加 num
      num += 1
    }

    // prevLevel 更大，不累加 num ，继续向前
    curElem = prevElem
    curPath = prevPath
  }

  return num
}

function renderListElem(
  elemNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor,
): VNode {
  ELEM_TO_EDITOR.set(elemNode, editor) // 记录 elem 和 editor 关系，elem-to-html 时要用

  const { level = 0, ordered = false } = elemNode as ListItemElement

  // 根据 level 增加 margin-left
  const listStyle = {
    margin: `5px 0 5px ${level * 20}px`,
    display: 'flex',
    alignItems: 'flex-start',
  }

  // list-item 前缀
  let prefix = ''

  if (ordered) {
    // 有序列表：获取前缀 number
    const orderedNumber = getOrderedItemNumber(editor, elemNode)
    const orderType = getNormalizedOrderedListType(elemNode as ListItemElement)

    prefix = genOrderedPrefix(orderedNumber, orderType)
  } else {
    // 无序列表：根据层级，使用不同的前缀符号
    prefix = genPreSymbol(level)
  }

  // 获取前缀颜色
  const prefixColor = getListItemColor(elemNode)

  const vnode = (
    <div style={listStyle}>
      <span
        contentEditable={false}
        style={{ marginRight: '0.5em', color: prefixColor }}
        data-w-e-reserve
      >
        {prefix}
      </span>
      <span style={{
        flex: '1',
        wordBreak: 'break-word',
      }}>{children}</span>
    </div>
  )

  return vnode
}

const renderListItemConf = {
  type: 'list-item',
  renderElem: renderListElem,
}

export default renderListItemConf
