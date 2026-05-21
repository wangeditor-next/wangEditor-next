/**
 * @description preview image menu
 */

import {
  DomEditor, IButtonMenu, IDomEditor, t,
} from '@wangeditor-next/core'

import { EXTERNAL_SVG } from '../../../constants/icon-svg'
import { ImageElement } from '../custom-types'

class PreviewImage implements IButtonMenu {
  readonly title = t('image.preview')

  readonly iconSvg = EXTERNAL_SVG

  readonly tag = 'button'

  getValue(editor: IDomEditor): string | boolean {
    const imageNode = DomEditor.getSelectedNodeByType(editor, 'image')

    if (imageNode) {
      return (imageNode as ImageElement).src || ''
    }
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const src = this.getValue(editor)

    if (src) { return false }
    return true
  }

  exec(editor: IDomEditor, value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    if (!value || typeof value !== 'string') {
      throw new Error(`Preview image failed, image.src is '${value}'`)
    }

    window.open(value, '_blank')
  }
}

export default PreviewImage
