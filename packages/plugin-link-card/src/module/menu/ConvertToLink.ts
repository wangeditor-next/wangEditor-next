/**
 * @description convert link-card elem to link
 * @author wangfupeng
 */

import {
  DomEditor,
  IButtonMenu,
  IDomEditor,
  SlateEditor,
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

    const [linkCardEntry] = SlateEditor.nodes(editor, {
      at: editor.selection!,
      match: node => DomEditor.checkNodeType(node, 'link-card'),
      mode: 'lowest',
      universal: true,
    })

    if (linkCardEntry == null) {
      return
    }

    const linkCardPath = linkCardEntry[1]
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

    const [linkEntry] = SlateEditor.nodes(editor, {
      at: [],
      match: node => node === linkElem,
      mode: 'all',
      universal: true,
    })

    if (linkEntry != null) {
      const linkPath = linkEntry[1]

      SlateTransforms.select(editor, {
        anchor: SlateEditor.start(editor, linkPath),
        focus: SlateEditor.end(editor, linkPath),
      })
    }
  }
}

export default ConvertToLink
