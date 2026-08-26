/**
 * @description convert link-card elem to link
 * @author wangfupeng
 */

import {
  DomEditor,
  IButtonMenu,
  IDomEditor,
  SlateEditor,
  SlateNode,
  SlateTransforms,
  t,
} from '@wangeditor-next/editor'

import { LinkCardElement, LinkElement } from '../custom-types'

class ConvertToLink implements IButtonMenu {
  readonly title = t('linkCard.toLink')

  readonly iconSvg = ''

  readonly tag = 'button'

  private getSelectedLinkCardElem(editor: IDomEditor): LinkCardElement | null {
    const node = DomEditor.getSelectedNodeByType(editor, 'link-card')

    if (node == null) {
      return null
    }
    return node as LinkCardElement
  }

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    return editor.selection == null || this.getSelectedLinkCardElem(editor) == null
  }

  exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) {
      return
    }

    const linkCardElem = this.getSelectedLinkCardElem(editor)

    if (linkCardElem == null) {
      return
    }

    const linkCardPath = DomEditor.findPath(editor, linkCardElem)
    const { link: url, title, target } = linkCardElem
    const linkElem: LinkElement = {
      type: 'link',
      url,
      ...(target ? { target } : {}),
      children: [{ text: title || url }],
    }
    const paragraph = { type: 'paragraph', children: [linkElem] }

    SlateEditor.withoutNormalizing(editor, () => {
      SlateTransforms.removeNodes(editor, { at: linkCardPath })
      SlateTransforms.insertNodes(editor, paragraph, { at: linkCardPath })
    })

    SlateTransforms.select(editor, {
      anchor: { path: [...linkCardPath, 0, 0], offset: 0 },
      focus: { path: [...linkCardPath, 0, 0], offset: SlateNode.string(linkElem).length },
    })
  }
}

export default ConvertToLink
