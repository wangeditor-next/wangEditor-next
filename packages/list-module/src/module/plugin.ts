/**
 * @description list editor plugin
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Editor, Element, Node, Path, Range, Transforms } from 'slate'

import { ListItemElement } from './custom-types'
import {
  getBrotherListNodeByLevel,
  getHeadingType,
  getListIndent,
  isListNode,
  isOutlineListNode,
} from './helpers'

function getTopSelectedElemsBySelection(editor: IDomEditor): Array<[Element, Path]> {
  const entries = Array.from(
    Editor.nodes(editor, {
      at: editor.selection || undefined,
      match: node => Element.isElement(node) && Editor.isBlock(editor, node),
      mode: 'highest',
    })
  ) as Array<[Element, Path]>

  return entries.filter(([, path]) => path.length === 1)
}

function getSelectedListEntry(editor: IDomEditor): [ListItemElement, Path] | null {
  const [entry] = Editor.nodes(editor, {
    at: editor.selection || undefined,
    match: isListNode,
    universal: true,
  })

  return entry == null ? null : (entry as [ListItemElement, Path])
}

function clearListItem(editor: IDomEditor, path: Path, node: ListItemElement, type?: string) {
  Transforms.setNodes(
    editor,
    {
      type: type || getHeadingType(node) || 'paragraph',
      ordered: undefined,
      level: undefined,
      start: undefined,
      orderType: undefined,
      headingType: undefined,
      listMode: undefined,
      listRestart: undefined,
    } as any,
    { at: path }
  )
}

function withList<T extends IDomEditor>(editor: T): T {
  const { deleteBackward, handleTab, normalizeNode, insertBreak } = editor
  const newEditor = editor

  newEditor.insertBreak = () => {
    const entry = getSelectedListEntry(newEditor)

    if (entry == null) {
      return insertBreak()
    }

    const [listItem, path] = entry

    if (Node.string(listItem) === '') {
      clearListItem(newEditor, path, listItem, 'paragraph')
      return
    }

    return insertBreak()
  }

  newEditor.deleteBackward = unit => {
    const { selection } = newEditor

    if (selection == null || Range.isExpanded(selection)) {
      deleteBackward(unit)
      return
    }

    const entry = getSelectedListEntry(newEditor)

    if (entry == null || selection.focus.offset !== 0) {
      deleteBackward(unit)
      return
    }

    const [listItem, path] = entry

    if (isOutlineListNode(listItem)) {
      clearListItem(newEditor, path, listItem)
      return
    }

    const level = getListIndent(listItem)

    if (level <= 0) {
      clearListItem(newEditor, path, listItem)
      return
    }

    const brother = getBrotherListNodeByLevel(editor, listItem, level - 1)

    if (brother != null) {
      Transforms.setNodes(
        newEditor,
        {
          level: level - 1,
          ordered: brother.ordered,
          start: brother.ordered ? brother.start : undefined,
          orderType: brother.ordered ? brother.orderType : undefined,
        },
        { at: path }
      )
    } else {
      Transforms.setNodes(newEditor, { level: level - 1 }, { at: path })
    }
  }

  newEditor.handleTab = () => {
    const { selection } = newEditor

    if (selection == null) {
      handleTab()
      return
    }

    if (Range.isCollapsed(selection)) {
      const entry = getSelectedListEntry(newEditor)

      if (entry == null || isOutlineListNode(entry[0]) || selection.focus.offset !== 0) {
        handleTab()
        return
      }

      const [listItem, path] = entry

      Transforms.setNodes(newEditor, { level: getListIndent(listItem) + 1 }, { at: path })
      return
    }

    const selectedEntries = getTopSelectedElemsBySelection(newEditor)
    const listEntries = selectedEntries.filter(([node]) => {
      return isListNode(node) && !isOutlineListNode(node)
    })

    if (listEntries.length !== selectedEntries.length || listEntries.length <= 1) {
      handleTab()
      return
    }

    listEntries.forEach(([node, path]) => {
      Transforms.setNodes(newEditor, { level: getListIndent(node) + 1 }, { at: path })
    })
  }

  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node)

    if (type === 'bulleted-list' || type === 'numbered-list') {
      Transforms.unwrapNodes(newEditor, { at: path })
    }

    return normalizeNode([node, path])
  }

  return newEditor
}

export default withList
