/**
 * @description image element
 * @author wangfupeng
 */

// 【注意】需要把自定义的 Element 引入到最外层的 custom-types.d.ts

type EmptyText = {
  text: ''
}

/**
 * 原生图片懒加载策略，对应 <img loading="..."> 属性
 */
export type ImageLoading = 'lazy' | 'eager'

export type ImageStyle = {
  width?: string
  height?: string
}

export type ImageElement = {
  type: 'image'
  src: string
  alt?: string
  href?: string
  width?: string
  height?: string
  loading?: ImageLoading
  style?: ImageStyle
  children: EmptyText[]
}
