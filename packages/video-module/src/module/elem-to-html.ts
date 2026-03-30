/**
 * @description to html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Element } from 'slate'

import { genSizeStyledIframeHtml } from '../utils/dom'
import { VideoElement } from './custom-types'

function getTextStyleMode(editor?: IDomEditor): 'inline' | 'class' {
  if (!editor) { return 'inline' }
  return editor.getConfig().textStyleMode === 'class' ? 'class' : 'inline'
}

function getVideoAlignClass(textAlign: string): string {
  const align = (textAlign || '').trim().toLowerCase()

  if (!align) { return 'w-e-video-align-center' }
  if (['left', 'center', 'right', 'justify'].includes(align)) {
    return `w-e-video-align-${align}`
  }

  return 'w-e-video-align-center'
}

function videoToHtml(elemNode: Element, _childrenHtml?: string, editor?: IDomEditor): string {
  const {
    src = '',
    poster = '',
    width = 'auto',
    height = 'auto',
    style = {},
    textAlign = 'center',
  } = elemNode as VideoElement
  const mode = getTextStyleMode(editor)
  const containerAlign = textAlign || 'center'
  const alignData = ` data-w-e-text-align="${containerAlign}"`
  const containerAttrs = mode === 'class'
    ? ` class="${getVideoAlignClass(containerAlign)}"${alignData}`
    : ` style="text-align: ${containerAlign};"`
  let res = `<div data-w-e-type="video" data-w-e-is-void${containerAttrs}>\n`

  if (src.trim().indexOf('<iframe ') === 0) {
    // iframe 形式
    const iframeHtml = genSizeStyledIframeHtml(src, width, height, style, mode === 'class')

    res += iframeHtml
  } else {
    // 其他，mp4 等 url 格式
    const { width: styleWidth = '', height: styleHeight = '' } = style

    if (mode === 'class') {
      const widthData = styleWidth ? ` data-w-e-style-width="${styleWidth}"` : ''
      const heightData = styleHeight ? ` data-w-e-style-height="${styleHeight}"` : ''

      res += `<video poster="${poster}" controls="true" width="${width}" height="${height}"${widthData}${heightData}><source src="${src}" type="video/mp4"/></video>`
    } else {
      let styleStr = ''

      if (styleWidth) { styleStr += `width: ${styleWidth};` }
      if (styleHeight) { styleStr += `height: ${styleHeight};` }
      res += `<video poster="${poster}" controls="true" width="${width}" height="${height}" style="${styleStr}"><source src="${src}" type="video/mp4"/></video>`
    }
  }
  res += '\n</div>'

  return res
}

export const videoToHtmlConf = {
  type: 'video',
  elemToHtml: videoToHtml,
}
