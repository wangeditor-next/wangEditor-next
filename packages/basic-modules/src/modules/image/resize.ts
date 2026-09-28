/**
 * @description shared image resize policy
 */

import {
  DomEditor,
  IDomEditor,
  IImageResizeCheckPayload,
  IImageResizeOption,
  ImageResizeSource,
  ImageResizeUnit,
} from '@wangeditor-next/core'
import { Node, Transforms } from 'slate'

import { ImageElement } from './custom-types'

const pixelReg = /^\d+(\.\d+)?px$/
const percentageReg = /^\d+(\.\d+)?%$/
const numberReg = /^\d+(\.\d+)?$/

export interface IImageResizeResult {
  width: string
  height: string
}

const defaultPresetValues = ['30%', '50%', '100%']

export function getImageResizePreset(editor: IDomEditor, defaultValue: string): IImageResizeOption {
  const index = defaultPresetValues.indexOf(defaultValue)
  const configuredOption = editor.getConfig().imageResize?.resizeOptions?.[index]

  return configuredOption || { label: defaultValue, value: defaultValue }
}

function normalizeNumber(value: string, unit: ImageResizeUnit): string {
  return `${Number(value)}${unit}`
}

/** Normalize a user value, returning null when it violates a configured unit. */
export function normalizeImageSize(
  value: string,
  unit?: ImageResizeUnit,
  source: ImageResizeSource = 'modal',
): string | null {
  const trimmed = value.trim()

  if (trimmed === '' || trimmed === 'auto') { return '' }

  if (unit === 'px') {
    if (numberReg.test(trimmed)) { return normalizeNumber(trimmed, 'px') }
    if (pixelReg.test(trimmed)) { return trimmed }
    // Legacy preset labels are percentages, but represent the same number in the selected unit.
    if (source === 'preset' && percentageReg.test(trimmed)) {
      return normalizeNumber(trimmed.slice(0, -1), 'px')
    }
    return null
  }

  if (unit === '%') {
    if (numberReg.test(trimmed)) { return normalizeNumber(trimmed, '%') }
    if (percentageReg.test(trimmed)) { return trimmed }
    return null
  }

  if (percentageReg.test(trimmed) || pixelReg.test(trimmed)) { return trimmed }
  if (numberReg.test(trimmed)) { return normalizeNumber(trimmed, 'px') }
  return 'auto'
}

export function validateImageSize(
  editor: IDomEditor,
  rawWidth: string,
  rawHeight: string,
  source: ImageResizeSource,
): IImageResizeResult | null {
  const { resizeUnit, checkImageSize } = editor.getConfig().imageResize || {}
  const width = normalizeImageSize(rawWidth, resizeUnit, source)
  const height = normalizeImageSize(rawHeight, resizeUnit, source)

  if (width == null || height == null) {
    editor.alert(
      resizeUnit === 'px' ? '图片宽高只能使用 px 单位' : '图片宽高只能使用 % 单位',
      'error',
    )
    return null
  }

  const payload: IImageResizeCheckPayload = {
    width,
    height,
    rawWidth,
    rawHeight,
    source,
  }
  const checkResult = checkImageSize?.(payload)

  if (typeof checkResult === 'string') {
    editor.alert(checkResult, 'error')
    return null
  }
  if (checkImageSize && checkResult !== true) { return null }

  return { width, height }
}

export function updateImageSize(
  editor: IDomEditor,
  imageNode: Node,
  rawWidth: string,
  rawHeight: string,
  source: ImageResizeSource,
): boolean {
  const result = validateImageSize(editor, rawWidth, rawHeight, source)

  if (result == null) { return false }

  const { style = {} } = imageNode as ImageElement
  let path

  try {
    path = DomEditor.findPath(editor, imageNode)
  } catch (_error) {
    path = undefined
  }

  const operation = {
    style: {
      ...style,
      ...result,
    },
  }

  if (path != null) {
    Transforms.setNodes(editor, operation, { at: path })
    return true
  }

  // Slate may replace the node object while a modal is open. Restrict the
  // fallback to the current selection so an unavailable path cannot update
  // unrelated images in the document.
  if (editor.selection == null) { return false }
  Transforms.setNodes(editor, operation, {
    at: editor.selection,
    match: n => DomEditor.checkNodeType(n, 'image'),
  })
  return true
}
