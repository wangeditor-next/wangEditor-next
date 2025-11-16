/**
 * @description parse style html
 * @author hsuna
 */
import { IDomEditor } from '@wangeditor-next/core'
import { Descendant } from 'slate'

import $, { DOMElement, getStyleValue } from '../utils/dom'
import { TableCellElement } from './custom-types'

// 获取 var(--w-e-textarea-border-color) 变量的实际样式值
const DEFAULT_BORDER_COLOR = window
  ?.getComputedStyle(document.documentElement)
  ?.getPropertyValue('--w-e-textarea-border-color')

/**
 * 将 CSS 尺寸字符串中的 'pt' 转换为 'px'
 * 转换比例: 1pt = 1.333333px (基于 W3C 推荐的 96 DPI 标准)
 * @param cssValue 包含 pt 单位的 CSS 字符串 (如 "medium 1pt 1pt 0.5pt")
 * @returns 转换后的 CSS 字符串 (如 "medium 1.333333px 1.333333px 0.6666665px")
 */
function convertPtToPx(cssValue: string): string {
  if (!cssValue || typeof cssValue !== 'string' || !cssValue.includes('pt')) {
    return cssValue
  }

  // 使用正则匹配所有带 'pt' 单位的值，例如 '1pt', '0.5pt', '100pt'，并进行替换
  return cssValue.replace(/(\d+(\.\d+)?)\s*pt/g, (_, p1) => {
    // p1 是捕获到的数字部分 (如 '1' 或 '0.5')
    const ptValue = parseFloat(p1)
    // 1pt ≈ 1.333333px。为了简化和保证精度，使用 4/3
    const pxValue = ((ptValue * 4) / 3).toFixed(2)

    return `${pxValue}px`
  })
}

export function parseStyleHtml(elem: DOMElement, node: Descendant, _editor: IDomEditor): Descendant {
  if (!['TABLE', 'TD', 'TH'].includes(elem.tagName)) { return node }

  const $elem = $(elem)

  const tableNode = node as TableCellElement
  let backgroundColor = getStyleValue($elem, 'background-color')

  if (!backgroundColor) { backgroundColor = getStyleValue($elem, 'background') } // word 背景色
  if (backgroundColor) {
    tableNode.backgroundColor = backgroundColor
  }

  let border = getStyleValue($elem, 'border')

  if (!border && elem.tagName === 'TD') {
    // https://github.com/wangeditor-next/wangEditor-next/blob/master/packages/table-module/src/assets/index.less#L20
    // TD存在默认的css样式，尝试用getComputedStyle获取不到，只能写死
    border = `1px solid ${DEFAULT_BORDER_COLOR}`
  }

  let [borderWidth, borderStyle, borderColor] = border?.split(' ') || []

  borderWidth = getStyleValue($elem, 'border-width') || borderWidth // border 宽度
  if (borderWidth) {
    tableNode.borderWidth = convertPtToPx(borderWidth.trim())
  }
  borderStyle = getStyleValue($elem, 'border-style') || borderStyle // border 样式
  if (borderStyle) {
    tableNode.borderStyle = borderStyle === 'none' ? '' : borderStyle
  }
  borderColor = getStyleValue($elem, 'border-color') || borderColor // border 颜色
  if (borderColor) {
    tableNode.borderColor = borderColor
  }

  let textAlign = getStyleValue($elem, 'text-align')

  textAlign = getStyleValue($elem, 'text-align') || textAlign // 文本 对齐
  if (textAlign) {
    tableNode.textAlign = textAlign
  }
  return node
}
