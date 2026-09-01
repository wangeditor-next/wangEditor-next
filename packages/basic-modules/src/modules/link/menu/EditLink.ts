/**
 * @description update link menu
 * @author wangfupeng
 */

import {
  DomEditor,
  genModalButtonElems,
  genModalInputElems,
  IDomEditor,
  IModalMenu,
  t,
} from '@wangeditor-next/core'
import { Node } from 'slate'

import { PENCIL_SVG } from '../../../constants/icon-svg'
import $, { Dom7Array, DOMElement } from '../../../utils/dom'
import { genRandomStr } from '../../../utils/util'
import { LinkElement } from '../custom-types'
import { updateLink } from '../helper'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-update-link')
}

class EditLinkMenu implements IModalMenu {
  readonly title = t('link.edit')

  readonly iconSvg = PENCIL_SVG

  readonly tag = 'button'

  readonly showModal = true // 点击 button 时显示 modal

  readonly modalWidth = 300

  private $content: Dom7Array | null = null

  private textInputId = genDomID()

  private urlInputId = genDomID()

  private buttonId = genDomID()

  private getSelectedLinkElem(editor: IDomEditor): LinkElement | null {
    const node = DomEditor.getSelectedNodeByType(editor, 'link')

    if (node == null) { return null }
    return node as LinkElement
  }

  /**
   * 获取 node.url
   * @param editor editor
   */
  getValue(editor: IDomEditor): string | boolean {
    const linkElem = this.getSelectedLinkElem(editor)

    if (linkElem) {
      return linkElem.url || ''
    }
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  exec(_editor: IDomEditor, _value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
    // 此处空着即可
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const linkElem = this.getSelectedLinkElem(editor)

    // 未匹配到 link node 则禁用
    if (linkElem == null) { return true }
    return false
  }

  // modal 定位
  getModalPositionNode(editor: IDomEditor): Node | null {
    return DomEditor.getSelectedNodeByType(editor, 'link')
  }

  getModalContentElem(editor: IDomEditor): DOMElement {
    const { textInputId, urlInputId, buttonId } = this

    // 获取 input button elem
    const [textContainerElem, inputTextElem] = genModalInputElems(t('link.text'), textInputId)
    const $inputText = $(inputTextElem)
    const [urlContainerElem, inputUrlElem] = genModalInputElems(t('link.url'), urlInputId)
    const $inputUrl = $(inputUrlElem)
    const [buttonContainerElem] = genModalButtonElems(buttonId, t('common.ok'))

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()
        editor.restoreSelection() // 还原选区

        const text = $content.find(`#${textInputId}`).val()
        const url = $content.find(`#${urlInputId}`).val()

        updateLink(editor, text, url) // 修改链接

        editor.hidePanelOrModal() // 隐藏 modal
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content

    $content.empty() // 先清空内容

    // append inputs and button
    $content.append(textContainerElem)
    $content.append(urlContainerElem)
    $content.append(buttonContainerElem)

    // 设置 input val
    const linkElem = this.getSelectedLinkElem(editor)
    const text = linkElem ? Node.string(linkElem) : ''
    const url = this.getValue(editor)

    $inputText.val(text)
    $inputUrl.val(url)

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      $inputText.focus()
    })

    return $content[0]
  }
}

export default EditLinkMenu
