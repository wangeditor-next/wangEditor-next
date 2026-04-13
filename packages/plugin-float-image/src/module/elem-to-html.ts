/**
 * @description elem to html
 * @author cycleccc
 */

import { getTextStyleMode, IDomEditor, SlateElement } from '@wangeditor-next/editor'

import { ImageElement } from './custom-types'

function getFloatClass(float: string): string {
  const val = (float || '').trim().toLowerCase()

  if (val === 'left') { return 'w-e-float-image-left' }
  if (val === 'right') { return 'w-e-float-image-right' }
  if (val === 'none') { return 'w-e-float-image-none' }

  return ''
}

// 生成 html 的函数
function imageToHtml(elem: SlateElement, _childrenHtml: string, editor?: IDomEditor): string {
  const {
    src, alt = '', href = '', style = {},
  } = elem as ImageElement
  const { width = '', height = '', float = '' } = style
  const mode = getTextStyleMode(editor)

  if (mode === 'class') {
    const widthData = width ? ` data-w-e-style-width="${width}"` : ''
    const heightData = height ? ` data-w-e-style-height="${height}"` : ''
    const floatData = float ? ` data-w-e-style-float="${float}"` : ''
    const floatClass = getFloatClass(float)
    const classAttr = floatClass ? ` class="${floatClass}"` : ''

    return `<img src="${src}" alt="${alt}" data-href="${href}" width="${width}" height="${height}"${classAttr}${widthData}${heightData}${floatData}/>`
  }

  let styleStr = ''

  if (width) { styleStr += `width: ${width};` }
  if (height) { styleStr += `height: ${height};` }
  if (float) { styleStr += `float: ${float};` }
  return `<img src="${src}" alt="${alt}" data-href="${href}" style="${styleStr}"/>`
}

// 配置
const conf = {
  type: 'image', // 节点 type ，重要！！！
  elemToHtml: imageToHtml,
}

export default conf
