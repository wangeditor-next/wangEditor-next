/**
 * @description create editor
 * @author wangfupeng
 */

import { createEditor } from 'slate'
import { withHistory } from 'slate-history'

import { genEditorConfig } from '../config/index'
import { EditorEvents, ICreateOption } from '../config/interface'
import { IDomEditor } from '../editor/interface'
import { withConfig } from '../editor/plugins/with-config'
import { withContent } from '../editor/plugins/with-content'
import { withDOM } from '../editor/plugins/with-dom'
import { withEmitter } from '../editor/plugins/with-emitter'
import { withEventData } from '../editor/plugins/with-event-data'
import { withMaxLength } from '../editor/plugins/with-max-length'
import { withSelection } from '../editor/plugins/with-selection'
import HoverBar from '../menus/bar/HoverBar'
import TextArea from '../text-area/TextArea'
import { promiseResolveThen } from '../utils/util'
import {
  EDITOR_TO_CONFIG,
  EDITOR_TO_HOVER_BAR,
  EDITOR_TO_TEXTAREA,
  HOVER_BAR_TO_EDITOR,
  TEXTAREA_TO_EDITOR,
} from '../utils/weak-maps'
import bindNodeRelation from './bind-node-relation'
import {
  initializeContent, isRepeatedCreateTextarea,
} from './helper'

const MIN_TEXTAREA_HEIGHT = 300
const MESSAGES = {
  heightWarning: {
    en: 'Textarea height < 300px. This may cause modal and hoverbar position error',
    zh: '编辑区域高度 < 300px 这可能会导致 modal hoverbar 定位异常',
  },
}

/**
 * 创建编辑器
 */
export default function (option: Partial<ICreateOption>) {
  const {
    selector = '', config = {}, content, html, plugins = [],
  } = option

  // 创建实例 - 使用插件

  const createBaseEditor = () => createEditor() as IDomEditor

  const applyPlugins = (editor: IDomEditor) => {
    return [
      withEventData,
      withDOM,
      withConfig,
      withContent,
      withSelection,
      withEmitter,
      withMaxLength,
      withHistory,
    ].reduce((ed, plugin) => plugin(ed), editor)
  }

  let editor = applyPlugins(createBaseEditor())

  if (selector) {
    // 检查是否对同一个 DOM 重复创建
    if (isRepeatedCreateTextarea(editor, selector)) {
      throw new Error(`Repeated create editor by selector '${selector}'`)
    }
  }

  // 处理配置
  const editorConfig = genEditorConfig(config)

  EDITOR_TO_CONFIG.set(editor, editorConfig)
  const { hoverbarKeys = {} } = editorConfig

  // 注册第三方插件
  plugins.forEach(plugin => {
    editor = plugin(editor)
  })

  initializeContent(editor, { html, content })
  // 兼容了更多格式，normalizeContent 以不在适合于初始化 content
  // Content normalization is disabled to support more formats.
  // Note: This may result in non-normalized content (e.g., adjacent text nodes won't be merged).
  // TODO: Document specific formats that would break with normalization
  // DomEditor.normalizeContent(editor)

  if (selector) {
    // 传入了 selector ，则创建 textarea DOM
    const textarea = new TextArea(selector)

    EDITOR_TO_TEXTAREA.set(editor, textarea)
    TEXTAREA_TO_EDITOR.set(textarea, editor)
    textarea.changeViewState() // 初始化时触发一次，以便能初始化 textarea DOM 和 selection

    // 判断 textarea 最小高度，并给出提示
    promiseResolveThen(() => {
      const $scroll = textarea.$scroll

      if ($scroll == null) { return }
      if ($scroll.height() < MIN_TEXTAREA_HEIGHT) {
        console.warn(
          `${MESSAGES.heightWarning.zh}\n${MESSAGES.heightWarning.en}`,
          { element: $scroll, height: $scroll.height() },
        )
      }
    })

    // 创建 hoverbar DOM
    let hoverbar: HoverBar | null

    if (Object.keys(hoverbarKeys).length > 0) {
      hoverbar = new HoverBar()
      HOVER_BAR_TO_EDITOR.set(hoverbar, editor)
      EDITOR_TO_HOVER_BAR.set(editor, hoverbar)
    }

    // 隐藏 panel and modal
    editor.on(EditorEvents.CHANGE, () => {
      editor.hidePanelOrModal()
    })
    editor.on(EditorEvents.SCROLL, () => {
      editor.hidePanelOrModal()
    })
  } else {
    // 未传入 selector ，则遍历 content ，绑定一些 WeakMap 关系 （ NODE_TO_PARENT, NODE_TO_INDEX 等 ）
    editor.children.forEach((node, i) => bindNodeRelation(node, i, editor, editor))
  }

  // 触发生命周期
  const { onCreated, onDestroyed } = editorConfig

  if (onCreated) {
    editor.on(EditorEvents.CREATED, () => onCreated(editor))
  }
  if (onDestroyed) {
    editor.on(EditorEvents.DESTROYED, () => onDestroyed(editor))
  }

  // 创建完毕，异步触发 created
  promiseResolveThen(() => editor.emit(EditorEvents.CREATED))

  return editor
}
