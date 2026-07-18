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
import createUploaderRuntime from './upload/createUploader'
import createUppyUploaderRuntime from './upload/createUppyUploader'
import type { IUploadConfig } from './upload/interface'

// 创建
export * from './create/index'

// config
export type {
  ClassStylePolicy,
  IClassStyleUnsupportedPayload,
  IEditorConfig,
  ISingleMenuConfig,
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

// upload types only. Runtime uploader APIs are exported from `@wangeditor-next/core/upload`.
export type {
  IUploadAdapter,
  IUploadAdapterContext,
  IUploadConfig,
  IUploader,
  IUploadFile,
  IUploadResultFile,
} from './upload/interface'

let hasWarnedCreateUploader = false
let hasWarnedCreateUppyUploader = false

function warnDeprecatedUploadApi(apiName: string) {
  if (typeof console === 'undefined' || typeof console.warn !== 'function') { return }

  console.warn(
    `[wangeditor-next] \`@wangeditor-next/core\` export \`${apiName}\` is deprecated.`
    + ' Please import it from `@wangeditor-next/core/upload`.',
  )
}

/**
 * @deprecated Please import from `@wangeditor-next/core/upload`.
 */
export const createUploader: typeof createUploaderRuntime = (config, editor) => {
  if (!hasWarnedCreateUploader) {
    hasWarnedCreateUploader = true
    warnDeprecatedUploadApi('createUploader')
  }

  return createUploaderRuntime(config, editor)
}

/**
 * @deprecated Please import from `@wangeditor-next/core/upload`.
 */
export function createUppyUploader(config: IUploadConfig) {
  if (!hasWarnedCreateUppyUploader) {
    hasWarnedCreateUppyUploader = true
    warnDeprecatedUploadApi('createUppyUploader')
  }

  return createUppyUploaderRuntime(config)
}

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
