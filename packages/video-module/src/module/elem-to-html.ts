/**
 * @description to html
 * @author wangfupeng
 */

import { getTextStyleMode, IDomEditor } from '@wangeditor-next/core'
import { Element } from 'slate'

import { genSizeStyledIframeHtml } from '../utils/dom'
import { getVideoAlign, getVideoAlignClass, getVideoJustifyContent } from './alignment'
import { VideoElement } from './custom-types'

function videoToHtml(elemNode: Element, _childrenHtml?: string, editor?: IDomEditor): string {
  const {
    src = '',
    poster = '',
    width = 'auto',
    height = 'auto',
    style = {},
  } = elemNode as VideoElement
  const mode = getTextStyleMode(editor)
  const align = getVideoAlign(elemNode)
  const alignData = ` data-w-e-align="${align}"`
  const containerAttrs = mode === 'class'
    ? `${alignData} class="w-e-video ${getVideoAlignClass(align)}"`
    : `${alignData} style="display: flex; justify-content: ${getVideoJustifyContent(align)}; margin: 0; max-width: 100%; width: 100%;"`
  let res = `<figure data-w-e-type="video" data-w-e-is-void${containerAttrs}>\n`

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
      let styleStr = 'display: block; max-width: 100%;'

      if (styleWidth) { styleStr += ` width: ${styleWidth};` }
      if (styleHeight) { styleStr += ` height: ${styleHeight};` }
      res += `<video poster="${poster}" controls="true" width="${width}" height="${height}" style="${styleStr}"><source src="${src}" type="video/mp4"/></video>`
    }
  }
  res += '\n</figure>'

  return res
}

export const videoToHtmlConf = {
  type: 'video',
  elemToHtml: videoToHtml,
}
