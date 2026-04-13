/**
 * @description to html
 * @author wangfupeng
 */

import { getTextStyleMode, IDomEditor } from '@wangeditor-next/core'
import { Element } from 'slate'

import { ImageElement } from './custom-types'

function imageToHtml(elemNode: Element, _childrenHtml: string, editor?: IDomEditor): string {
  const {
    src, alt = '', href = '', width = '', height = '', style = {},
  } = elemNode as ImageElement
  const { width: styleWidth = '', height: styleHeight = '' } = style
  const mode = getTextStyleMode(editor)

  if (mode === 'class') {
    // class 模式下不输出 inline style
    const exportedWidth = width || styleWidth
    const exportedHeight = height || styleHeight
    const widthData = styleWidth ? ` data-w-e-style-width="${styleWidth}"` : ''
    const heightData = styleHeight ? ` data-w-e-style-height="${styleHeight}"` : ''

    return `<img src="${src}" alt="${alt}" data-href="${href}" width="${exportedWidth}" height="${exportedHeight}"${widthData}${heightData}/>`
  }

  let styleStr = ''

  if (styleWidth) { styleStr += `width: ${styleWidth};` }
  if (styleHeight) { styleStr += `height: ${styleHeight};` }
  return `<img src="${src}" alt="${alt}" data-href="${href}" width="${width}" height="${height}" style="${styleStr}"/>`
}

export const imageToHtmlConf = {
  type: 'image',
  elemToHtml: imageToHtml,
}
