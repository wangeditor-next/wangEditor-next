/**
 * @description module entry
 * @author wangfupeng
 */

import './local' // 多语言

import { IModuleConf } from '@wangeditor-next/editor'

import elemToHtmlConf from './elem-to-html'
import { convertToLinkCardMenuConf, convertToLinkMenuConf } from './menu/index'
import parseHtmlConf from './parse-elem-html'
import withLinkCard from './plugin'
import renderElemConf from './render-elem'

const module: Partial<IModuleConf> = {
  editorPlugin: withLinkCard,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [convertToLinkCardMenuConf, convertToLinkMenuConf],
}

export default module
