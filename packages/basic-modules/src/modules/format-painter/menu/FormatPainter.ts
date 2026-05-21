/**
 * @description Format Painter
 * @author CodePencil
 */

import { IButtonMenu, IDomEditor, t } from '@wangeditor-next/core'
import {
  Editor, Element, Path, Text, Transforms,
} from 'slate'

import { FORMAT_PAINTER } from '../../../constants/icon-svg'
import { clearAllMarks } from '../helper'

type BlockTypeForFormatPainter = 'header1'
| 'header2'
| 'header3'
| 'header4'
| 'header5'
| 'header6'
| 'blockquote'
| 'list-item'
| 'todo'

type OrderedListTypeForFormatPainter = '1' | 'a' | 'A' | 'i' | 'I'
type TargetBlockTypeForFormatPainter = BlockTypeForFormatPainter | 'paragraph'

interface BlockStyleForFormatPainter {
  type: BlockTypeForFormatPainter
  ordered?: boolean
  orderType?: OrderedListTypeForFormatPainter
}

interface FormatPaintAttributes {
  isSelect: boolean
  formatStyle: Omit<Text, 'text'> | null
  formatBlockStyle: BlockStyleForFormatPainter | null
}

class FormatPainter implements IButtonMenu {
  title = t('formatPainter.title')

  iconSvg = FORMAT_PAINTER

  tag = 'button'

  static attrs: FormatPaintAttributes = {
    isSelect: false,
    formatStyle: null,
    formatBlockStyle: null,
  }

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    return FormatPainter.attrs.isSelect
  }

  isDisabled(_editor: IDomEditor): boolean {
    return false
  }

  private isSourceBlockType(type: string): type is BlockTypeForFormatPainter {
    return type === 'blockquote'
      || type === 'header1'
      || type === 'header2'
      || type === 'header3'
      || type === 'header4'
      || type === 'header5'
      || type === 'header6'
      || type === 'list-item'
      || type === 'todo'
  }

  private isTargetBlockType(type: string): type is TargetBlockTypeForFormatPainter {
    return type === 'paragraph' || this.isSourceBlockType(type)
  }

  private getTopLevelSelectedBlocks(editor: IDomEditor, checkType: (type: string) => boolean): Path[] {
    return Array.from(Editor.nodes(editor, {
      at: editor.selection || undefined,
      match: node => Element.isElement(node),
    }))
      .filter(([node, path]) => path.length === 1 && checkType(node.type))
      .map(([, path]) => path)
  }

  private normalizeListOrderType(orderType: unknown): OrderedListTypeForFormatPainter | undefined {
    if (orderType === 'a'
      || orderType === 'A'
      || orderType === 'i'
      || orderType === 'I') {
      return orderType
    }

    if (orderType === '1') { return '1' }
    return undefined
  }

  private getSelectedBlockStyle(editor: IDomEditor): BlockStyleForFormatPainter | null {
    const topLevelPaths = this.getTopLevelSelectedBlocks(editor, type => this.isSourceBlockType(type))
    const [firstPath] = topLevelPaths

    if (!firstPath) { return null }

    const [selectedBlock] = Editor.node(editor, firstPath)

    if (!Element.isElement(selectedBlock)) { return null }

    if (!this.isSourceBlockType(selectedBlock.type)) { return null }

    if (selectedBlock.type === 'blockquote'
      || selectedBlock.type === 'header1'
      || selectedBlock.type === 'header2'
      || selectedBlock.type === 'header3'
      || selectedBlock.type === 'header4'
      || selectedBlock.type === 'header5'
      || selectedBlock.type === 'header6'
      || selectedBlock.type === 'todo') {
      return { type: selectedBlock.type }
    }

    if (selectedBlock.type === 'list-item') {
      const ordered = 'ordered' in selectedBlock ? !!selectedBlock.ordered : false
      const orderType = 'orderType' in selectedBlock
        ? this.normalizeListOrderType(selectedBlock.orderType)
        : undefined

      return {
        type: 'list-item',
        ordered,
        orderType,
      }
    }

    return null
  }

  private unsetListAttrs(editor: IDomEditor, path: Path) {
    Transforms.unsetNodes(editor, 'ordered', { at: path })
    Transforms.unsetNodes(editor, 'level', { at: path })
    Transforms.unsetNodes(editor, 'start', { at: path })
    Transforms.unsetNodes(editor, 'orderType', { at: path })
  }

  private applyBlockStyle(editor: IDomEditor, blockStyle: BlockStyleForFormatPainter) {
    const blockPaths = this.getTopLevelSelectedBlocks(editor, type => this.isTargetBlockType(type))

    if (blockPaths.length === 0) { return }

    if (blockStyle.type === 'list-item') {
      blockPaths.forEach(path => {
        Transforms.setNodes(editor, {
          type: 'list-item',
          ordered: blockStyle.ordered,
          orderType: blockStyle.orderType,
          level: 0,
        }, { at: path })
        Transforms.unsetNodes(editor, 'checked', { at: path })
        Transforms.unsetNodes(editor, 'start', { at: path })
      })
      return
    }

    if (blockStyle.type === 'todo') {
      blockPaths.forEach(path => {
        Transforms.setNodes(editor, {
          type: 'todo',
          checked: false,
        }, { at: path })
        this.unsetListAttrs(editor, path)
      })
      return
    }

    blockPaths.forEach(path => {
      Transforms.setNodes(editor, {
        type: blockStyle.type,
      }, { at: path })
      this.unsetListAttrs(editor, path)
      Transforms.unsetNodes(editor, 'checked', { at: path })
    })
  }

  setFormatHtml(editor: IDomEditor) {
    const selectionText = editor.getSelectionText()

    if (!selectionText.length) { return }
    if (FormatPainter.attrs.formatStyle) {
      clearAllMarks(editor)
      for (const [key, value] of Object.entries(FormatPainter.attrs.formatStyle)) {
        editor.addMark(key, value)
      }
    }

    if (FormatPainter.attrs.formatBlockStyle) {
      this.applyBlockStyle(editor, FormatPainter.attrs.formatBlockStyle)
    }

    FormatPainter.attrs.formatStyle = null
    FormatPainter.attrs.formatBlockStyle = null
    FormatPainter.attrs.isSelect = false
  }

  exec(editor: IDomEditor) {
    // 如果已经选中了格式刷则取消选中，反之保存已经选中文本的样式
    if (FormatPainter.attrs.isSelect) {
      FormatPainter.attrs.isSelect = false
      FormatPainter.attrs.formatStyle = null
      FormatPainter.attrs.formatBlockStyle = null
    } else {
      const selectionText = editor.getSelectionText()
      // 判断是否选中文本

      if (selectionText.length) {
        FormatPainter.attrs.formatStyle = Editor.marks(editor)
        FormatPainter.attrs.formatBlockStyle = this.getSelectedBlockStyle(editor)
        FormatPainter.attrs.isSelect = true
      }
    }

    editor.blur()
    editor.focus()
  }
}

export default FormatPainter
