/**
 * @description video module
 * @author wangfupeng
 */

import { IModuleConf } from '@wangeditor-next/core'

import { videoToHtmlConf } from './elem-to-html'
import {
  editorVideoSizeMenuConf,
  editorVideoSrcMenuConf,
  insertVideoMenuConf,
  uploadVideoMenuConf,
  videoAlignCenterMenuConf,
  videoAlignLeftMenuConf,
  videoAlignRightMenuConf,
} from './menu/index'
import { parseHtmlConf } from './parse-elem-html'
import withVideo from './plugin'
import { preParseHtmlConf } from './pre-parse-html'
import { renderVideoConf } from './render-elem'

const video: Partial<IModuleConf> = {
  renderElems: [renderVideoConf],
  elemsToHtml: [videoToHtmlConf],
  preParseHtml: [preParseHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [
    insertVideoMenuConf,
    uploadVideoMenuConf,
    editorVideoSizeMenuConf,
    editorVideoSrcMenuConf,
    videoAlignLeftMenuConf,
    videoAlignCenterMenuConf,
    videoAlignRightMenuConf,
  ],
  editorPlugin: withVideo,
}

export default video
