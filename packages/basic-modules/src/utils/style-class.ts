/**
 * @description text style class utils
 * @author Codex
 */

import { IDomEditor } from '@wangeditor-next/core'

import { genColors } from '../modules/color/menu/config'
import { genFontSizeConfig, getFontFamilyConfig } from '../modules/font-size-family/menu/config'
import { genLineHeightConfig } from '../modules/line-height/menu/config'
import { Dom7Array } from './dom'

export type TextStyleType =
  | 'color'
  | 'bgColor'
  | 'fontSize'
  | 'fontFamily'
  | 'textAlign'
  | 'lineHeight'
  | 'indent'

type TextStyleMode = 'inline' | 'class'

const CLASS_NAME_PREFIX: Record<TextStyleType, string> = {
  color: 'w-e-color',
  bgColor: 'w-e-bg-color',
  fontSize: 'w-e-font-size',
  fontFamily: 'w-e-font-family',
  textAlign: 'w-e-text-align',
  lineHeight: 'w-e-line-height',
  indent: 'w-e-indent',
}

const DATA_ATTR_NAME: Record<TextStyleType, string> = {
  color: 'data-w-e-color',
  bgColor: 'data-w-e-bg-color',
  fontSize: 'data-w-e-font-size',
  fontFamily: 'data-w-e-font-family',
  textAlign: 'data-w-e-text-align',
  lineHeight: 'data-w-e-line-height',
  indent: 'data-w-e-indent',
}

const DATASET_KEY: Record<TextStyleType, string> = {
  color: 'wEColor',
  bgColor: 'wEBgColor',
  fontSize: 'wEFontSize',
  fontFamily: 'wEFontFamily',
  textAlign: 'wETextAlign',
  lineHeight: 'wELineHeight',
  indent: 'wEIndent',
}

function normalizeStyleValue(type: TextStyleType, value: string): string {
  const trimmed = (value || '').trim()

  if (!trimmed) { return '' }

  if (type === 'fontFamily') {
    return trimmed.replace(/"/g, '').replace(/\s+/g, ' ').toLowerCase()
  }

  return trimmed.replace(/\s+/g, '').toLowerCase()
}

function hashStyleValue(input: string): string {
  const MOD = 2147483647 // 2^31 - 1
  let hash = 7

  for (const char of input) {
    hash = (hash * 31 + (char.codePointAt(0) || 0)) % MOD
  }

  return hash.toString(36)
}

export function genStyleClassName(type: TextStyleType, value: string): string {
  const normalized = normalizeStyleValue(type, value)
  const hash = hashStyleValue(`${type}:${normalized}`)

  return `${CLASS_NAME_PREFIX[type]}-${hash}`
}

function getFontSizeValues() {
  return genFontSizeConfig().map(item => {
    if (typeof item === 'string') { return item }
    return item.value
  })
}

function getFontFamilyValues() {
  return getFontFamilyConfig().map(item => {
    if (typeof item === 'string') { return item }
    return item.value
  })
}

function getIndentValues() {
  const defaultValue = '2em'
  const values = new Set<string>([defaultValue])

  genFontSizeConfig().forEach(item => {
    const fontSize = typeof item === 'string' ? item : item.value
    const size = parseInt(fontSize, 10)
    const unit = fontSize.replace(`${size}`, '')

    if (size > 0 && unit) {
      values.add(`${size * 2}${unit}`)
    }
  })

  return Array.from(values)
}

function createDefaultClassMap() {
  const values: Record<TextStyleType, string[]> = {
    color: genColors(),
    bgColor: genColors(),
    fontSize: getFontSizeValues(),
    fontFamily: getFontFamilyValues(),
    textAlign: ['left', 'center', 'right', 'justify'],
    lineHeight: genLineHeightConfig(),
    indent: getIndentValues(),
  }

  const classMap: Record<TextStyleType, Record<string, string>> = {
    color: {},
    bgColor: {},
    fontSize: {},
    fontFamily: {},
    textAlign: {},
    lineHeight: {},
    indent: {},
  }

  const types = Object.keys(values) as TextStyleType[]

  types.forEach(type => {
    values[type].forEach(value => {
      classMap[type][genStyleClassName(type, value)] = value
    })
  })

  return classMap
}

const DEFAULT_CLASS_TO_VALUE_MAP = createDefaultClassMap()

export function getTextStyleMode(editor?: IDomEditor): TextStyleMode {
  if (!editor) { return 'inline' }

  const mode = editor.getConfig().textStyleMode

  if (mode === 'class') { return 'class' }
  return 'inline'
}

export function appendStyleClassAndData($text: Dom7Array, type: TextStyleType, value: string) {
  const className = genStyleClassName(type, value)

  $text.addClass(className)
  $text.attr(DATA_ATTR_NAME[type], value)
}

export function getStyleDatasetKey(type: TextStyleType): string {
  return DATASET_KEY[type]
}

export function getStyleValueFromDataOrClass($text: Dom7Array, type: TextStyleType): string {
  const dataValue = $text.attr(DATA_ATTR_NAME[type]) || ''

  if (dataValue) { return dataValue }

  const classAttr = $text.attr('class') || ''
  const classList = classAttr.trim().split(/\s+/).filter(Boolean)
  const prefix = `${CLASS_NAME_PREFIX[type]}-`

  for (let i = 0; i < classList.length; i += 1) {
    const className = classList[i]

    if (!className.startsWith(prefix)) { continue }

    const value = DEFAULT_CLASS_TO_VALUE_MAP[type][className]

    if (value) { return value }
  }

  return ''
}
