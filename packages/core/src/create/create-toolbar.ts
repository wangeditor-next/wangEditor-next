/**
 * @description create toolbar
 * @author wangfupeng
 */

import { genToolbarConfig } from '../config/index'
import { IToolbarConfig } from '../config/interface'
import { IDomEditor } from '../editor/interface'
import Toolbar from '../menus/bar/Toolbar'
import { DOMElement } from '../utils/dom'
import { EDITOR_TO_TOOLBAR, TOOLBAR_TO_EDITOR } from '../utils/weak-maps'
import { isRepeatedCreateToolbar } from './helper'

interface ICreateOption {
  selector: string | DOMElement
  config?: Partial<IToolbarConfig>
}

export default function (editor: IDomEditor | null, option: ICreateOption): Toolbar {
  if (editor == null) {
    throw new Error('Cannot create toolbar, because editor is null')
  }
  const { selector, config = {} } = option

  // 避免重复创建
  if (isRepeatedCreateToolbar(editor, selector)) {
    // 对同一个 DOM 重复创建
    throw new Error(`Repeated create toolbar by selector '${selector}'`)
  }

  // 处理配置
  const toolbarConfig = genToolbarConfig(config)

  // 创建 toolbar ，并记录和 editor 关系
  const toolbar = new Toolbar(selector, toolbarConfig)

  TOOLBAR_TO_EDITOR.set(toolbar, editor)
  EDITOR_TO_TOOLBAR.set(editor, toolbar)

  return toolbar
}
