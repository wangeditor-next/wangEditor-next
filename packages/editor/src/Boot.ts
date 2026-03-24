/**
 * @description Editor View class
 * @author wangfupeng
 */

import type {
  IEditorConfig,
  IElemToHtmlConf,
  IModuleConf,
  IParseElemHtmlConf,
  IPreParseHtmlConf,
  IRegisterMenuConf,
  IRenderElemConf,
  IToolbarConfig,
  ParseStyleHtmlFnType,
  RenderStyleFnType,
  styleToHtmlFnType,
} from '@wangeditor-next/core'
import {
  IDomEditor,
  // parseHtml
  registerElemToHtmlConf,
  registerMenu,
  registerParseElemHtmlConf,
  registerParseStyleHtmlHandler,
  registerPreParseHtmlConf,
  registerRenderElemConf,
  registerStyleHandler,
  registerStyleToHtmlHandler,
} from '@wangeditor-next/core'
import type { ISingleMenuConfig } from 'packages/core/src/config/interface'

import registerModule from './register-builtin-modules/register'

type PluginType = <T extends IDomEditor>(editor: T) => T

class Boot {
  constructor() {
    throw new Error('不能实例化\nCan not construct a instance')
  }

  // editor 配置
  static editorConfig: Partial<IEditorConfig> = {}

  static setEditorConfig(newConfig: Partial<IEditorConfig> = {}) {
    this.editorConfig = {
      ...this.editorConfig,
      ...newConfig,
    }
  }

  static simpleEditorConfig: Partial<IEditorConfig> = {}

  static setSimpleEditorConfig(newConfig: Partial<IEditorConfig> = {}) {
    this.simpleEditorConfig = {
      ...this.simpleEditorConfig,
      ...newConfig,
    }
  }

  // toolbar 配置
  static toolbarConfig: Partial<IToolbarConfig> = {}

  static setToolbarConfig(newConfig: Partial<IToolbarConfig> = {}) {
    this.toolbarConfig = {
      ...this.toolbarConfig,
      ...newConfig,
    }
  }

  static simpleToolbarConfig: Partial<IToolbarConfig> = {}

  static setSimpleToolbarConfig(newConfig: Partial<IToolbarConfig> = {}) {
    this.simpleToolbarConfig = {
      ...this.simpleToolbarConfig,
      ...newConfig,
    }
  }

  // 注册插件
  static plugins: PluginType[] = []

  static registerPlugin(plugin: PluginType) {
    this.plugins.push(plugin)
  }

  // 注册 menu
  // TODO 可在注册时传入配置，在开发文档中说明
  static registerMenu(menuConf: IRegisterMenuConf, customConfig?: ISingleMenuConfig) {
    registerMenu(menuConf, customConfig)
  }

  // 注册 renderElem
  static registerRenderElem(renderElemConf: IRenderElemConf) {
    registerRenderElemConf(renderElemConf)
  }

  // 注册 renderStyle
  static registerRenderStyle(fn: RenderStyleFnType) {
    registerStyleHandler(fn)
  }

  // 注册 elemToHtml
  static registerElemToHtml(elemToHtmlConf: IElemToHtmlConf) {
    registerElemToHtmlConf(elemToHtmlConf)
  }

  // 注册 styleToHtml
  static registerStyleToHtml(fn: styleToHtmlFnType) {
    registerStyleToHtmlHandler(fn)
  }

  // 注册 preParseHtml
  static registerPreParseHtml(preParseHtmlConf: IPreParseHtmlConf) {
    registerPreParseHtmlConf(preParseHtmlConf)
  }

  // 注册 parseElemHtml
  static registerParseElemHtml(parseElemHtmlConf: IParseElemHtmlConf) {
    registerParseElemHtmlConf(parseElemHtmlConf)
  }

  // 注册 parseStyleHtml
  static registerParseStyleHtml(fn: ParseStyleHtmlFnType) {
    registerParseStyleHtmlHandler(fn)
  }

  // 注册 module
  static registerModule(module: Partial<IModuleConf>) {
    registerModule(module)
  }
}

export default Boot
