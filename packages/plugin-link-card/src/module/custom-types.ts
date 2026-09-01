/**
 * @description link-card element
 * @author wangfupeng
 */

import { SlateText } from '@wangeditor-next/editor'

type EmptyText = {
  text: ''
}
export type LinkCardElement = {
  type: 'link-card'
  title: string
  link: string
  target?: string
  iconImgSrc?: string
  children: EmptyText[] // void 元素必须有一个空 text
}

// wangEditor 内部的 link elem
export type LinkElement = {
  type: 'link'
  url: string
  target?: string
  children: SlateText[]
}
