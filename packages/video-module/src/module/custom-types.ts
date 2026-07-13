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

export type VideoElement = {
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
