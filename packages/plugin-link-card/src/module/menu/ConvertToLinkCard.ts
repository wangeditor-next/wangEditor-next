/**
 * @description convert link elem to link-card
 * @author wangfupeng
 */

import {
  DomEditor,
  IButtonMenu, IDomEditor,
  SlateEditor,
  SlateNode,
  SlateTransforms,
  t,
} from '@wangeditor-next/editor'

import { LinkCardElement, LinkElement } from '../custom-types'

class ConvertToLinkCard implements IButtonMenu {
  readonly title = t('linkCard.toCard')

  readonly iconSvg = '' // 无 icon

  readonly tag = 'button'

  private getSelectedLinkElem(editor: IDomEditor): LinkElement | null {
    const node = DomEditor.getSelectedNodeByType(editor, 'link')

    if (node == null) { return null }
    return node as LinkElement
  }

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    // 无需 active
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) { return true }

    const linkElem = this.getSelectedLinkElem(editor)

    if (linkElem == null) {
      // 选区未处于 link node ，则禁用
      return true
    }
    return false
  }

  async exec(editor: IDomEditor, _value: string | boolean) {
    if (this.isDisabled(editor)) { return }

    const linkElem = this.getSelectedLinkElem(editor)

    if (linkElem == null) { return }

    const { getLinkCardInfo } = editor.getMenuConfig('convertToLinkCard')

    if (typeof getLinkCardInfo !== 'function') { return }

    const { url, target } = linkElem
    const text = SlateNode.string(linkElem)
    const [linkEntry] = SlateEditor.nodes(editor, {
      at: editor.selection!,
      match: node => DomEditor.checkNodeType(node, 'link'),
      mode: 'lowest',
      universal: true,
    })

    if (linkEntry == null) {
      return
    }

    const linkPathRef = SlateEditor.pathRef(editor, linkEntry[1])

    try {
      const { title, iconImgSrc } = await getLinkCardInfo(text, url) // 异步生成 link-card 信息
      const linkPath = linkPathRef.current

      if (linkPath == null) { return }

      SlateTransforms.removeNodes(editor, { at: linkPath })
      SlateTransforms.splitNodes(editor, { always: true })

      const linkCard: LinkCardElement = {
        type: 'link-card',
        link: url,
        title,
        ...(target ? { target } : {}),
        iconImgSrc,
        children: [{ text: '' }],
      }

      SlateTransforms.insertNodes(editor, linkCard)
    } catch (err) {
      console.error('Convert to link-cart error', err)
    } finally {
      linkPathRef.unref()
    }
  }
}

export default ConvertToLinkCard
