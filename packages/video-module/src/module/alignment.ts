/**
 * @description video alignment helpers
 */

import { Element } from 'slate'

import { VideoAlign, VideoElement } from './custom-types'

export const DEFAULT_VIDEO_ALIGN: VideoAlign = 'center'

const VIDEO_ALIGNS: VideoAlign[] = ['left', 'center', 'right']

export function normalizeVideoAlign(value: unknown): VideoAlign {
  if (typeof value !== 'string') {
    return DEFAULT_VIDEO_ALIGN
  }

  const align = value.trim().toLowerCase() as VideoAlign

  return VIDEO_ALIGNS.includes(align) ? align : DEFAULT_VIDEO_ALIGN
}

export function getVideoAlign(elemNode: Element): VideoAlign {
  const { align } = elemNode as VideoElement

  if (align) {
    return normalizeVideoAlign(align)
  }

  // Import-only adapter for content created before video alignment became media-specific.
  const { textAlign } = elemNode as Element & { textAlign?: unknown }

  return normalizeVideoAlign(textAlign)
}

export function getVideoAlignClass(align: VideoAlign): string {
  return `w-e-video-align-${align}`
}

export function getVideoJustifyContent(align: VideoAlign): string {
  if (align === 'left') {
    return 'flex-start'
  }
  if (align === 'right') {
    return 'flex-end'
  }
  return 'center'
}
