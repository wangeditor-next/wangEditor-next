/**
 * @description lightweight editor entry
 * @author cycleccc
 */

import './assets/index.less'
// 兼容性（要放在最开始就执行）
import './utils/browser-polyfill'
import './utils/node-polyfill'
// 配置多语言
import './locale/index'

import type {
  IDomEditor,
  IEditorConfig,
  IModuleConf,
  IToolbarConfig,
  Toolbar,
} from '@wangeditor-next/core'

// 全局注册
import Boot from './Boot'
import type { ICreateEditorOption, ICreateToolbarOption } from './create'
import { createEditor as rawCreateEditor, createToolbar as rawCreateToolbar } from './create'

export { Boot }

export interface IEditorExtension {
  key?: string
  module: Partial<IModuleConf>
}

export type EditorExtension = Partial<IModuleConf> | IEditorExtension

export interface ICreateEditorFactoryOption {
  extensions?: EditorExtension[]
  editorConfig?: Partial<IEditorConfig>
  toolbarConfig?: Partial<IToolbarConfig>
}

export type ICreateToolbarWithEditorOption = Omit<ICreateToolbarOption, 'editor'>

export interface ICreateWithFactoryOption {
  editor?: Partial<ICreateEditorOption>
  toolbar?: ICreateToolbarWithEditorOption
}

export interface IEditorFactory {
  create: (option?: ICreateWithFactoryOption) => {
    editor: IDomEditor
    toolbar: Toolbar | null
  }
  createEditor: (option?: Partial<ICreateEditorOption>) => IDomEditor
  createToolbar: (option: ICreateToolbarOption) => Toolbar
  registerExtensions: (extensions: EditorExtension[]) => void
}

const REGISTERED_EXTENSION_KEYS = new Set<string>()
const REGISTERED_EXTENSION_MODULES = new WeakSet<object>()

function isEditorExtensionObject(extension: EditorExtension): extension is IEditorExtension {
  return typeof extension === 'object' && extension !== null && 'module' in extension
}

function normalizeExtension(extension: EditorExtension): IEditorExtension {
  if (isEditorExtensionObject(extension)) {
    return extension
  }

  return { module: extension }
}

function mergeHoverbarKeys(
  baseConfig: Partial<IEditorConfig>,
  runtimeConfig: Partial<IEditorConfig> = {},
): Partial<IEditorConfig> {
  return {
    ...baseConfig,
    ...runtimeConfig,
    hoverbarKeys: {
      ...(baseConfig.hoverbarKeys || {}),
      ...(runtimeConfig.hoverbarKeys || {}),
    },
  }
}

function registerExtension(extension: EditorExtension) {
  const { key, module } = normalizeExtension(extension)

  if (key && REGISTERED_EXTENSION_KEYS.has(key)) { return }
  if (module == null || typeof module !== 'object') {
    throw new Error('Invalid extension module. Expect an object that follows IModuleConf.')
  }
  if (REGISTERED_EXTENSION_MODULES.has(module as object)) { return }

  Boot.registerModule(module)

  if (key) {
    REGISTERED_EXTENSION_KEYS.add(key)
  }
  REGISTERED_EXTENSION_MODULES.add(module as object)
}

/**
 * Register extensions (modules) once.
 * Similar to tiptap's extensions list, this helper avoids duplicate registration
 * when the same module reference (or explicit extension key) is reused.
 */
export function registerExtensions(extensions: EditorExtension[] = []) {
  extensions.forEach(extension => registerExtension(extension))
}

/**
 * Create a reusable factory for on-demand composition, close to tiptap's setup style.
 */
export function createEditorFactory(option: ICreateEditorFactoryOption = {}): IEditorFactory {
  const {
    extensions = [],
    editorConfig = {},
    toolbarConfig = {},
  } = option

  registerExtensions(extensions)

  const createEditor = (editorOption: Partial<ICreateEditorOption> = {}) => {
    const mergedConfig = mergeHoverbarKeys(editorConfig, editorOption.config || {})

    return rawCreateEditor({
      ...editorOption,
      config: mergedConfig,
    })
  }

  const createToolbar = (toolbarOption: ICreateToolbarOption) => rawCreateToolbar({
    ...toolbarOption,
    config: {
      ...toolbarConfig,
      ...(toolbarOption.config || {}),
    },
  })

  const create = (createOption: ICreateWithFactoryOption = {}) => {
    const { editor: editorOption = {}, toolbar: toolbarOption } = createOption
    const editor = createEditor(editorOption)
    const toolbar = toolbarOption
      ? createToolbar({
        ...toolbarOption,
        editor,
      })
      : null

    return { editor, toolbar }
  }

  return {
    create,
    createEditor,
    createToolbar,
    registerExtensions,
  }
}

export { rawCreateEditor as createEditor, rawCreateToolbar as createToolbar }

// 导出 core API 和接口（注意，此处按需导出，不可直接用 `*` ）
export type {
  ClassStylePolicy,
  IButtonMenu,
  IClassStyleUnsupportedPayload,
  IDomEditor,
  IDropPanelMenu,
  IEditorConfig,
  IModalMenu,
  IModuleConf,
  IOption,
  ISelectMenu,
  IToolbarConfig,
  StyleClassTokenType,
  TextStyleMode,
} from '@wangeditor-next/core'
export {
  DomEditor,
  genModalButtonElems,
  genModalInputElems,
  // 第三方模块 - modal 中用到的 API
  genModalTextareaElems,
  getClassStylePolicy,
  getTextStyleMode,
  i18nAddResources,
  // 第三方模块 - 多语言
  i18nChangeLanguage,
  i18nGetResources,
  reportUnsupportedClassStyle,
  t,
  Toolbar,
} from '@wangeditor-next/core'

// 导出 slate API 和接口 （需重命名，加 `Slate` 前缀）
export type {
  Descendant as SlateDescendant,
  Location as SlateLocation,
} from 'slate'
export {
  Editor as SlateEditor,
  Element as SlateElement,
  Node as SlateNode,
  Path as SlatePath,
  Point as SlatePoint,
  Range as SlateRange,
  Text as SlateText,
  Transforms as SlateTransforms,
} from 'slate'

export default {}
