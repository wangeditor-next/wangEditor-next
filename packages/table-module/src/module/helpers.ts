/**
 * @description table menu helpers
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Descendant, Element as SlateElement, Text, Transforms } from 'slate'

import { TableCellElement, TableElement } from './custom-types'

export function createEmptyTableCell(
  properties: Omit<Partial<TableCellElement>, 'type' | 'children'> = {}
): TableCellElement {
  return {
    type: 'table-cell',
    ...properties,
    children: [{ type: 'paragraph', children: [{ text: '' }] }],
  }
}

export function cloneTableCellChildren(children: Descendant[]): Descendant[] {
  return children.map(child => {
    if (Text.isText(child)) {
      return { ...child }
    }

    return {
      ...child,
      children: cloneTableCellChildren(child.children),
    }
  })
}

export function normalizeTableCellChildren(children: Descendant[]): Descendant[] {
  const normalized: Descendant[] = []
  let textRun: Descendant[] = []

  const flushTextRun = () => {
    if (textRun.length === 0) {
      return
    }

    normalized.push({ type: 'paragraph', children: textRun })
    textRun = []
  }

  children.forEach(child => {
    if (Text.isText(child)) {
      textRun.push({ ...child })
      return
    }

    flushTextRun()
    normalized.push(child)
  })
  flushTextRun()

  return normalized.length > 0 ? normalized : createEmptyTableCell().children
}

function hasSupportedInlineChildren(editor: IDomEditor, node: SlateElement): boolean {
  return node.children.every(child => {
    if (Text.isText(child)) {
      return true
    }

    return (
      SlateElement.isElement(child) &&
      editor.isInline(child) &&
      hasSupportedInlineChildren(editor, child)
    )
  })
}

/**
 * Return whether a block node is safe to keep directly under a table cell.
 * The list is intentionally explicit so arbitrary custom blocks cannot bypass
 * table selection and keyboard invariants by being pasted into a cell.
 */
export function isSupportedTableCellBlock(editor: IDomEditor, node: Descendant): boolean {
  if (!SlateElement.isElement(node)) {
    return false
  }

  if (node.type === 'paragraph' || node.type === 'list-item') {
    return hasSupportedInlineChildren(editor, node)
  }

  if (node.type === 'pre') {
    return (
      node.children.length === 1 &&
      SlateElement.isElement(node.children[0]) &&
      node.children[0].type === 'code' &&
      node.children[0].children.every(Text.isText)
    )
  }

  if (node.type === 'video') {
    return editor.isVoid(node) && node.children.every(Text.isText)
  }

  return false
}

export function normalizeTableContent(content: Descendant[]): Descendant[] {
  return content.map(node => {
    if (Text.isText(node)) {
      return node
    }

    if (node.type === 'table-cell') {
      return {
        ...node,
        children: normalizeTableCellChildren(node.children),
      }
    }

    const children = normalizeTableContent(node.children)

    if (children.every((child, index) => child === node.children[index])) {
      return node
    }

    return {
      ...node,
      children,
    }
  })
}

/**
 * Update a rendered table by its own path instead of relying on the current selection.
 */
export function setTableNodeProps(
  editor: IDomEditor,
  tableNode: SlateElement,
  props: Partial<TableElement>
) {
  try {
    const tablePath = DomEditor.findPath(editor, tableNode)

    Transforms.setNodes(editor, props as TableElement, { at: tablePath })
  } catch {
    // The rendered table may have been removed before an async callback runs.
  }
}

/**
 * 获取第一行所有 cells
 * @param tableNode table node
 */
export function getFirstRowCells(tableNode: TableElement): TableCellElement[] {
  const rows = tableNode.children || [] // 所有行

  if (rows.length === 0) {
    return []
  }
  const firstRow = rows[0] || {} // 第一行
  const cells = firstRow.children || [] // 第一行所有 cell

  return cells
}

/**
 * 表格是否带有表头？
 * @param tableNode table node
 */
export function isTableWithHeader(tableNode: TableElement): boolean {
  const firstRowCells = getFirstRowCells(tableNode)

  return firstRowCells.every(cell => !!cell.isHeader)
}

/**
 * 单元格是否在第一行
 * @param editor editor
 * @param cellNode cell node
 */
export function isCellInFirstRow(editor: IDomEditor, cellNode: TableCellElement): boolean {
  const rowNode = DomEditor.getParentNode(editor, cellNode)

  if (rowNode == null) {
    return false
  }
  const tableNode = DomEditor.getParentNode(editor, rowNode)

  if (tableNode == null) {
    return false
  }

  const firstRowCells = getFirstRowCells(tableNode as TableElement)

  return firstRowCells.some(c => c === cellNode)
}
