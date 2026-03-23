/**
 * @description text-area class
 * @author wangfupeng
 */

import forEach from 'lodash.foreach'
import throttle from 'lodash.throttle'
import { Range } from 'slate'

import { EditorEvents } from '../config/interface'
import { DomEditor } from '../editor/dom-editor'
import { IDomEditor } from '../editor/interface'
import $, {
  Dom7Array, DOMElement, isDOMElement,
} from '../utils/dom'
import { promiseResolveThen } from '../utils/util'
import { TEXTAREA_TO_EDITOR } from '../utils/weak-maps'
import eventHandlerConf from './event-handlers/index'
import { handlePlaceholder } from './place-holder'
import { DOMSelectionToEditor, editorSelectionToDOM } from './syncSelection'
import updateView from './update-view'

let ID = 1

class TextArea {
  private selectionChangeRoot: Document | ShadowRoot | null = null

  private destroyed = false

  // eslint-disable-next-line
  readonly id = ID++

  $box: Dom7Array

  $textAreaContainer: Dom7Array

  $scroll: Dom7Array

  $textArea: Dom7Array | null = null

  private readonly $progressBar = $('<div class="w-e-progress-bar"></div>')

  private readonly $maxLengthInfo = $('<div class="w-e-max-length-info"></div>')

  isComposing: boolean = false

  isUpdatingSelection: boolean = false

  isDraggingInternally: boolean = false

  latestElement: DOMElement | null = null

  showPlaceholder = false

  $placeholder: Dom7Array | null = null

  private latestEditorSelection: Range | null = null

  constructor(boxSelector: string | DOMElement) {
    // @ts-ignore 初始化 dom
    const $box = $(boxSelector)

    if ($box.length === 0) {
      throw new Error(`Cannot find textarea DOM by selector '${boxSelector}'`)
    }
    this.$box = $box
    const $container = $('<div class="w-e-text-container"></div>')

    $container.append(this.$progressBar) // 进度条
    $container.append(this.$maxLengthInfo) // max length 提示信息
    $box.append($container)
    const $scroll = $('<div class="w-e-scroll"></div>')

    $container.append($scroll)
    this.$scroll = $scroll
    this.$textAreaContainer = $container

    // 异步，否则获取不到 editor 和 DOM
    promiseResolveThen(() => {
      const editor = this.getActiveEditor()

      if (editor == null) { return }

      this.bindSelectionChange(editor)

      // 点击编辑区域，关闭 panel
      $container.on('click', () => editor.hidePanelOrModal())

      // editor onchange 时更新视图
      editor.on(EditorEvents.CHANGE, this.changeViewState.bind(this))

      // editor onchange 时触发用户配置的 onChange （需要在 changeViewState 后执行）
      const { onChange, scroll } = editor.getConfig()

      if (onChange) {
        editor.on(EditorEvents.CHANGE, () => onChange(editor))
      }
      // scroll: false时，容器height: 100%不生效，样式设置，避免悬浮框位置出现错位问题
      if (!scroll) {
        $box.css('position', 'relative')
        $container.addClass('no-scroll')
      }

      // 监听 onfocus onblur
      this.onFocusAndOnBlur()

      // 实时修改 maxLength 提示信息
      editor.on(EditorEvents.CHANGE, this.changeMaxLengthInfo.bind(this))

      // 绑定 DOM 事件
      this.bindEvent()
    })
  }

  private get editorInstance(): IDomEditor {
    const editor = TEXTAREA_TO_EDITOR.get(this)

    if (editor == null) { throw new Error('Can not get editor instance') }
    return editor
  }

  private getActiveEditor(): IDomEditor | null {
    if (this.destroyed) { return null }

    const editor = TEXTAREA_TO_EDITOR.get(this)

    if (editor == null || editor.isDestroyed) { return null }
    return editor
  }

  private bindSelectionChange(editor: IDomEditor, retries = 5) {
    if (this.selectionChangeRoot != null || editor.isDestroyed) { return }

    try {
      const root = DomEditor.findDocumentOrShadowRoot(editor)

      root.addEventListener('selectionchange', this.onDOMSelectionChange)
      this.selectionChangeRoot = root
    } catch (ex) {
      if (retries > 0) {
        setTimeout(() => this.bindSelectionChange(editor, retries - 1), 0)
        return
      }

      window.document.addEventListener('selectionchange', this.onDOMSelectionChange)
      this.selectionChangeRoot = window.document
    }

    editor.on(EditorEvents.DESTROYED, () => {
      this.selectionChangeRoot?.removeEventListener('selectionchange', this.onDOMSelectionChange)
      this.selectionChangeRoot = null
    })
  }

  private onDOMSelectionChange = throttle((event?: Event) => {
    const targetElement = isDOMElement(event?.target) ? event.target : null
    const targetTagName = targetElement?.tagName

    if (targetTagName === 'INPUT' || targetTagName === 'TEXTAREA') { return }

    const editor = this.getActiveEditor()

    if (editor == null) { return }

    DOMSelectionToEditor(this, editor)
  }, 100)

  flushDOMSelectionChange() {
    this.onDOMSelectionChange.flush()
  }

  /**
   * 绑定事件，如 beforeinput onblur onfocus keydown click copy/paste drag/drop 等
   */
  private bindEvent() {
    const { $textArea, $scroll } = this
    const editor = this.editorInstance

    if ($textArea == null) { return }

    // 遍历所有事件类型，绑定
    forEach(eventHandlerConf, (fn, eventType) => {
      $textArea.on(eventType, event => {
        fn(event, this, editor)
      })
    })

    // 设置 scroll
    const { scroll } = editor.getConfig()

    if (scroll) {
      $scroll.css('overflow-y', 'auto')
      // scroll 自定义事件
      $scroll.on(
        'scroll',
        throttle(() => {
          editor.emit(EditorEvents.SCROLL)
        }, 100),
      )
    }
  }

  private onFocusAndOnBlur() {
    const editor = this.getActiveEditor()

    if (editor == null) { return }

    const { onBlur, onFocus } = editor.getConfig()

    this.latestEditorSelection = editor.selection

    editor.on(EditorEvents.CHANGE, () => {
      if (this.latestEditorSelection == null && editor.selection != null) {
        // 异步触发 focus
        setTimeout(() => {
          if (this.destroyed || editor.isDestroyed) { return }
          if (onFocus) { onFocus(editor) }
        })
      } else if (this.latestEditorSelection != null && editor.selection == null) {
        // 异步触发 blur
        setTimeout(() => {
          if (this.destroyed || editor.isDestroyed) { return }
          if (onBlur) { onBlur(editor) }
        })
      }

      this.latestEditorSelection = editor.selection // 重新记录 selection
    })
  }

  /**
   * 修改 maxLength 提示信息
   */
  private changeMaxLengthInfo() {
    const editor = this.getActiveEditor()

    if (editor == null) { return }

    const { maxLength } = editor.getConfig()

    if (maxLength) {
      const leftLength = DomEditor.getLeftLengthOfMaxLength(editor)
      const curLength = maxLength - leftLength

      this.$maxLengthInfo[0].innerHTML = `${curLength}/${maxLength}`
    }
  }

  /**
   * 修改进度条
   * @param progress 进度
   */
  changeProgress(progress: number) {
    const $progressBar = this.$progressBar

    $progressBar.css('width', `${progress}%`)

    // 进度 100% 之后，定时隐藏
    if (progress >= 100) {
      setTimeout(() => {
        $progressBar.hide()
        $progressBar.css('width', '0')
        $progressBar.show()
      }, 1000)
    }
  }

  /**
   * 修改 view 状态
   */
  changeViewState() {
    const editor = this.getActiveEditor()

    if (editor == null) { return }

    // 更新 DOM
    // TODO 注意这里是否会有性能瓶颈？因为每次键盘输入，都会触发这里 —— 可单独测试大文件、多内容，如几万个字
    updateView(this, editor)

    // 处理 placeholder
    handlePlaceholder(this, editor)

    // 同步选区（异步，否则拿不到 DOM 渲染结果，vdom）
    promiseResolveThen(() => {
      if (this.destroyed || editor.isDestroyed) { return }
      editorSelectionToDOM(this, editor)
    })
  }

  /**
   * 销毁 textarea
   */
  destroy() {
    this.destroyed = true
    this.onDOMSelectionChange.cancel()
    this.selectionChangeRoot?.removeEventListener('selectionchange', this.onDOMSelectionChange)
    this.selectionChangeRoot = null

    // 销毁 DOM （只销毁最外层 DOM 即可）
    this.$textAreaContainer.remove()
  }
}

export default TextArea
