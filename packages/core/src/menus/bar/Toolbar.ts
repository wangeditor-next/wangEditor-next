/**
 * @description classic toolbar
 * @author wangfupeng
 */

import clonedeep from 'lodash.clonedeep'
import debounce from 'lodash.debounce'

import { EditorEvents, IInsertKeysConfig, IToolbarConfig } from '../../config/interface'
import { IDomEditor } from '../../editor/interface'
import { i18nListenLanguage } from '../../i18n'
import $, { Dom7Array, DOMElement } from '../../utils/dom'
import { promiseResolveThen } from '../../utils/util'
import { BAR_ITEM_TO_EDITOR, TOOLBAR_TO_EDITOR } from '../../utils/weak-maps'
import GroupButton from '../bar-item/GroupButton'
import { createBarItem, createBarItemGroup, IBarItem } from '../bar-item/index'
import { gen$barItemDivider } from '../helpers/helpers'
import {
  IButtonMenu, IDropPanelMenu, IMenuGroup, IModalMenu, ISelectMenu,
} from '../interface'
import { MENU_ITEM_FACTORIES } from '../register'

type MenuType = IButtonMenu | ISelectMenu | IDropPanelMenu | IModalMenu

class Toolbar {
  $box: Dom7Array

  private readonly $toolbar: Dom7Array = $('<div class="w-e-bar w-e-bar-show w-e-toolbar"></div>')

  private menus: { [key: string]: MenuType } = {}

  private toolbarItems: IBarItem[] = []

  private config: Partial<IToolbarConfig> = {}

  private lngListen: () => void = () => {}

  constructor(boxSelector: string | DOMElement, config: Partial<IToolbarConfig>) {
    this.config = config

    // @ts-ignore 初始化 DOM
    const $box = $(boxSelector)

    if ($box.length === 0) {
      throw new Error(`Cannot find toolbar DOM by selector '${boxSelector}'`)
    }
    this.$box = $box
    const $toolbar = this.$toolbar
    // @ts-ignore

    $toolbar.on('mousedown', e => e.preventDefault(), { passive: false }) // 防止点击失焦
    $box.append($toolbar)

    // 异步，否则拿不到 editor 实例
    promiseResolveThen(() => {
      // 首次初始化
      this.initToolbar()

      // 监听语言变更
      this.lngListen = i18nListenLanguage(() => this.initToolbar())

      // 监听 editor onchange
      const editor = this.getEditorInstance()

      editor.on(EditorEvents.CHANGE, this.changeToolbarState)
    })
  }

  getMenus() {
    return this.menus
  }

  getConfig() {
    return this.config
  }

  // 初始化工具栏
  private initToolbar() {
    // 清空menu缓存
    this.menus = {}
    // 清空elem
    const $toolbar = this.$toolbar

    $toolbar?.empty()

    // 注册 items
    this.registerItems()

    // 创建完，先模拟一次 onchange
    this.changeToolbarState()
  }

  // 注册 toolbarItems
  private registerItems() {
    let prevKey = ''
    const $toolbar = this.$toolbar
    const { toolbarKeys = [], insertKeys = { index: 0, keys: [] }, excludeKeys = [] } = this.config // 格式如 ['a', '|', 'b', 'c', '|', 'd']

    // 新插入菜单
    const toolbarKeysWithInsertedKeys = clonedeep(toolbarKeys)

    let insertKeysArr: IInsertKeysConfig[] = []

    if (!Array.isArray(insertKeys)) { /** 兼容旧版本，旧版本 insertKeys 是个对象 */
      insertKeysArr = [insertKeys as IInsertKeysConfig]
    } else {
      insertKeysArr = insertKeys
    }

    let cumulativeOffset = 0

    insertKeysArr.forEach(menu => {
      const adjustedIndex = menu.index + cumulativeOffset

      if (menu.replaceFn && toolbarKeysWithInsertedKeys[adjustedIndex]) {
        const callbackKeys: string | IMenuGroup = menu.replaceFn(toolbarKeysWithInsertedKeys[adjustedIndex])

        if (!callbackKeys) {
          throw new Error('This function needs to return the menu configuration：string | IMenuGroup')
        }
        toolbarKeysWithInsertedKeys[adjustedIndex] = callbackKeys
      }

      if (menu.keys.length > 0) {
        if (typeof menu.keys === 'string') { /** 之前的兼容逻辑 */
          menu.keys = [menu.keys]
        }

        menu.keys.forEach((k, i) => {
          toolbarKeysWithInsertedKeys.splice(adjustedIndex + i, 0, k)
        })
        cumulativeOffset += menu.keys.length
      }
    })

    // 排除某些菜单
    const filteredKeys = toolbarKeysWithInsertedKeys.filter(key => {
      const keyToCheck = typeof key === 'string' ? key : key.key

      return !excludeKeys.includes(keyToCheck)
    })
    const filteredKeysLength = filteredKeys.length

    // 开始注册菜单
    filteredKeys.forEach((key, index) => {
      if (key === '|') {
        // 第一个就是 `|` ，忽略
        if (index === 0) { return }

        // 最后一个是 `|` ，忽略
        if (index + 1 === filteredKeysLength) { return }

        // 多个紧挨着的 `|` ，只显示一个
        if (prevKey === '|') { return }

        // 分割线
        const $divider = gen$barItemDivider()

        $toolbar.append($divider)
        prevKey = key
        return
      }

      // 正常菜单
      if (typeof key === 'string') {
        this.registerSingleItem(key, this)
        prevKey = key
        return
      }

      // 菜单组
      this.registerGroup(key)
      prevKey = 'group'
    })
  }

  // 注册菜单组
  private registerGroup(menu: IMenuGroup) {
    const $toolbar = this.$toolbar
    const group = createBarItemGroup(menu)
    const { menuKeys = [] } = menu
    const { excludeKeys = [] } = this.config

    // 注册子菜单
    menuKeys.forEach(key => {
      if (excludeKeys.includes(key)) { return }
      this.registerSingleItem(
        key,
        group, // 将子菜单，添加到 group
      )
    })

    // 添加到 DOM
    $toolbar.append(group.$elem)
  }

  // 注册单个 toolbarItem
  private registerSingleItem(key: string, container: GroupButton | Toolbar) {
    const editor = this.getEditorInstance()
    const inGroup = container instanceof GroupButton // 要添加到 groupButton

    // 尝试从缓存中获取
    const { menus } = this
    let menu = menus[key]

    if (menu == null) {
      // 缓存中没有，则创建
      const factory = MENU_ITEM_FACTORIES[key]

      if (factory == null) {
        throw new Error(`Not found menu item factory by key '${key}'`)
      }
      if (typeof factory !== 'function') {
        throw new Error(`Menu item factory (key='${key}') is not a function`)
      }

      // 创建 toolbarItem 并记录缓存
      menu = factory()
      menus[key] = menu
    } else {
      console.warn(`Duplicated toolbar menu key '${key}'\n重复注册了菜单栏 menu '${key}'`)
    }

    // 替换 icon svg
    const menuConf = editor.getMenuConfig(key)

    if (menuConf && menuConf.iconSvg !== undefined) {
      menu.iconSvg = menuConf.iconSvg
    }

    const toolbarItem = createBarItem(key, menu, inGroup)

    this.toolbarItems.push(toolbarItem)

    // 保存 toolbarItem 和 editor 的关系
    BAR_ITEM_TO_EDITOR.set(toolbarItem, editor)

    // 添加 DOM
    if (inGroup) {
      // barItem 是 groupButton
      const group = container as GroupButton

      group.appendBarItem(toolbarItem)
    } else {
      // barItem 添加到 toolbar
      const toolbar = container as Toolbar

      toolbar.$toolbar.append(toolbarItem.$elem)
    }
  }

  private getEditorInstance(): IDomEditor {
    const editor = TOOLBAR_TO_EDITOR.get(this)

    if (editor == null) { throw new Error('Can not get editor instance') }
    return editor
  }

  /**
   * editor onChange 时触发（涉及 DOM 操作，加防抖）
   */
  changeToolbarState = debounce(() => {
    this.toolbarItems.forEach(toolbarItem => {
      toolbarItem.changeMenuState()
    })
  }, 200)

  /**
   * 销毁 toolbar
   */
  destroy() {
    // 销毁 DOM
    this.$toolbar.remove()

    // 销毁语言监听
    this.lngListen?.()

    // 清空属性
    this.menus = {}
    this.toolbarItems = []
  }
}

export default Toolbar
