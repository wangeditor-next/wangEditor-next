/**
 * @description html-source module entry
 */

import './local' // 多语言

import { IModuleConf } from '@wangeditor-next/editor'

import { editHtmlSourceMenuConf } from './menu/index'

const module: Partial<IModuleConf> = {
  menus: [editHtmlSourceMenuConf],
}

export default module
