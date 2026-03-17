/**
 * @description justify base menu
 * @author wangfupeng
 */

import { DomEditor, IButtonMenu, IDomEditor } from '@wangeditor-next/core'
import { Editor, Element } from 'slate'

abstract class BaseMenu implements IButtonMenu {
  abstract readonly title: string

  abstract readonly iconSvg: string

  readonly tag = 'button'

  getValue(_editor: IDomEditor): string | boolean {
    // 不需要 value
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 不需要 active
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const selectedElems = DomEditor.getSelectedElems(editor)
    const notMatch = selectedElems.some((elem: Element) => {
      const { type } = elem

      if (Editor.isVoid(editor, elem) && Editor.isBlock(editor, elem) && type !== 'video') { return true }

      if (['pre', 'code'].includes(type)) { return true }
      return false
    })

    if (notMatch) { return true }

    return false
  }

  abstract exec(editor: IDomEditor, value: string | boolean): void
}

export default BaseMenu
