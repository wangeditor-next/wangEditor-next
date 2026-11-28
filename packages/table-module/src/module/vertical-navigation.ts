import { DomEditor, EditorEvents, type IDomEditor } from '@wangeditor-next/core'
import { Editor, Element, Node, Path, type Point, Range, Text } from 'slate'

import type { TableCellElement, TableElement } from './custom-types'
import { TableCursor } from './table-cursor'

// Keep the workaround on the verified desktop environment.
const LINUX_DESKTOP = /\bX11; Linux x86_64\b/
const CHROMIUM = /\b(?:Chrome|HeadlessChrome)\//
const UNSUPPORTED_TEXT = /[^\x20-\x7e\u3400-\u9fff]/
const OPTIONAL_MODIFIER = /^(alt|cmd|command|control|ctl|ctrl|meta|mod|opt|option|shift|win|windows)\?$/i
const regularTables = new WeakMap<TableElement, boolean>()

function isRegularTable(table: TableElement): boolean {
  const cached = regularTables.get(table)

  if (cached !== undefined) { return cached }

  const columns = table.children[0]?.children?.length
  const regular = !!columns && table.children.every(row =>
    Element.isElement(row) && row.type === 'table-row' && row.children.length === columns
    && row.children.every(cell =>
      Element.isElement(cell) && cell.type === 'table-cell' && !cell.hidden
      && (cell.colSpan ?? 1) === 1 && (cell.rowSpan ?? 1) === 1))

  // Slate replaces the table node when an operation changes any descendant.
  regularTables.set(table, regular)
  return regular
}

function isMenuShortcut(editor: IDomEditor, direction: 'up' | 'down'): boolean {
  const menus = {
    ...DomEditor.getToolbar(editor)?.getMenus(),
    ...DomEditor.getHoverbar(editor)?.getMenus(),
  }

  return Object.values(menus).some(({ hotkey }) => {
    if (!hotkey) { return false }

    const required = hotkey.toLowerCase().split('+').filter(key => !OPTIONAL_MODIFIER.test(key))

    if (required.length !== 1) { return false }
    const key = required[0].replace(/\?$/, '')

    return key === direction || key === `arrow${direction}`
  })
}

function getPlainCellText(cell: TableCellElement): Text | null {
  if (cell.children.length !== 1) { return null }

  const [child] = cell.children
  const leaf = Element.isElement(child) && child.type === 'paragraph' && child.children.length === 1
    ? child.children[0] : child

  return Text.isText(leaf) && Object.keys(leaf).length === 1 && !UNSUPPORTED_TEXT.test(leaf.text)
    ? leaf : null
}

function measureLine(view: Window, cell: HTMLElement, textNode: HTMLElement, text: string) {
  // One model text can render multiple leaves after decoration. Only measure
  // the regular Slate text/leaf/string structure.
  const leaf = textNode.firstElementChild
  const span = leaf?.firstElementChild

  if (
    textNode.closest('td,th') !== cell || textNode.childNodes.length !== 1
    || !leaf?.hasAttribute('data-slate-leaf') || leaf.childNodes.length !== 1 || !span
    || (text ? !span.hasAttribute('data-slate-string') || span.textContent !== text
      : span.getAttribute('data-slate-length') !== '0' || !span.hasAttribute('data-slate-zero-width'))
  ) { return null }

  const { direction, visibility, writingMode } = view.getComputedStyle(span)

  if (direction !== 'ltr' || visibility !== 'visible' || writingMode !== 'horizontal-tb') {
    return null
  }

  const range = cell.ownerDocument.createRange()

  range.selectNodeContents(span)
  const rects = Array.from(range.getClientRects()).filter(rect => rect.height > 0)
  const [first] = rects

  if (!first || !Number.isFinite(first.top) || !Number.isFinite(first.bottom)) { return null }

  // With a small line-height, glyph rectangles from distinct lines can overlap.
  if (!rects.every(rect => (
    rect.top === first.top && rect.bottom === first.bottom
    && Number.isFinite(rect.left) && Number.isFinite(rect.right)
    && (text !== '' || (rect.left === first.left && rect.right === first.right))
  ))) { return null }

  const left = Math.min(...rects.map(rect => rect.left))
  const right = Math.max(...rects.map(rect => rect.right))
  const y = (first.top + first.bottom) / 2

  return !text || right > left ? { left, right, y, span } : null
}

function getVerticalPoint(
  editor: IDomEditor,
  root: HTMLElement,
  view: Window,
  direction: 'up' | 'down'
): Point | null {
  const { selection } = editor

  if (!selection || !Range.isCollapsed(selection) || TableCursor.hasSelected(editor)) { return null }
  const sourceEntry = Editor.above<TableCellElement>(editor, {
    at: selection.anchor,
    match: node => DomEditor.checkNodeType(node, 'table-cell'),
  })

  if (!sourceEntry || isMenuShortcut(editor, direction)) { return null }

  const scope = DomEditor.findDocumentOrShadowRoot(editor)
  const domSelection = scope.getSelection()

  if (
    scope.activeElement !== root || !domSelection?.isCollapsed || domSelection.rangeCount !== 1
    || !root.contains(domSelection.anchorNode)
  ) { return null }

  const actual = DomEditor.toSlateRange(editor, domSelection, { exactMatch: false, suppressThrow: true })

  if (!actual || !Range.equals(actual, selection)) { return null }

  const [source, sourcePath] = sourceEntry
  const tablePath = sourcePath.slice(0, -2)
  const row = sourcePath[sourcePath.length - 2] + (direction === 'up' ? -1 : 1)
  const column = sourcePath[sourcePath.length - 1]
  const table = Node.get(editor, tablePath) as TableElement

  if (table.type !== 'table' || row < 0 || row >= table.children.length || !isRegularTable(table)) {
    return null
  }

  const target = table.children[row].children[column]
  const sourceText = getPlainCellText(source)
  const targetText = target && getPlainCellText(target)

  if (!sourceText || !targetText) { return null }

  const sourceCell = DomEditor.toDOMNode(editor, source)
  const targetCell = DomEditor.toDOMNode(editor, target)

  if (
    !sourceCell.matches('td,th') || !targetCell.matches('td,th')
    || !sourceCell.contains(domSelection.anchorNode) || !root.contains(targetCell)
    || sourceCell.closest('table') !== targetCell.closest('table')
    || sourceCell.closest('[contenteditable="false"]') || targetCell.closest('[contenteditable="false"]')
  ) { return null }

  const sourceLine = measureLine(view, sourceCell, DomEditor.toDOMNode(editor, sourceText), sourceText.text)
  const targetLine = measureLine(view, targetCell, DomEditor.toDOMNode(editor, targetText), targetText.text)

  if (!sourceLine || !targetLine) { return null }

  const [caret] = Array.from(domSelection.getRangeAt(0).getClientRects()).filter(rect => rect.height > 0)
  const x = caret?.left ?? (!sourceText.text ? sourceLine.left : NaN)

  if (!Number.isFinite(x)) { return null }

  const { left, right, y, span } = targetLine
  const clampedX = Math.max(left, Math.min(right, x))
  const hit = scope.elementFromPoint(clampedX, y)

  // A hit inside the cell can still be an overlay unrelated to the rendered text.
  const onTextChain = hit?.contains(span)
    || (!targetText.text && hit?.tagName === 'BR' && hit.parentElement === span)

  if (!hit || !targetCell.contains(hit) || !onTextChain || hit.closest('[contenteditable="false"]')) {
    return null
  }

  const start = Editor.start(editor, tablePath.concat(row, column))

  if (!targetText.text || x <= left) { return start }
  if (x >= right) { return { path: start.path, offset: targetText.text.length } }

  const { anchor } = DomEditor.findEventRange(editor, { target: targetCell, clientX: x, clientY: y })

  return Path.equals(anchor.path, start.path) && anchor.offset >= 0 && anchor.offset <= targetText.text.length
    ? anchor : null
}

export function bindTableVerticalNavigation(editor: IDomEditor) {
  // The core installs its own keydown listener before it emits created.
  editor.once(EditorEvents.CREATED, () => {
    if (editor.isDestroyed || !DomEditor.hasDOMNodeBySlateNode(editor, editor)) { return }

    const root = DomEditor.toDOMNode(editor, editor)
    const view = root.ownerDocument.defaultView

    const userAgent = view?.navigator.userAgent

    if (!view || !userAgent || !LINUX_DESKTOP.test(userAgent) || !CHROMIUM.test(userAgent)) { return }

    const onKeydown = (event: KeyboardEvent) => {
      const { key } = event

      if (
        (key !== 'ArrowUp' && key !== 'ArrowDown') || event.target !== root
        || !event.cancelable || event.defaultPrevented || event.isComposing
        || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey
        || !editor.isFocused() || editor.isDisabled() || DomEditor.getTextarea(editor).isComposing
      ) { return }

      let point: Point | null

      try {
        point = getVerticalPoint(editor, root, view, key === 'ArrowUp' ? 'up' : 'down')
      } catch {
        // Selection and DOM mappings can be temporarily out of sync.
        return
      }

      if (!point) { return }

      editor.select(point)
      event.preventDefault()
    }

    root.addEventListener('keydown', onKeydown)
    editor.once(EditorEvents.DESTROYED, () => root.removeEventListener('keydown', onKeydown))
  })
}
