/**
 * @description image width base class
 * @author wangfupeng
 */

import { DomEditor, IButtonMenu, IDomEditor } from '@wangeditor-next/core'
import { Node } from 'slate'

import { getImageResizePreset, updateImageSize } from '../resize'

abstract class ImageWidthBaseClass implements IButtonMenu {
  abstract readonly title: string // 菜单标题

  readonly tag = 'button'

  abstract readonly value: string // css width 的值

  getTitle(editor: IDomEditor): string {
    return getImageResizePreset(editor, this.value).label
  }

  getValue(_editor: IDomEditor): string | boolean {
    // 无需获取 val
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  private getSelectedNode(editor: IDomEditor): Node | null {
    return DomEditor.getSelectedNodeByType(editor, 'image')
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const imageNode = this.getSelectedNode(editor)

    if (imageNode == null) {
      // 选区未处于 image node ，则禁用
      return true
    }
    return false
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    const imageNode = this.getSelectedNode(editor)

    if (imageNode == null) { return }

    const preset = getImageResizePreset(editor, this.value)

    if (!updateImageSize(editor, imageNode, preset.value, '', 'preset')) { return }

    // 隐藏 hoverbar
    const hoverbar = DomEditor.getHoverbar(editor)

    if (hoverbar) { hoverbar.hideAndClean() }
  }
}

export default ImageWidthBaseClass
