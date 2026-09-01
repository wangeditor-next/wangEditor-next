/**
 * @description menu index
 * @author wangfupeng
 */

import { genConvertToLinkCardConfig } from './config'
import ConvertToLink from './ConvertToLink'
import ConvertToLinkCard from './ConvertToLinkCard'

export const convertToLinkCardMenuConf = {
  key: 'convertToLinkCard',
  factory() {
    return new ConvertToLinkCard()
  },

  // 默认的菜单菜单配置，将存储在 editorConfig.MENU_CONF[key] 中
  // 创建编辑器时，可通过 editorConfig.MENU_CONF[key] = {...} 来修改
  config: genConvertToLinkCardConfig(),
}

export const convertToLinkMenuConf = {
  key: 'convertToLink',
  factory() {
    return new ConvertToLink()
  },
}
