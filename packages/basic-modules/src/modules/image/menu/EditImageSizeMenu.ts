/**
 * @description 修改图片尺寸
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
import { Node as SlateNode } from 'slate'

import $, { Dom7Array, DOMElement } from '../../../utils/dom'
import { genRandomStr } from '../../../utils/util'
import { ImageElement } from '../custom-types'
import { updateImageSize } from '../resize'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-insert-image')
}

class EditorImageSizeMenu implements IModalMenu {
  readonly title = t('image.editSize')

  readonly tag = 'button'

  readonly showModal = true // 点击 button 时显示 modal

  readonly modalWidth = 320

  private $content: Dom7Array | null = null

  private readonly widthInputId = genDomID()

  private readonly heightInputId = genDomID()

  private readonly buttonId = genDomID()

  private getSelectedImageNode(editor: IDomEditor): SlateNode | null {
    return DomEditor.getSelectedNodeByType(editor, 'image')
  }

  getValue(_editor: IDomEditor): string | boolean {
    // 插入菜单，不需要 value
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 任何时候，都不用激活 menu
    return false
  }

  exec(_editor: IDomEditor, _value: string | boolean) {
    // 点击菜单时，弹出 modal 之前，不需要执行其他代码
    // 此处空着即可
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const imageNode = this.getSelectedImageNode(editor)

    if (imageNode == null) {
      // 选区未处于 image node ，则禁用
      return true
    }
    return false
  }

  getModalPositionNode(editor: IDomEditor): SlateNode | null {
    return this.getSelectedImageNode(editor)
  }

  getModalContentElem(editor: IDomEditor): DOMElement {
    // return $('<div><p>修改尺寸</p><p>修改尺寸</p><p>修改尺寸</p><p>修改尺寸</p></div>')[0]

    const { widthInputId, heightInputId, buttonId } = this

    const [widthContainerElem, inputWidthElem] = genModalInputElems(
      t('image.width'),
      widthInputId,
      'auto',
    )
    const $inputWidth = $(inputWidthElem)
    const [heightContainerElem, inputHeightElem] = genModalInputElems(
      t('image.height'),
      heightInputId,
      'auto',
    )
    const $inputHeight = $(inputHeightElem)
    const [buttonContainerElem] = genModalButtonElems(buttonId, t('image.ok'))

    const imageNode = this.getSelectedImageNode(editor) as ImageElement

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()

        const rawWidth = $content.find(`#${widthInputId}`).val().trim()
        const rawHeight = $content.find(`#${heightInputId}`).val().trim()

        editor.restoreSelection()
        if (!updateImageSize(editor, imageNode, rawWidth, rawHeight, 'modal')) { return }
        editor.hidePanelOrModal() // 隐藏 modal
      })

      this.$content = $content
    }

    const $content = this.$content

    // 先清空，再重新添加 DOM 内容
    $content.empty()
    $content.append(widthContainerElem)
    $content.append(heightContainerElem)
    $content.append(buttonContainerElem)

    if (imageNode == null) { return $content[0] }

    // 初始化 input 值
    const { style = {} } = imageNode
    const { width = 'auto', height = 'auto' } = style

    $inputWidth.val(width)
    $inputHeight.val(height)
    setTimeout(() => {
      $inputWidth.focus()
    })

    return $content[0]
  }
}

export default EditorImageSizeMenu
