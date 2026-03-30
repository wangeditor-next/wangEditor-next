/**
 * @description style to html
 * @author hsuna
 */

import { IDomEditor } from '@wangeditor-next/core'

import $, { getOuterHTML } from '../utils/dom'

function getTextStyleMode(editor?: IDomEditor): 'inline' | 'class' {
  if (!editor) { return 'inline' }
  return editor.getConfig().textStyleMode === 'class' ? 'class' : 'inline'
}

function getBorderStyleClass(borderStyle: string): string {
  const val = (borderStyle || '').trim().toLowerCase()

  if (!val || val === 'none') { return '' }
  return `w-e-table-border-style-${val}`
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
      const normalizedBorderStyle = borderStyle === 'none' ? '' : `${borderStyle}`.trim()

      if (normalizedBorderStyle) {
        $elem.addClass(getBorderStyleClass(normalizedBorderStyle))
        $elem.attr('data-w-e-border-line', normalizedBorderStyle)
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
