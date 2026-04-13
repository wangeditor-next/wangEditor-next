/**
 * @description parse html
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Descendant } from 'slate'

import $, { Dom7Array, DOMElement } from '../utils/dom'
import { styleStringToObject } from '../utils/util'
import { VideoElement, videoStyle } from './custom-types'

function genVideoElem(
  src: string,
  poster = '',
  width = 'auto',
  height = 'auto',
  style: videoStyle = {},
  textAlign = 'center',
): VideoElement {
  return {
    type: 'video',
    src,
    poster,
    width,
    height,
    style,
    children: [{ text: '' }], // void 元素有一个空 text
    textAlign,
  }
}

function getTextAlign($elem: Dom7Array): string {
  const styleAlign = styleStringToObject($elem.attr('style') || '')['text-align']

  if (styleAlign) { return styleAlign }

  const dataAlign = ($elem.attr('data-w-e-text-align') || '').trim()

  if (dataAlign) { return dataAlign }

  const classAttr = $elem.attr('class') || ''
  const classList = classAttr.trim().split(/\s+/).filter(Boolean)

  for (let i = 0; i < classList.length; i += 1) {
    const className = classList[i]

    if (!className.startsWith('w-e-video-align-')) { continue }

    const align = className.replace('w-e-video-align-', '')

    if (align) { return align }
  }

  return 'center'
}

function parseHtml(elem: DOMElement, _children: Descendant[], _editor: IDomEditor): VideoElement {
  const $elem = $(elem)
  let src = ''
  let poster = ''
  let width = 'auto'
  let height = 'auto'
  let style: videoStyle = {}
  let textAlign = 'center'
  // <iframe> 形式
  const $iframe = $elem.find('iframe')

  if ($iframe.length > 0) {
    width = $iframe.attr('width') || 'auto'
    height = $iframe.attr('height') || 'auto'
    const iframeStyleStr = $iframe.attr('style') || ''

    style = styleStringToObject(iframeStyleStr) as videoStyle
    const iframeStyleWidth = $iframe.attr('data-w-e-style-width') || ''
    const iframeStyleHeight = $iframe.attr('data-w-e-style-height') || ''

    if (!style.width && iframeStyleWidth) { style.width = iframeStyleWidth }
    if (!style.height && iframeStyleHeight) { style.height = iframeStyleHeight }
    src = $iframe[0].outerHTML
    textAlign = getTextAlign($elem)
    return genVideoElem(src, poster, width, height, style, textAlign)
  }

  // <video> 形式
  const $video = $elem.find('video')

  src = $video.attr('src') || ''
  if (!src) {
    if ($video.length > 0) {
      const $source = $video.find('source')

      src = $source.attr('src') || ''
    }
  }
  width = $video.attr('width') || 'auto'
  height = $video.attr('height') || 'auto'
  poster = $video.attr('poster') || ''
  const videoStyleStr = $video.attr('style') || ''

  style = styleStringToObject(videoStyleStr) as videoStyle
  const videoStyleWidth = $video.attr('data-w-e-style-width') || ''
  const videoStyleHeight = $video.attr('data-w-e-style-height') || ''

  if (!style.width && videoStyleWidth) { style.width = videoStyleWidth }
  if (!style.height && videoStyleHeight) { style.height = videoStyleHeight }
  textAlign = getTextAlign($elem)
  return genVideoElem(src, poster, width, height, style, textAlign)
}

export const parseHtmlConf = {
  selector: 'div[data-w-e-type="video"]',
  parseElemHtml: parseHtml,
}
