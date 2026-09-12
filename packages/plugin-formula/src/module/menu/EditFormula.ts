/**
 * @description edit formula menu
 * @author wangfupeng
 */

import {
  genModalButtonElems,
  genModalTextareaElems,
  IDomEditor,
  IModalMenu,
  SlateEditor,
  SlateElement,
  SlateNode,
  SlatePath,
  SlateRange,
  SlateTransforms,
  t,
} from '@wangeditor-next/editor'

import { PENCIL_SVG } from '../../constants/icon-svg'
import $, { Dom7Array, DOMElement } from '../../utils/dom'
import { genRandomStr } from '../../utils/util'
import { FormulaElement } from '../custom-types'

/**
 * 生成唯一的 DOM ID
 */
function genDomID(): string {
  return genRandomStr('w-e-insert-formula')
}

class EditFormulaMenu implements IModalMenu {
  readonly title = t('formula.edit')

  readonly iconSvg = PENCIL_SVG

  readonly tag = 'button'

  readonly showModal = true // 点击 button 时显示 modal

  readonly modalWidth = 300

  private $content: Dom7Array | null = null

  private readonly textareaId = genDomID()

  private readonly buttonId = genDomID()

  private getSelectedElem(editor: IDomEditor): FormulaElement | null {
    const entry = this.getSelectedFormulaEntry(editor)

    if (entry == null) { return null }
    return entry[0]
  }

  private getSelectedFormulaEntry(editor: IDomEditor): [FormulaElement, SlatePath] | null {
    const { selection } = editor

    if (selection == null) { return null }

    const entry = SlateEditor.above(editor, {
      at: selection,
      match: node => SlateElement.isElement(node) && node.type === 'formula',
    })

    if (entry == null) { return null }
    return entry as [FormulaElement, SlatePath]
  }

  /**
   * 获取公式 value
   * @param editor editor
   */
  getValue(editor: IDomEditor): string | boolean {
    const formulaElem = this.getSelectedElem(editor)

    if (formulaElem) {
      return formulaElem.value || ''
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
    const { selection } = editor

    if (selection == null) { return true }
    if (SlateRange.isExpanded(selection)) { return true } // 选区非折叠，禁用

    // 未匹配到 formula node 则禁用
    const formulaElem = this.getSelectedElem(editor)

    if (formulaElem == null) { return true }

    return false
  }

  // modal 定位
  getModalPositionNode(editor: IDomEditor): SlateNode | null {
    return this.getSelectedElem(editor)
  }

  getModalContentElem(editor: IDomEditor): DOMElement {
    const { textareaId, buttonId } = this

    const [textareaContainerElem, textareaElem] = genModalTextareaElems(
      t('formula.formula'),
      textareaId,
      t('formula.placeholder'),
    )
    const $textarea = $(textareaElem)
    const [buttonContainerElem] = genModalButtonElems(buttonId, t('formula.ok'))

    if (this.$content == null) {
      // 第一次渲染
      const $content = $('<div></div>')

      // 绑定事件（第一次渲染时绑定，不要重复绑定）
      $content.on('click', `#${buttonId}`, e => {
        e.preventDefault()
        const value = $content.find(`#${textareaId}`).val().trim()

        this.updateFormula(editor, value)
        editor.hidePanelOrModal() // 隐藏 modal
      })

      // 记录属性，重要
      this.$content = $content
    }

    const $content = this.$content

    $content.html('') // 先清空内容

    // append textarea and button
    $content.append(textareaContainerElem)
    $content.append(buttonContainerElem)

    // 设置 input val
    const value = this.getValue(editor)

    $textarea.val(value)

    // focus 一个 input（异步，此时 DOM 尚未渲染）
    setTimeout(() => {
      $textarea.focus()
    })

    return $content[0]
  }

  private updateFormula(editor: IDomEditor, value: string) {
    if (!value) { return }

    // 还原选区
    editor.restoreSelection()

    if (this.isDisabled(editor)) { return }

    const selectedEntry = this.getSelectedFormulaEntry(editor)

    if (selectedEntry == null) { return }

    const [, path] = selectedEntry
    const props: Partial<FormulaElement> = { value }

    SlateTransforms.setNodes(editor, props, { at: path })
  }
}

export default EditFormulaMenu
