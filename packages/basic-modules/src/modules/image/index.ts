/**
 * @description image module entry
 * @author wangfupeng
 */

import { IModuleConf } from '@wangeditor-next/core'

import { imageToHtmlConf } from './elem-to-html'
import {
  deleteImageMenuConf,
  editImageMenuConf,
  EditorImageSizeMenuConf,
  imageWidth30MenuConf,
  imageWidth50MenuConf,
  imageWidth100MenuConf,
  insertImageMenuConf,
  previewImageMenuConf,
  viewImageLinkMenuConf,
} from './menu/index'
import { parseHtmlConf } from './parse-elem-html'
import withImage from './plugin'
import { renderImageConf } from './render-elem'

const image: Partial<IModuleConf> = {
  renderElems: [renderImageConf],
  elemsToHtml: [imageToHtmlConf],
  parseElemsHtml: [parseHtmlConf],
  menus: [
    insertImageMenuConf,
    deleteImageMenuConf,
    editImageMenuConf,
    previewImageMenuConf,
    viewImageLinkMenuConf,
    imageWidth30MenuConf,
    imageWidth50MenuConf,
    imageWidth100MenuConf,
    EditorImageSizeMenuConf,
  ],
  editorPlugin: withImage,
}

export default image
