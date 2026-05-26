/**
 * @description module entry
 * @author wangfupeng
 */

import { IModuleConf } from '@wangeditor-next/editor'

import withCtrlEnter from './plugin'

const module: Partial<IModuleConf> = {
  editorPlugin: withCtrlEnter,
}

export default module
