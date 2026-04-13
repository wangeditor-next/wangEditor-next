/**
 * @description style to html
 * @author hsuna
 */

import {
  getClassStylePolicy,
  getTextStyleMode,
  IDomEditor,
  reportUnsupportedClassStyle,
} from '@wangeditor-next/core'

import $, { getOuterHTML } from '../utils/dom'

const SUPPORTED_TABLE_BORDER_STYLE = new Set([
  'solid',
  'dotted',
  'dashed',
  'double',
  'groove',
  'ridge',
  'inset',
  'outset',
])
const REPORTED_UNSUPPORTED_BORDER_STYLE = new Set<string>()

function getBorderStyleClass(borderStyle: string): string {
  const val = (borderStyle || '').trim().toLowerCase()

  if (!val || val === 'none') { return '' }
  return `w-e-table-border-style-${val}`
}

function normalizeBorderStyle(borderStyle: string): string {
  return `${borderStyle || ''}`.trim().toLowerCase().replace(/\s+/g, ' ')
}

function resolveBorderStyleAction(
  editor: IDomEditor | undefined,
  borderStyle: string,
): 'skip' | 'class' | 'inline' | 'preserve-data' {
  const normalized = normalizeBorderStyle(borderStyle)

  if (!normalized || normalized === 'none') { return 'skip' }
  if (SUPPORTED_TABLE_BORDER_STYLE.has(normalized)) { return 'class' }

  const policy = getClassStylePolicy(editor)
  let fallback: 'preserve-data' | 'inline' | 'throw' = 'preserve-data'

  if (policy === 'fallback-inline') {
    fallback = 'inline'
  }
  if (policy === 'strict') {
    fallback = 'throw'
  }

  const message = `[wangeditor] Unsupported table border-style token "${normalized}" in class mode. policy=${policy}`
  const reportKey = `${normalized}|${fallback}`

  if (!REPORTED_UNSUPPORTED_BORDER_STYLE.has(reportKey)) {
    REPORTED_UNSUPPORTED_BORDER_STYLE.add(reportKey)
    reportUnsupportedClassStyle(editor, {
      type: 'table-border-style',
      value: normalized,
      scene: 'toHtml',
      fallback,
      message,
    })
  }

  if (fallback === 'throw') {
    throw new Error(message)
  }

  if (fallback === 'inline') {
    return 'inline'
  }

  return 'preserve-data'
}

export function styleToHtml(node, elemHtml, editor?: IDomEditor) {
  if (node.type !== 'table' && node.type !== 'table-cell') { return elemHtml }

  const {
    backgroundColor, borderWidth, borderStyle, borderColor, textAlign,
  } = node

  if (!(backgroundColor || borderWidth || borderStyle || borderColor || textAlign)) { return elemHtml }

  const $elem = $(elemHtml)
  const textStyleMode = getTextStyleMode(editor)

  if (textStyleMode === 'class') {
    if (backgroundColor) {
      $elem.attr('bgcolor', backgroundColor)
      $elem.attr('data-w-e-background-color', backgroundColor)
    }

    if (borderWidth) {
      const normalizedBorderWidth = `${borderWidth}`.trim()

      if (normalizedBorderWidth) {
        $elem.attr('data-w-e-border-width', normalizedBorderWidth)
        $elem.attr('border', normalizedBorderWidth)
      }
    }

    if (borderStyle) {
      const normalizedBorderStyle = normalizeBorderStyle(borderStyle)
      const borderStyleAction = resolveBorderStyleAction(editor, normalizedBorderStyle)

      if (borderStyleAction !== 'skip') {
        $elem.attr('data-w-e-border-line', normalizedBorderStyle)
      }

      if (borderStyleAction === 'class') {
        $elem.addClass(getBorderStyleClass(normalizedBorderStyle))
      } else if (borderStyleAction === 'inline') {
        $elem.css('border-style', normalizedBorderStyle)
      }
    }

    if (borderColor) {
      $elem.attr('bordercolor', borderColor)
      $elem.attr('data-w-e-border-color', borderColor)
    }

    if (textAlign) {
      $elem.attr('align', textAlign)
      $elem.attr('data-w-e-text-align', textAlign)
    }

    return getOuterHTML($elem)
  }

  // 设置样式
  if (backgroundColor) { $elem.css('background-color', backgroundColor) }
  if (borderWidth) { $elem.css('border-width', `${borderWidth}px`) }
  if (borderStyle) { $elem.css('border-style', borderStyle === 'none' ? '' : borderStyle) }
  if (borderColor) { $elem.css('border-color', borderColor) }
  if (textAlign) { $elem.css('text-align', textAlign) }

  // 输出 html
  return getOuterHTML($elem)
}
