/**
 * @description core index
 * @author wangfupeng
 */

import './assets/index.less'

import type { IDomEditor } from './editor/interface'
import type { IRegisterMenuConf } from './menus/index'
import type { IParseElemHtmlConf, IPreParseHtmlConf, ParseStyleHtmlFnType } from './parse-html/index'
import type { IRenderElemConf, RenderStyleFnType } from './render/index'
import type { IElemToHtmlConf, styleToHtmlFnType } from './to-html/index'

// 创建
export * from './create/index'

// config
export type {
  ClassStylePolicy,
  IClassStyleUnsupportedPayload,
  IEditorConfig,
  IToolbarConfig,
  IUploadImageConfig,
  IUploadVideoConfig,
  StyleClassTokenType,
  TextStyleMode,
} from './config/interface'
export * from './config/style-mode'

// editor 接口和 command
export * from './editor/dom-editor'
export * from './editor/interface'

// 注册 render
export * from './render/index'

// 注册 toHtml
export * from './to-html/index'

// 注册 parseHtml
export * from './parse-html/index'

// menu 的接口、注册、方法等
export * from './menus/index'

// upload
export * from './upload/index'

// i18n
export * from './i18n/index'

// dom utils
export * from './utils/dom'

export interface IModuleConf {
  // 注册菜单
  menus: Array<IRegisterMenuConf>

  // 渲染 modal -> view
  renderStyle: RenderStyleFnType
  renderElems: Array<IRenderElemConf>

  // to html
  styleToHtml: styleToHtmlFnType
  elemsToHtml: Array<IElemToHtmlConf>

  // parse html
  preParseHtml: Array<IPreParseHtmlConf>
  parseStyleHtml: ParseStyleHtmlFnType
  parseElemsHtml: Array<IParseElemHtmlConf>

  // 注册插件
  editorPlugin: <T extends IDomEditor>(editor: T) => T
}
