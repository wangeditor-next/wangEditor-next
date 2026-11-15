/**
 * @description <video> playback attribute helpers
 */

import { DOMElement } from '../utils/dom'
import { VideoAttributes, VideoPreload } from './custom-types'

const VIDEO_PRELOADS: VideoPreload[] = ['none', 'metadata', 'auto']

// controlslist tokens supported by browsers
const VIDEO_CONTROLS_LIST_TOKENS = ['nodownload', 'nofullscreen', 'noremoteplayback', 'noplaybackrate']

/**
 * 规范化 <video preload> 属性值，仅保留 none / metadata / auto
 * @param value preload 属性值或配置值
 * @returns 合法的 preload 值，否则返回 undefined
 */
export function normalizeVideoPreload(value: unknown): VideoPreload | undefined {
  if (typeof value !== 'string') { return undefined }

  const preload = value.trim().toLowerCase() as VideoPreload

  return VIDEO_PRELOADS.includes(preload) ? preload : undefined
}

/**
 * 规范化 <video controlslist> 属性值，仅保留浏览器支持的 token 并去重
 * @param value controlslist 属性值或配置值，如 'nodownload nofullscreen'
 * @returns 以空格分隔的合法 token，没有合法 token 时返回 undefined
 */
export function normalizeVideoControlsList(value: unknown): string | undefined {
  if (typeof value !== 'string') { return undefined }

  const tokens: string[] = []

  value.trim().toLowerCase().split(/\s+/).forEach(token => {
    if (VIDEO_CONTROLS_LIST_TOKENS.includes(token) && !tokens.includes(token)) {
      tokens.push(token)
    }
  })

  return tokens.length > 0 ? tokens.join(' ') : undefined
}

/**
 * 从 video node 或 `insertVideo.attributes` 配置中提取合法的 <video> 属性，
 * 未设置或不合法的值不会出现在结果中
 * @param value video node 或配置对象
 */
export function normalizeVideoAttributes(value: unknown): VideoAttributes {
  const attributes: VideoAttributes = {}

  if (value == null || typeof value !== 'object') { return attributes }

  const {
    autoplay, loop, muted, playsInline, preload, controlsList, disablePictureInPicture,
  } = value as VideoAttributes
  const normalizedPreload = normalizeVideoPreload(preload)
  const normalizedControlsList = normalizeVideoControlsList(controlsList)

  if (autoplay === true) { attributes.autoplay = true }
  if (loop === true) { attributes.loop = true }
  if (muted === true) { attributes.muted = true }
  if (playsInline === true) { attributes.playsInline = true }
  if (normalizedPreload) { attributes.preload = normalizedPreload }
  if (normalizedControlsList) { attributes.controlsList = normalizedControlsList }
  if (disablePictureInPicture === true) { attributes.disablePictureInPicture = true }

  return attributes
}

/**
 * 解析 <video> DOM 上的属性，布尔属性按 HTML 规则以“是否存在”判断
 * @param videoElem <video> elem
 */
export function parseVideoAttributes(videoElem?: DOMElement): VideoAttributes {
  if (videoElem == null) { return {} }

  return normalizeVideoAttributes({
    autoplay: videoElem.hasAttribute('autoplay'),
    loop: videoElem.hasAttribute('loop'),
    muted: videoElem.hasAttribute('muted'),
    playsInline: videoElem.hasAttribute('playsinline'),
    preload: videoElem.getAttribute('preload'),
    controlsList: videoElem.getAttribute('controlslist'),
    disablePictureInPicture: videoElem.hasAttribute('disablepictureinpicture'),
  })
}

/**
 * 生成 <video> 属性的 HTML 片段（以空格开头），用于 elemToHtml
 * @param value video node
 */
export function genVideoAttributesHtml(value: unknown): string {
  const {
    autoplay, loop, muted, playsInline, preload, controlsList, disablePictureInPicture,
  } = normalizeVideoAttributes(value)
  let html = ''

  if (autoplay) { html += ' autoplay' }
  if (loop) { html += ' loop' }
  if (muted) { html += ' muted' }
  if (playsInline) { html += ' playsinline' }
  if (preload) { html += ` preload="${preload}"` }
  if (controlsList) { html += ` controlslist="${controlsList}"` }
  if (disablePictureInPicture) { html += ' disablepictureinpicture' }

  return html
}

/**
 * 生成编辑区内 <video> 的 attrs。
 * 编辑时不自动播放，因此不包含 autoplay；muted 需通过 DOM property 设置，不在此处
 * @param value video node
 */
export function genEditorVideoAttrs(value: unknown): Record<string, string | boolean> {
  const {
    loop, playsInline, preload, controlsList, disablePictureInPicture,
  } = normalizeVideoAttributes(value)
  const attrs: Record<string, string | boolean> = {}

  if (loop) { attrs.loop = true }
  if (playsInline) { attrs.playsinline = true }
  if (preload) { attrs.preload = preload }
  if (controlsList) { attrs.controlslist = controlsList }
  if (disablePictureInPicture) { attrs.disablepictureinpicture = true }

  return attrs
}
