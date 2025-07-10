/**
 * @description config interface
 * @author wangfupeng
 */

import { ImageElement } from 'packages/basic-modules/src/modules/image/custom-types'
import { VideoElement } from 'packages/video-module/src/module/custom-types'
import {
  Descendant, Node, NodeEntry, Range,
} from 'slate'

import { IDomEditor } from '../editor/interface'
import { IMenuGroup } from '../menus/interface'
import { IUploadConfig } from '../upload'
import { DOMElement } from '../utils/dom'

interface IHoverbarConf {
  // key 即 element type
  [key: string]: {
    match?: (editor: IDomEditor, n: Node) => boolean // 自定义匹配函数，优先级高于“key 即 element type”
    menuKeys: string[]
  }
}

export type AlertType = 'success' | 'info' | 'warning' | 'error'

/**
 * EditorEvents 包含所有编辑器的生命周期事件。
 *
 * @property {string} CREATED - 编辑器创建后触发，用于初始化操作。
 * @property {string} DESTROYED - 编辑器销毁时触发，用于清理操作。
 * @property {string} CHANGE - 编辑器内容发生变化时触发，通常用于监听输入或变动。
 * @property {string} SCROLL - 编辑器滚动时触发，用于同步滚动状态或执行相关操作。
 * @property {string} FULLSCREEN - 编辑器进入全屏时触发，通常用于调整布局或容器尺寸。
 * @property {string} UNFULLSCREEN - 编辑器退出全屏时触发，恢复原始布局状态。
 */
export const EditorEvents = {
  CREATED: 'created',
  DESTROYED: 'destroyed',
  CHANGE: 'change',
  SCROLL: 'scroll',
  FULLSCREEN: 'fullscreen',
  UNFULLSCREEN: 'unFullScreen',
} as const

export type EditorEventType = typeof EditorEvents[keyof typeof EditorEvents]

export interface ISingleMenuConfig {
  [key: string]: any;
  iconSvg?: string;
}

interface IColorConfig {
  colors: string[];
}

interface IFontSizeItem {
  name: string;
  value: string;
}

interface IFontSizeConfig {
  fontSizeList: (string | IFontSizeItem)[];
}

interface IFontFamilyItem {
  name: string;
  value: string;
}

interface IFontFamilyConfig {
  fontFamilyList: (string | IFontFamilyItem)[];
}

interface ILineHeightConfig {
  lineHeightList: string[];
}

interface IImageMenuBaseConfig {
    checkImage?: (src: string, alt: string, url: string) => boolean | undefined | string;
    parseImageSrc?: (src: string) => string;
}

interface IInsertImageConfig extends IImageMenuBaseConfig {
    onInsertedImage?: (imageNode: ImageElement | null) => void;
}

interface IEditImageConfig extends IImageMenuBaseConfig {
    onUpdatedImage?: (imageNode: ImageElement | null) => void;
}
interface IEmotionConfig {
  emotions: string[];
}

interface IInsertTableConfig {
  minWidth: number;
  tableHeader: {
    selected: boolean;
  };
  tableFullWidth: {
    selected: boolean;
  }
}

interface ILinkConfig {
  checkLink: (text:string, url:string)=> string | boolean | undefined
  parseLinkUrl: (url: string) => string
}

interface IInsertVideoConfig {
  onInsertedVideo: (videoNode: VideoElement) => NodeEntry | Range;
  checkVideo: (src:string, poster:string)=> string | boolean | undefined
  parseVideoSrc: (url: string) => string
}

export type IUploadVideoConfig = IUploadConfig

export type IUploadImageConfig = IUploadConfig & {
  // base64 限制（单位 kb） - 小于 xxx 就插入 base64 格式
  base64LimitSize: number
}

interface ICodeLangConfig {
  codeLangs: { text: string; value: string }[];
}

export interface IMenuConfig {
  bold: ISingleMenuConfig;
  underline: ISingleMenuConfig;
  italic: ISingleMenuConfig;
  through: ISingleMenuConfig;
  code: ISingleMenuConfig;
  sub: ISingleMenuConfig;
  sup: ISingleMenuConfig;
  clearStyle: ISingleMenuConfig;
  color: IColorConfig;
  bgColor: IColorConfig;
  fontSize: IFontSizeConfig;
  fontFamily: IFontFamilyConfig;
  indent: ISingleMenuConfig;
  delIndent: ISingleMenuConfig;
  justifyLeft: ISingleMenuConfig;
  justifyRight: ISingleMenuConfig;
  justifyCenter: ISingleMenuConfig;
  justifyJustify: ISingleMenuConfig;
  lineHeight: ILineHeightConfig;
  insertImage: IInsertImageConfig;
  deleteImage: ISingleMenuConfig;
  editImage: IEditImageConfig;
  viewImageLink: ISingleMenuConfig;
  imageWidth30: ISingleMenuConfig;
  imageWidth50: ISingleMenuConfig;
  imageWidth100: ISingleMenuConfig;
  editorImageSizeMenu: ISingleMenuConfig;
  divider: ISingleMenuConfig;
  emotion: IEmotionConfig;
  insertLink: ILinkConfig;
  editLink: ILinkConfig;
  unLink: ISingleMenuConfig;
  viewLink: ISingleMenuConfig;
  codeBlock: ISingleMenuConfig;
  blockquote: ISingleMenuConfig;
  headerSelect: ISingleMenuConfig;
  header1: ISingleMenuConfig;
  header2: ISingleMenuConfig;
  header3: ISingleMenuConfig;
  header4: ISingleMenuConfig;
  header5: ISingleMenuConfig;
  header6: ISingleMenuConfig;
  todo: ISingleMenuConfig;
  formatPainter: ISingleMenuConfig;
  redo: ISingleMenuConfig;
  undo: ISingleMenuConfig;
  fullScreen: ISingleMenuConfig;
  enter: ISingleMenuConfig;
  bulletedList: ISingleMenuConfig;
  numberedList: ISingleMenuConfig;
  insertTable: ISingleMenuConfig;
  deleteTable: ISingleMenuConfig;
  insertTableRow: IInsertTableConfig;
  deleteTableRow: ISingleMenuConfig;
  insertTableCol: ISingleMenuConfig;
  deleteTableCol: ISingleMenuConfig;
  tableHeader: ISingleMenuConfig;
  tableFullWidth: ISingleMenuConfig;
  mergeTableCell: ISingleMenuConfig;
  splitTableCell: ISingleMenuConfig;
  setTableProperty: ISingleMenuConfig;
  setTableCellProperty: ISingleMenuConfig;
  insertVideo: IInsertVideoConfig;
  uploadVideo: IUploadVideoConfig;
  editVideoSize: ISingleMenuConfig;
  editVideoSrc: ISingleMenuConfig;
  uploadImage: IUploadImageConfig;
  codeSelectLang: ICodeLangConfig;
}

/**
 * editor config
 */
export interface IEditorConfig {
  // 【注意】如增加 onXxx 回调函数时，要同步到 vue2/vue3 组件
  customAlert: (info: string, type: AlertType) => void

  onCreated?: (editor: IDomEditor) => void
  onChange?: (editor: IDomEditor) => void
  onDestroyed?: (editor: IDomEditor) => void

  onMaxLength?: (editor: IDomEditor) => void
  onFocus?: (editor: IDomEditor) => void
  onBlur?: (editor: IDomEditor) => void

  /**
   * 自定义粘贴。返回 true 则继续粘贴，返回 false 则自行实现粘贴，阻止默认粘贴
   */
  customPaste?: (editor: IDomEditor, e: ClipboardEvent) => boolean
    /**
   * 自定义复制。拦截 event 添加或修改 clipboardData 数据
   */
  customCopy?: (editor: IDomEditor, e: ClipboardEvent) => void

  // edit state
  scroll: boolean
  placeholder?: string
  readOnly: boolean
  autoFocus: boolean
  decorate?: (nodeEntry: NodeEntry) => Range[]
  maxLength?: number

  // 各个 menu 的配置汇总，可以通过 key 获取单个 menu 的配置
  MENU_CONF?: Partial<IMenuConfig>

  // 悬浮菜单栏 menu
  hoverbarKeys?: IHoverbarConf

  // 自由扩展其他配置
  EXTEND_CONF?: any

  // 跳过缓存的节点类型列表
  skipCacheTypes?: string[]
}

/**
 * toolbar config
 */
export interface IToolbarConfig {
  toolbarKeys: Array<string | IMenuGroup>
  insertKeys: { index: number; keys: string | Array<string | IMenuGroup> }
  excludeKeys: Array<string> // 排除哪些菜单
  modalAppendToBody: boolean // modal append 到 body ，而非 $textAreaContainer 内
}

type PluginFnType = <T extends IDomEditor>(editor: T) => T

export interface ICreateOption {
  selector: string | DOMElement
  config: Partial<IEditorConfig>
  content?: Descendant[]
  html?: string
  plugins: PluginFnType[]
}
