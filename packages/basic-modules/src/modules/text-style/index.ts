/**
 * @description text style entry
 * @author wangfupeng
 */

import { IModuleConf } from '@wangeditor-next/core'

import {
  boldMenuConf,
  clearStyleMenuConf,
  codeMenuConf,
  emphasisDotMenuConf,
  italicMenuConf,
  subMenuConf,
  supMenuConf,
  throughMenuConf,
  underlineMenuConf,
  wavyUnderlineMenuConf,
} from './menu/index'
import { parseStyleHtml } from './parse-style-html'
import { renderStyle } from './render-style'
import { styleToHtml } from './style-to-html'

const textStyle: Partial<IModuleConf> = {
  renderStyle,
  menus: [
    boldMenuConf,
    underlineMenuConf,
    italicMenuConf,
    wavyUnderlineMenuConf,
    emphasisDotMenuConf,
    throughMenuConf,
    codeMenuConf,
    subMenuConf,
    supMenuConf,
    clearStyleMenuConf,
  ],
  styleToHtml,
  parseStyleHtml,
}

export default textStyle
