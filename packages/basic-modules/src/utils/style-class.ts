/**
 * @description text style class utils
 */

import {
  getClassStylePolicy,
  getTextStyleMode as getCoreTextStyleMode,
  IDomEditor,
  reportUnsupportedClassStyle,
  StyleClassTokenType,
} from '@wangeditor-next/core'
import { VNode, VNodeStyle } from 'snabbdom'

import { genColors } from '../modules/color/menu/config'
import { genFontSizeConfig, getFontFamilyConfig } from '../modules/font-size-family/menu/config'
import { genLineHeightConfig } from '../modules/line-height/menu/config'
import { Dom7Array } from './dom'
import { addVnodeClassName, addVnodeDataset, addVnodeStyle } from './vdom'

export type TextStyleType = StyleClassTokenType
export type ClassStyleScene = 'render' | 'toHtml'

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

const REPORTED_UNSUPPORTED_CLASS_STYLE = new Set<string>()

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

function getIndentValues(fontSizeList: string[]) {
  const values = new Set<string>(['2em'])

  fontSizeList.forEach(fontSize => {
    const trimmed = `${fontSize || ''}`.trim()
    const match = trimmed.match(/^(-?\d+(\.\d+)?)([a-z%]+)$/i)

    if (!match) { return }
    const size = parseFloat(match[1])
    const unit = match[3]

    if (!Number.isFinite(size) || size <= 0 || !unit) { return }

    values.add(`${size * 2}${unit}`)
  })

  return Array.from(values)
}

function getDefaultTokenValues(): Record<TextStyleType, string[]> {
  const fontSizeValues = getFontSizeValues()

  return {
    color: genColors(),
    bgColor: genColors(),
    fontSize: fontSizeValues,
    fontFamily: getFontFamilyValues(),
    textAlign: ['left', 'center', 'right', 'justify'],
    lineHeight: genLineHeightConfig(),
    indent: getIndentValues(fontSizeValues),
  }
}

function getExtraTokenValues(editor: IDomEditor | undefined, type: TextStyleType): string[] {
  const extra = editor?.getConfig().styleClassTokens?.[type]

  if (!Array.isArray(extra)) { return [] }
  return extra
}

export function getRegisteredStyleTokenValues(
  editor: IDomEditor | undefined,
  type: TextStyleType,
): string[] {
  const defaultValues = getDefaultTokenValues()[type]
  const extraValues = getExtraTokenValues(editor, type)
  const merged = [...defaultValues, ...extraValues]
  const uniq = new Set<string>()

  merged.forEach(value => {
    const normalized = `${value || ''}`.trim()

    if (!normalized) { return }
    uniq.add(normalized)
  })

  return Array.from(uniq)
}

function hasRegisteredStyleToken(editor: IDomEditor | undefined, type: TextStyleType, value: string): boolean {
  const normalized = normalizeStyleValue(type, value)

  if (!normalized) { return false }

  const values = getRegisteredStyleTokenValues(editor, type)

  for (let i = 0; i < values.length; i += 1) {
    if (normalizeStyleValue(type, values[i]) === normalized) {
      return true
    }
  }

  return false
}

type ClassStyleAction = 'class' | 'preserve-data' | 'inline'

function resolveClassStyleAction(
  editor: IDomEditor | undefined,
  type: TextStyleType,
  value: string,
  scene: ClassStyleScene,
): ClassStyleAction {
  if (hasRegisteredStyleToken(editor, type, value)) {
    return 'class'
  }

  const policy = getClassStylePolicy(editor)
  let fallback: 'preserve-data' | 'inline' | 'throw' = 'preserve-data'

  if (policy === 'fallback-inline') {
    fallback = 'inline'
  }
  if (policy === 'strict') {
    fallback = 'throw'
  }

  const message = `[wangeditor] Unsupported class style token "${type}=${value}" in ${scene}. policy=${policy}`
  const reportKey = `${type}|${value}|${scene}|${fallback}`

  if (!REPORTED_UNSUPPORTED_CLASS_STYLE.has(reportKey)) {
    REPORTED_UNSUPPORTED_CLASS_STYLE.add(reportKey)
    reportUnsupportedClassStyle(editor, {
      type,
      value,
      scene,
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

export function getTextStyleMode(editor?: IDomEditor) {
  return getCoreTextStyleMode(editor)
}

export function appendStyleClassAndData(
  $text: Dom7Array,
  type: TextStyleType,
  value: string,
  editor?: IDomEditor,
  scene?: ClassStyleScene,
  inlineFallback?: () => void,
) {
  const trimmed = `${value || ''}`.trim()

  if (!trimmed) { return }

  $text.attr(DATA_ATTR_NAME[type], trimmed)

  const action = resolveClassStyleAction(editor, type, trimmed, scene || 'toHtml')

  if (action === 'class') {
    $text.addClass(genStyleClassName(type, trimmed))
    return
  }

  if (action === 'inline' && inlineFallback) {
    inlineFallback()
  }
}

export function appendVnodeStyleClassAndData(
  vnode: VNode,
  type: TextStyleType,
  value: string,
  editor?: IDomEditor,
  scene?: ClassStyleScene,
  inlineFallback?: VNodeStyle,
) {
  const trimmed = `${value || ''}`.trim()

  if (!trimmed) { return }

  addVnodeDataset(vnode, { [DATASET_KEY[type]]: trimmed })

  const action = resolveClassStyleAction(editor, type, trimmed, scene || 'render')

  if (action === 'class') {
    addVnodeClassName(vnode, genStyleClassName(type, trimmed))
    return
  }

  if (action === 'inline' && inlineFallback) {
    addVnodeStyle(vnode, inlineFallback)
  }
}

function createClassToValueMap(
  editor: IDomEditor | undefined,
  type: TextStyleType,
): Record<string, string> {
  const values = getRegisteredStyleTokenValues(editor, type)
  const map: Record<string, string> = {}

  values.forEach(value => {
    map[genStyleClassName(type, value)] = value
  })

  return map
}

export function getStyleValueFromDataOrClass(
  $text: Dom7Array,
  type: TextStyleType,
  editor?: IDomEditor,
): string {
  const dataValue = $text.attr(DATA_ATTR_NAME[type]) || ''

  if (dataValue) { return dataValue }

  const classAttr = $text.attr('class') || ''
  const classList = classAttr.trim().split(/\s+/).filter(Boolean)
  const prefix = `${CLASS_NAME_PREFIX[type]}-`
  const classToValueMap = createClassToValueMap(editor, type)

  for (let i = 0; i < classList.length; i += 1) {
    const className = classList[i]

    if (!className.startsWith(prefix)) { continue }

    const value = classToValueMap[className]

    if (value) { return value }
  }

  return ''
}
