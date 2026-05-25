/**
 * @description 获取编辑器默认配置
 * @author wangfupeng
 */

import { genDefaultHoverbarKeys, genSimpleHoverbarKeys } from './hoverbar'
import { genDefaultToolbarKeys, genSimpleToolbarKeys } from './toolbar'

export function getDefaultEditorConfig() {
  return {
    hoverbarKeys: genDefaultHoverbarKeys(),
  }
}

export function getSimpleEditorConfig() {
  return {
    hoverbarKeys: genSimpleHoverbarKeys(),
  }
}

export function getDefaultToolbarConfig() {
  return {
    toolbarKeys: genDefaultToolbarKeys(),
  }
}

export function getSimpleToolbarConfig() {
  return {
    toolbarKeys: genSimpleToolbarKeys(),
  }
}
