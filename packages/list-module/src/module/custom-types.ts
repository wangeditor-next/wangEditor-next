/**
 * @description list element
 * @author wangfupeng
 */

import { Text } from 'slate'

// 【注意】需要把自定义的 Element 引入到最外层的 custom-types.d.ts

export type OrderedListType = '1' | 'a' | 'A' | 'i' | 'I'

/**
 * An outline keeps the established list-item wire format and records the
 * heading semantics as additive metadata.
 */
export type HeadingType = 'header1' | 'header2' | 'header3' | 'header4' | 'header5' | 'header6'

export type ListItemElement = {
  type: 'list-item'
  ordered: boolean // 有序/无序
  level: number // 层级：0 1 2 ...
  start?: number // ol start
  orderType?: OrderedListType // ol type
  headingType?: HeadingType
  listMode?: 'outline'
  listRestart?: number
  children: Text[]
}

export type OutlineListItemElement = ListItemElement & {
  ordered: true
  headingType: HeadingType
  listMode: 'outline'
}
