/**
 * @description edit html source menu
 */

import {
  genModalButtonElems,
  genModalTextareaElems,
  IDomEditor,
  IModalMenu,
  SlateNode,
  t,
} from '@wangeditor-next/editor'

import { HTML_SOURCE_SVG } from '../../constants/icon-svg'
import { formatHtml } from '../helper'

let domIdSeed = 0

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  domIdSeed += 1
  return `w-e-html-source-${domIdSeed}`
}

class EditHtmlSourceMenu implements IModalMenu {
  readonly title = t('htmlSource.title')

  readonly iconSvg = HTML_SOURCE_SVG

  readonly tag = 'button'

  readonly showModal = true // 点击 button 时显示 modal

  readonly modalWidth = 480

  private readonly textareaId = genDomID()

  private readonly buttonId = genDomID()

  // 打开 modal 时展示的 html ，用于判断内容是否被修改
  private sourceHtml = ''

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    return false
  }

  exec(_editor: IDomEditor, _value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
  }

  isDisabled(_editor: IDomEditor): boolean {
    // 未选中或只读时，由 toolbar 统一禁用
    return false
  }

  getModalPositionNode(_editor: IDomEditor): SlateNode | null {
    return null // modal 依据选区定位
  }

  getModalContentElem(editor: IDomEditor): Element {
    const { textareaId, buttonId } = this

    const [textareaContainerElem, textareaElem] = genModalTextareaElems(
      t('htmlSource.source'),
      textareaId,
    )
    const [buttonContainerElem, buttonElem] = genModalButtonElems(buttonId, t('htmlSource.ok'))
    const textarea = textareaElem as HTMLTextAreaElement

    textarea.spellcheck = false
    textarea.style.minHeight = '240px'
    textarea.style.fontFamily = 'monospace'

    this.sourceHtml = formatHtml(editor.getHtml())
    textarea.value = this.sourceHtml

    buttonElem.addEventListener('click', e => {
      e.preventDefault()
      this.applyHtml(editor, textarea.value)
      editor.hidePanelOrModal() // 隐藏 modal
    })

    const content = document.createElement('div')

    content.appendChild(textareaContainerElem)
    content.appendChild(buttonContainerElem)

    // focus textarea（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      textarea.focus()
    })

    return content
  }

  private applyHtml(editor: IDomEditor, value: string) {
    if (editor.isDisabled()) { return }

    // 未修改则不重新设置内容，避免产生无意义的 change 和历史记录
    if (value === this.sourceHtml) {
      editor.restoreSelection()
      return
    }

    // setHtml 只把以 `<` 开头的内容当作 html 解析，去掉首尾空白
    editor.setHtml(value.trim())
    editor.focus(true)
  }
}

export default EditHtmlSourceMenu
