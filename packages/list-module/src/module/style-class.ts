/**
 * @description list style class utils
 */

import { getClassStylePolicy, IDomEditor, reportUnsupportedClassStyle } from '@wangeditor-next/core'

const DEFAULT_COLORS = [
  'rgb(0, 0, 0)',
  'rgb(38, 38, 38)',
  'rgb(89, 89, 89)',
  'rgb(140, 140, 140)',
  'rgb(191, 191, 191)',
  'rgb(217, 217, 217)',
  'rgb(233, 233, 233)',
  'rgb(245, 245, 245)',
  'rgb(250, 250, 250)',
  'rgb(255, 255, 255)',
  'rgb(225, 60, 57)',
  'rgb(231, 95, 51)',
  'rgb(235, 144, 58)',
  'rgb(245, 219, 77)',
  'rgb(114, 192, 64)',
  'rgb(89, 191, 192)',
  'rgb(66, 144, 247)',
  'rgb(54, 88, 226)',
  'rgb(106, 57, 201)',
  'rgb(216, 68, 147)',
  'rgb(251, 233, 230)',
  'rgb(252, 237, 225)',
  'rgb(252, 239, 212)',
  'rgb(252, 251, 207)',
  'rgb(231, 246, 213)',
  'rgb(218, 244, 240)',
  'rgb(217, 237, 250)',
  'rgb(224, 232, 250)',
  'rgb(237, 225, 248)',
  'rgb(246, 226, 234)',
  'rgb(255, 163, 158)',
  'rgb(255, 187, 150)',
  'rgb(255, 213, 145)',
  'rgb(255, 251, 143)',
  'rgb(183, 235, 143)',
  'rgb(135, 232, 222)',
  'rgb(145, 213, 255)',
  'rgb(173, 198, 255)',
  'rgb(211, 173, 247)',
  'rgb(255, 173, 210)',
  'rgb(255, 77, 79)',
  'rgb(255, 122, 69)',
  'rgb(255, 169, 64)',
  'rgb(255, 236, 61)',
  'rgb(115, 209, 61)',
  'rgb(54, 207, 201)',
  'rgb(64, 169, 255)',
  'rgb(89, 126, 247)',
  'rgb(146, 84, 222)',
  'rgb(247, 89, 171)',
  'rgb(207, 19, 34)',
  'rgb(212, 56, 13)',
  'rgb(212, 107, 8)',
  'rgb(212, 177, 6)',
  'rgb(56, 158, 13)',
  'rgb(8, 151, 156)',
  'rgb(9, 109, 217)',
  'rgb(29, 57, 196)',
  'rgb(83, 29, 171)',
  'rgb(196, 29, 127)',
  'rgb(130, 0, 20)',
  'rgb(135, 20, 0)',
  'rgb(135, 56, 0)',
  'rgb(97, 71, 0)',
  'rgb(19, 82, 0)',
  'rgb(0, 71, 79)',
  'rgb(0, 58, 140)',
  'rgb(6, 17, 120)',
  'rgb(34, 7, 94)',
  'rgb(120, 6, 80)',
]

const REPORTED_UNSUPPORTED_LIST_COLOR = new Set<string>()

function normalizeColorValue(value: string): string {
  return (value || '').trim().replace(/\s+/g, '').toLowerCase()
}

const DEFAULT_COLOR_SET = new Set(DEFAULT_COLORS.map(color => normalizeColorValue(color)))

function hashStyleValue(input: string): string {
  const MOD = 2147483647 // 2^31 - 1
  let hash = 7

  for (const char of input) {
    hash = (hash * 31 + (char.codePointAt(0) || 0)) % MOD
  }

  return hash.toString(36)
}

export function genListColorClassName(color: string): string {
  const normalized = normalizeColorValue(color)

  return `w-e-list-color-${hashStyleValue(`color:${normalized}`)}`
}

function hasExtraRegisteredColor(editor: IDomEditor | undefined, color: string): boolean {
  const extraTokens = editor?.getConfig().styleClassTokens?.color || []
  const normalizedColor = normalizeColorValue(color)

  for (let i = 0; i < extraTokens.length; i += 1) {
    if (normalizeColorValue(extraTokens[i]) === normalizedColor) {
      return true
    }
  }

  return false
}

function hasRegisteredListColor(editor: IDomEditor | undefined, color: string): boolean {
  const normalized = normalizeColorValue(color)

  if (!normalized) { return false }
  if (DEFAULT_COLOR_SET.has(normalized)) { return true }
  if (hasExtraRegisteredColor(editor, color)) { return true }

  return false
}

export function resolveListColorAction(
  editor: IDomEditor | undefined,
  color: string,
): 'class' | 'preserve-data' | 'inline' {
  if (hasRegisteredListColor(editor, color)) {
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

  const message = `[wangeditor] Unsupported list color class token color=${color}. policy=${policy}`
  const reportKey = `${color}|${fallback}`

  if (!REPORTED_UNSUPPORTED_LIST_COLOR.has(reportKey)) {
    REPORTED_UNSUPPORTED_LIST_COLOR.add(reportKey)
    reportUnsupportedClassStyle(editor, {
      type: 'color',
      value: color,
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
