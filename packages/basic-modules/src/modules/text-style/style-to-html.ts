/**
 * @description text to html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { getOuterHTML, isPlainText } from '../../utils/dom'
import { getTextStyleMode } from '../../utils/style-class'
import { StyledText } from './custom-types'
import {
  EMPHASIS_DOT_CLASS,
  EMPHASIS_DOT_STYLE_HTML,
  EMPHASIS_DOT_WITH_WAVY_CLASS,
  EMPHASIS_DOT_WITH_WAVY_STYLE_HTML,
  UNDERLINE_OFFSET,
  UNDERLINE_OFFSET_CLASS,
  WAVY_UNDERLINE_CLASS,
  WAVY_UNDERLINE_STYLE_HTML,
  WAVY_UNDERLINE_WITH_EMPHASIS_CLASS,
  WAVY_UNDERLINE_WITH_EMPHASIS_STYLE_HTML,
} from './style-constants'

// 【注意】color bgColor fontSize fontFamily 在另外的菜单

/**
 * 生成加了样式的 text html
 * @param textNode textNode
 * @param html text html
 */
function genStyledHtml(textNode: Descendant, html: string, editor?: IDomEditor): string {
  let styledHtml = html
  const { bold, italic, underline, wavyUnderline, emphasisDot, code, through, sub, sup } =
    textNode as StyledText
  const textStyleMode = getTextStyleMode(editor)

  if (bold) {
    styledHtml = `<strong>${styledHtml}</strong>`
  }
  if (code) {
    styledHtml = `<code>${styledHtml}</code>`
  }
  if (italic) {
    styledHtml = `<em>${styledHtml}</em>`
  }
  if (underline) {
    if (wavyUnderline || emphasisDot) {
      const underlineAttr =
        textStyleMode === 'class'
          ? ` class="${UNDERLINE_OFFSET_CLASS}"`
          : ` style="text-underline-offset: ${UNDERLINE_OFFSET};"`

      styledHtml = `<u${underlineAttr}>${styledHtml}</u>`
    } else {
      styledHtml = `<u>${styledHtml}</u>`
    }
  }
  if (wavyUnderline) {
    const wavyAttr =
      textStyleMode === 'class'
        ? ` class="${WAVY_UNDERLINE_CLASS}${
            emphasisDot ? ` ${WAVY_UNDERLINE_WITH_EMPHASIS_CLASS}` : ''
          }"`
        : ` style="${
            emphasisDot ? WAVY_UNDERLINE_WITH_EMPHASIS_STYLE_HTML : WAVY_UNDERLINE_STYLE_HTML
          }"`

    styledHtml = `<span${wavyAttr}>${styledHtml}</span>`
  }
  if (emphasisDot) {
    const emphasisAttr =
      textStyleMode === 'class'
        ? ` class="${EMPHASIS_DOT_CLASS}${wavyUnderline ? ` ${EMPHASIS_DOT_WITH_WAVY_CLASS}` : ''}"`
        : ` style="${wavyUnderline ? EMPHASIS_DOT_WITH_WAVY_STYLE_HTML : EMPHASIS_DOT_STYLE_HTML}"`

    styledHtml = `<span${emphasisAttr}>${styledHtml}</span>`
  }
  if (through) {
    styledHtml = `<s>${styledHtml}</s>`
  }
  if (sub) {
    styledHtml = `<sub>${styledHtml}</sub>`
  }
  if (sup) {
    styledHtml = `<sup>${styledHtml}</sup>`
  }
  return styledHtml
}

/**
 * style to html
 * @param textNode slate text node
 * @param textHtml text html
 * @returns styled html
 */
export function styleToHtml(textNode: Descendant, textHtml: string, editor?: IDomEditor): string {
  if (!Text.isText(textNode)) { return textHtml }

  if (isPlainText(textHtml)) {
    // textHtml 是纯文本，而不是 html tag
    return genStyledHtml(textNode, textHtml, editor)
  }

  // textHtml 是 html tag
  const $text = $(textHtml)

  let innerHtml = $text.html()

  innerHtml = genStyledHtml(textNode, innerHtml, editor)
  $text.html(innerHtml)
  return getOuterHTML($text)
}
