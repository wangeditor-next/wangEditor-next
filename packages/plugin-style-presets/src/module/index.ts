/**
 * @description style preset module
 */

import './local'

import { IModuleConf } from '@wangeditor-next/editor'

import { stylePresetMenuConf } from './menu/index'
import { parseStyleHtml } from './parse-style-html'
import { renderStyle } from './render-style'
import { styleToHtml } from './style-to-html'

const module: Partial<IModuleConf> = {
  menus: [stylePresetMenuConf],
  parseStyleHtml,
  renderStyle,
  styleToHtml,
}

export default module
