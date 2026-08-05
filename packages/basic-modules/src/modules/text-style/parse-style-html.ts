/**
 * @description parse style html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant, Text } from 'slate'

import $, { Dom7Array, DOMElement, getStyleValue } from '../../utils/dom'
import { StyledText } from './custom-types'
import { EMPHASIS_DOT_CLASS, WAVY_UNDERLINE_CLASS } from './style-constants'

/**
 * $text 是否匹配 tags
 * @param $text $text
 * @param selector selector 如 'b,strong' 或 'sub'
 */
function isMatch($text: Dom7Array, selector: string): boolean {
  if ($text.length === 0) { return false }

  return $text[0].matches(selector)
}

function isBoldStyle($text: Dom7Array): boolean {
  const fontWeight = getStyleValue($text, 'font-weight')

  if (!fontWeight) { return false }
  if (fontWeight === 'bold' || fontWeight === 'bolder') { return true }

  const numericFontWeight = Number(fontWeight)

  return !Number.isNaN(numericFontWeight) && numericFontWeight >= 600
}

function getStyleDeclarations($text: Dom7Array): Array<[string, string]> {
  const styleAttr = $text.attr('style') || ''

  return styleAttr.split(';').reduce<Array<[string, string]>>((result, declaration) => {
    const separatorIndex = declaration.indexOf(':')

    if (separatorIndex === -1) { return result }

    const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
    const value = declaration.slice(separatorIndex + 1).trim().toLowerCase()

    if (property && value) {
      result.push([property, value])
    }

    return result
  }, [])
}

function hasClass($text: Dom7Array, className: string): boolean {
  return ($text.attr('class') || '').split(/\s+/).includes(className)
}

type TextDecorationState = {
  line: string
  underline: boolean | undefined
  wavyUnderline: boolean | undefined
}

function getTextDecorationState($text: Dom7Array): TextDecorationState {
  const isUnderlineTag = isMatch($text, 'u')
  const hasWavyClass = hasClass($text, WAVY_UNDERLINE_CLASS)
  let line = isUnderlineTag ? 'underline' : ''
  let style = 'solid'
  let lineDeclared = false
  let styleDeclared = false

  getStyleDeclarations($text).forEach(([property, value]) => {
    if (property === 'text-decoration') {
      const tokens = value.split(/\s+/)

      line = tokens.includes('none')
        ? 'none'
        : tokens.filter(token => ['underline', 'overline', 'line-through'].includes(token)).join(' ')
      style = tokens.find(token => ['solid', 'double', 'dotted', 'dashed', 'wavy'].includes(token)) || 'solid'
      lineDeclared = true
      styleDeclared = true
    }

    if (property === 'text-decoration-line') {
      line = value
      lineDeclared = true
    }

    if (property === 'text-decoration-style') {
      style = value
      styleDeclared = true
    }
  })

  const hasUnderlineLine = line.split(/\s+/).includes('underline')
  let underline: boolean | undefined = isUnderlineTag ? true : undefined
  let wavyUnderline: boolean | undefined = hasWavyClass ? true : undefined

  if (lineDeclared) {
    if (hasUnderlineLine) {
      if (style === 'wavy') {
        wavyUnderline = true
      } else {
        underline = true
        wavyUnderline = false
      }
    } else {
      underline = false
      wavyUnderline = false
    }
  } else if (styleDeclared) {
    if (style === 'wavy') {
      underline = isUnderlineTag ? false : underline
      wavyUnderline = true
    } else {
      wavyUnderline = false
    }
  }

  return { line, underline, wavyUnderline }
}

function hasTextDecoration($text: Dom7Array, value: string): boolean {
  return getTextDecorationState($text).line.split(/\s+/).includes(value.toLowerCase())
}

function getLowerDotEmphasisState($text: Dom7Array): boolean | undefined {
  let emphasis = ''
  let position = ''
  let hasEmphasisDeclaration = false
  let hasPositionDeclaration = false

  getStyleDeclarations($text).forEach(([property, value]) => {
    if (property === 'text-emphasis') {
      emphasis = value
      hasEmphasisDeclaration = true
    }
    if (property === 'text-emphasis-style') {
      emphasis = value
      hasEmphasisDeclaration = true
    }
    if (property === 'text-emphasis-position') {
      position = value
      hasPositionDeclaration = true
    }
  })

  const emphasisTokens = emphasis.split(/\s+/).filter(Boolean)
  const isLowerPosition = position.split(/\s+/).includes('under')
  const isFilledDot = emphasisTokens.includes('dot') && !emphasisTokens.includes('open')

  if (hasEmphasisDeclaration && !isFilledDot) {
    return false
  }
  if (hasPositionDeclaration && !isLowerPosition) {
    return false
  }
  if (hasEmphasisDeclaration && hasPositionDeclaration && isFilledDot && isLowerPosition) {
    return true
  }
  if (hasEmphasisDeclaration && !hasPositionDeclaration) {
    return hasClass($text, EMPHASIS_DOT_CLASS) ? true : false
  }

  return hasClass($text, EMPHASIS_DOT_CLASS) ? true : undefined
}

export function parseStyleHtml(
  textElem: DOMElement,
  node: Descendant,
  _editor: IDomEditor,
): Descendant {
  const $text = $(textElem)

  if (!Text.isText(node)) { return node }

  const textNode = node as StyledText

  // bold
  const fontWeight = getStyleValue($text, 'font-weight')

  if (fontWeight) {
    textNode.bold = isBoldStyle($text)
  } else if (isMatch($text, 'b,strong')) {
    textNode.bold = true
  }

  // italic
  if (isMatch($text, 'i,em') || ['italic', 'oblique'].includes(getStyleValue($text, 'font-style'))) {
    textNode.italic = true
  }

  // underline and wavy underline. Explicit false clears an inherited parent mark.
  const decorationState = getTextDecorationState($text)

  if (decorationState.underline !== undefined) {
    textNode.underline = decorationState.underline
  }
  if (decorationState.wavyUnderline !== undefined) {
    textNode.wavyUnderline = decorationState.wavyUnderline
  }

  // lower dot emphasis. `false` is required to clear an inherited parent mark.
  const emphasisDotState = getLowerDotEmphasisState($text)

  if (emphasisDotState !== undefined) {
    textNode.emphasisDot = emphasisDotState
  }

  // through
  if (isMatch($text, 's,strike') || hasTextDecoration($text, 'line-through')) {
    textNode.through = true
  }

  // sub
  if (isMatch($text, 'sub') || getStyleValue($text, 'vertical-align') === 'sub') {
    textNode.sub = true
  }

  // sup
  if (isMatch($text, 'sup') || getStyleValue($text, 'vertical-align') === 'super') {
    textNode.sup = true
  }

  // code
  if (isMatch($text, 'code')) {
    textNode.code = true
  }

  return textNode
}
