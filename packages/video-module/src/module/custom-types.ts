/**
 * @description video element
 * @author wangfupeng
 */

// 【注意】需要把自定义的 Element 引入到最外层的 custom-types.d.ts

type EmptyText = {
  text: ''
}

export type videoStyle = {
  width?: string
  height?: string
}

export type VideoAlign = 'left' | 'center' | 'right'

export type VideoPreload = 'none' | 'metadata' | 'auto'

// <video> 播放相关属性，仅作用于 <video> 形式（不含 <iframe> 第三方视频）
export type VideoAttributes = {
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  preload?: VideoPreload
  // 以空格分隔的 controlslist token，如 'nodownload nofullscreen'
  controlsList?: string
  disablePictureInPicture?: boolean
}

export type VideoElement = VideoAttributes & {
  type: 'video'
  key?: string
  src: string
  poster?: string
  align?: VideoAlign
  width?: string
  height?: string
  style?: videoStyle
  children: EmptyText[]
}
