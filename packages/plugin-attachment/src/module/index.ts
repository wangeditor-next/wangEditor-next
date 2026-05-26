/**
 * @description attachment module entry
 * @author wangfupeng
 */

import './local'

import { IModuleConf } from '@wangeditor-next/editor'

import elemToHtmlConf from './elem-to-html'
import {
  downloadAttachmentMenuConf,
  uploadAttachmentMenuConf,
} from './menu/index'
import parseHtmlConf from './parse-elem-html'
import withAttachment from './plugin'
import renderElemConf from './render-elem'

const module: Partial<IModuleConf> = {
  editorPlugin: withAttachment,
  renderElems: [renderElemConf],
  elemsToHtml: [elemToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [uploadAttachmentMenuConf, downloadAttachmentMenuConf],
}

export default module
