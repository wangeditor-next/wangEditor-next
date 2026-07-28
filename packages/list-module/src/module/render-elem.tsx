/**
 * @description render list elem
 * @author wangfupeng
 */

import { IDomEditor, t } from '@wangeditor-next/core'
import { Element as SlateElement } from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

import { ELEM_TO_EDITOR } from '../utils/maps'
import { getListItemColor } from '../utils/util'
import { ListItemElement } from './custom-types'
import {
  getHeadingType,
  getListIndent,
  getNormalizedOrderedListType,
  getOrderedItemNumber,
  getOutlineNumber,
  isOutlineListNode,
} from './helpers'
import { showOutlineActionPanel } from './outline-actions'

function genPreSymbol(level = 0): string {
  switch (level) {
    case 0:
      return '•'
    case 1:
      return '◦'
    default:
      return '▪'
  }
}

function genAlphabetIndex(number: number, upper = false): string {
  if (number <= 0) {
    return String(number)
  }

  let current = number
  let result = ''

  while (current > 0) {
    const remainder = (current - 1) % 26
    const charCode = (upper ? 65 : 97) + remainder

    result = String.fromCharCode(charCode) + result
    current = Math.floor((current - 1) / 26)
  }

  return result
}

function genRomanIndex(number: number, upper = false): string {
  if (number <= 0 || number >= 4000) {
    return String(number)
  }

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
  let current = number
  let result = ''

  for (const [value, roman] of romanMap) {
    while (current >= value) {
      result += roman
      current -= value
    }
  }

  return upper ? result : result.toLowerCase()
}

function genOrderedPrefix(number: number, orderType: string): string {
  switch (orderType) {
    case 'a':
      return `${genAlphabetIndex(number)}.`
    case 'A':
      return `${genAlphabetIndex(number, true)}.`
    case 'i':
      return `${genRomanIndex(number)}.`
    case 'I':
      return `${genRomanIndex(number, true)}.`
    default:
      return `${number}.`
  }
}

function renderListElem(
  elemNode: SlateElement,
  children: VNode[] | null,
  editor: IDomEditor
): VNode {
  ELEM_TO_EDITOR.set(elemNode, editor)

  const listItem = elemNode as ListItemElement
  const outline = isOutlineListNode(listItem)
  const level = getListIndent(listItem)
  const listStyle = {
    margin: `5px 0 5px ${level * 20}px`,
    display: 'flex',
    alignItems: 'baseline',
  }
  const prefixColor = getListItemColor(listItem)
  let prefix = ''

  if (outline) {
    prefix = getOutlineNumber(editor, listItem)
  } else if (listItem.ordered) {
    prefix = genOrderedPrefix(getOrderedItemNumber(editor, listItem), getNormalizedOrderedListType(listItem))
  } else {
    prefix = genPreSymbol(level)
  }

  const markerStyle = { marginRight: '0.5em', color: prefixColor }
  const marker = outline ? (
    <button
      type="button"
      className="w-e-list-marker"
      contentEditable={false}
      data-w-e-reserve
      aria-label={t('listModule.numberingActions')}
      title={t('listModule.numberingActions')}
      style={markerStyle}
      on={{
        mousedown: event => event.preventDefault(),
        click: event => {
          event.preventDefault()
          event.stopPropagation()

          if (event.currentTarget instanceof HTMLElement) {
            showOutlineActionPanel(editor, listItem, event.currentTarget)
          }
        },
      }}
    >
      {prefix}
    </button>
  ) : (
    <span className="w-e-list-marker" contentEditable={false} style={markerStyle} data-w-e-reserve>
      {prefix}
    </span>
  )

  const headingType = getHeadingType(listItem)
  const ContentTag = headingType == null ? 'span' : headingType.replace('header', 'h')

  return (
    <div className="w-e-list-item" style={listStyle}>
      {marker}
      <ContentTag style={{ flex: '1', minWidth: '0', wordBreak: 'break-word' }}>{children}</ContentTag>
    </div>
  )
}

const renderListItemConf = {
  type: 'list-item',
  renderElem: renderListElem,
}

export default renderListItemConf
