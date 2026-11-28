/**
 * @description Rectangular table selections for Copy/Cut.
 *
 * Core keeps the public `setFragmentData` signature. This module takes part in
 * the internal synchronous clipboard hooks instead, so it can hand the native
 * transfer to the complete writer chain and register one completion callback
 * that verifies the result after that chain settles.
 *
 * The projected table is serialized with the registered semantic exporter
 * (`getHtml`) from isolated selected cells. No DOM event is intercepted here.
 */

import {
  ClipboardFragmentEvents,
  coreCreateEditor,
  DomEditor,
  IClipboardFragmentContext,
  IDomEditor,
} from '@wangeditor-next/core'
import {
  Element,
  Node,
  Path,
  Range,
  Text,
} from 'slate'

import type {
  TableCellElement,
  TableElement,
  TableRowElement,
} from './custom-types'

type Matrix = NonNullable<ReturnType<NonNullable<IDomEditor['getTableSelection']>>>
type ClipboardData = IClipboardFragmentContext['data']
type Payload = Map<string, string>

interface Rectangle {
  cells: TableCellElement[][]
  top: number
  left: number
  table: TableElement
}

interface NativeSelection {
  anchor: Path
  focus: Path
}

interface Stage {
  context: IClipboardFragmentContext
  payload: Payload
  selection: Range
  matrix: Matrix
  table: TableElement
  rectangle: Rectangle
  native: NativeSelection
  /** Serialized selected cells captured before any custom exporter runs. */
  initialCells: string
  /** Values of the required MIME types before this transfer was written. */
  previous: Map<string, string | null>
}

const FRAGMENT_TYPE = 'application/x-slate-fragment'
const REQUIRED_TYPES = [FRAGMENT_TYPE, 'text/html', 'text/plain'] as const
const INSTALLED = new WeakSet<IDomEditor>()

function getTable(editor: IDomEditor, point: { path: Path }): TableElement | undefined {
  const node = editor.children[point.path[0]]

  if (point.path.length >= 4 && Element.isElement(node) && DomEditor.getNodeType(node) === 'table') {
    return node as TableElement
  }
}

function ordinary(rows: TableElement['children']): boolean {
  const width = rows[0]?.children.length

  return !!width && rows.every(row => row.type === 'table-row' && row.children.length === width
    && row.children.every(cell => cell.type === 'table-cell' && !cell.hidden
      && (cell.colSpan ?? 1) === 1 && (cell.rowSpan ?? 1) === 1))
}

/** Compute the whole-table shape at most once per immutable row-array revision. */
function shapeFor(
  shapes: WeakMap<TableElement['children'], boolean>,
  table: TableElement,
): boolean {
  let shape = shapes.get(table.children)

  if (shape === undefined) {
    shape = ordinary(table.children)
    shapes.set(table.children, shape)
  }
  return shape
}

function validPoint(editor: IDomEditor, point: { path: Path; offset: number }): boolean {
  const leaf = Node.get(editor, point.path)

  return Text.isText(leaf) && Number.isInteger(point.offset)
    && point.offset >= 0 && point.offset <= leaf.text.length
}

function cellPath(point: { path: Path }): Path {
  return point.path.slice(0, 3)
}

function tablePath(selection: Range): Path {
  return selection.anchor.path.slice(0, 1)
}

/**
 * The selection matrix holds the cell nodes captured when Slate generated it.
 * Layout updates may later clone a cell wrapper to change only its measured
 * layout properties (`width`, `scrollWidth`, `height`, `rowHeights`) while
 * reusing the same children array. Accept that exact layout-only clone; any
 * content, structure or other property change is still rejected.
 */
function sameCell(current: unknown, expected: unknown): boolean {
  if (current === expected) { return true }
  if (!current || typeof current !== 'object' || !expected || typeof expected !== 'object') {
    return false
  }

  const currentCell = current as TableCellElement
  const expectedCell = expected as TableCellElement

  if (currentCell.type !== 'table-cell' || expectedCell.type !== 'table-cell') { return false }
  if (currentCell.children !== expectedCell.children) { return false }

  const layoutKeys = ['width', 'scrollWidth', 'height', 'rowHeights']
  const ownKeys = (cell: TableCellElement) => Object.keys(cell)
    .filter(key => key !== 'children' && !layoutKeys.includes(key))
  const currentKeys = ownKeys(currentCell)
  const expectedKeys = ownKeys(expectedCell)

  return currentKeys.length === expectedKeys.length
    && currentKeys.every(key => Object.prototype.hasOwnProperty.call(expectedCell, key)
      && (currentCell as unknown as Record<string, unknown>)[key]
        === (expectedCell as unknown as Record<string, unknown>)[key])
}

function sameNative(native: NativeSelection, selection: Range): boolean {
  const anchor = cellPath(selection.anchor)
  const focus = cellPath(selection.focus)

  return (Path.equals(native.anchor, anchor) && Path.equals(native.focus, focus))
    || (Path.equals(native.anchor, focus) && Path.equals(native.focus, anchor))
}

function sameNativePair(a: NativeSelection, b: NativeSelection): boolean {
  return (Path.equals(a.anchor, b.anchor) && Path.equals(a.focus, b.focus))
    || (Path.equals(a.anchor, b.focus) && Path.equals(a.focus, b.anchor))
}

/**
 * Read the current native selection as table cells. A missing native selection
 * or one that cannot map back to the editor fails closed: the browser can move
 * the selection while the transfer is being written.
 */
function readNativeSelection(editor: IDomEditor): NativeSelection | null {
  let native: Selection | null = null

  try {
    const root = DomEditor.findDocumentOrShadowRoot(editor)

    native = typeof root.getSelection === 'function' ? root.getSelection() : null
  } catch {
    return null
  }

  if (!native || native.rangeCount === 0) { return null }

  try {
    const mapped = DomEditor.toSlateRange(editor, native, {
      exactMatch: false,
      suppressThrow: false,
    })

    if (!mapped || Range.isCollapsed(mapped)) { return null }
    return { anchor: cellPath(mapped.anchor), focus: cellPath(mapped.focus) }
  } catch {
    return null
  }
}

function snapshot(editor: IDomEditor, matrix: Matrix, selection: Range, table: TableElement): Rectangle {
  const { anchor, focus } = selection
  const top = Math.min(anchor.path[1], focus.path[1])
  const left = Math.min(anchor.path[2], focus.path[2])
  const height = Math.abs(anchor.path[1] - focus.path[1]) + 1
  const width = Math.abs(anchor.path[2] - focus.path[2]) + 1

  if (height * width < 2 || matrix.length !== height
    || !validPoint(editor, anchor) || !validPoint(editor, focus)) {
    throw new Error('Invalid table selection')
  }

  const cells = matrix.map((row, r) => {
    if (row.length !== width) { throw new Error('Invalid table selection width') }

    return row.map(([[node, path]], c) => {
      const cell = table.children[top + r]?.children[left + c]

      if (!cell || !sameCell(cell, node)
        || !Path.equals(path, [anchor.path[0], top + r, left + c])) {
        throw new Error('Table selection no longer matches its cells')
      }
      return cell
    })
  })

  return { cells, top, left, table }
}

function field(cell: TableCellElement): string {
  const value = cell.children.map(block => Node.string(block)).join('\n')

  return /["\t\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value
}

function getDocument(editor: IDomEditor): Document {
  try {
    const root = DomEditor.findDocumentOrShadowRoot(editor)

    if (typeof (root as Document).createElement === 'function') { return root as Document }
    if (root.ownerDocument) { return root.ownerDocument }
  } catch {
    // Fall through to the global document.
  }
  return window.document
}

function projectTable(rectangle: Rectangle): TableElement {
  // Projection choices: the rectangle is a standalone table, so the caption and
  // the source table height are omitted, and the table width falls back to
  // `auto`. Row heights and the selected slice of column widths are preserved
  // because the semantic exporter supports both. Header semantics are limited
  // to source row 0, matching render-cell.tsx.
  const columnCount = rectangle.cells[0].length
  const sourceWidths = rectangle.table.columnWidths
  const widths = Array.isArray(sourceWidths) && sourceWidths.length >= rectangle.left + columnCount
    ? sourceWidths.slice(rectangle.left, rectangle.left + columnCount)
    : null
  const usableWidths = widths
    && widths.every(width => typeof width === 'number' && Number.isFinite(width) && width > 0)
    ? widths
    : null
  const rows: TableRowElement[] = rectangle.cells.map((row, r) => {
    const sourceRow = rectangle.table.children[rectangle.top + r]
    const children = row.map((cell, c) => {
      const projected: TableCellElement = { ...cell }

      // render-cell.tsx only renders `<th>` for the table's own first row.
      // A rectangle projected from a deeper row must stay `<td>`.
      if (rectangle.top + r !== 0 || !cell.isHeader) { delete projected.isHeader }
      // Preserve the source column width slice on the projected cells too, so
      // the exported HTML keeps the same width hints as the source table.
      if (usableWidths) { projected.width = `${usableWidths[c]}` }
      return projected
    })
    const projectedRow: TableRowElement = { type: 'table-row', children }

    if (sourceRow && typeof sourceRow.height === 'number' && Number.isFinite(sourceRow.height)
      && sourceRow.height > 0) {
      projectedRow.height = sourceRow.height
    }
    return projectedRow
  })
  const table: TableElement = { type: 'table', width: 'auto', children: rows }

  if (usableWidths) { table.columnWidths = usableWidths }

  return table
}

function preparePayload(editor: IDomEditor, rectangle: Rectangle): Payload {
  const table = projectTable(rectangle)
  // `insertData` expects a Descendant[] and `coreCreateEditor` requires the
  // same array content. Encode one source for both paths.
  const fragment: TableElement[] = [table]
  const json = JSON.stringify(fragment)
  const encoded = window.btoa(encodeURIComponent(json))
  // The headless constructor binds Slate parent/index maps. Give it its own nodes.
  const context = coreCreateEditor({
    content: JSON.parse(json),
    plugins: [ed => {
      ed.getConfig = editor.getConfig
      ed.getMenuConfig = editor.getMenuConfig
      ed.isInline = editor.isInline
      ed.isVoid = editor.isVoid
      return ed
    }],
  })
  const doc = getDocument(editor)
  const template = doc.createElement('template')

  template.innerHTML = context.getHtml()
  const element = template.content.firstElementChild as HTMLTableElement | null

  if (template.content.childNodes.length !== 1 || !element || element.tagName !== 'TABLE'
    || element.rows.length !== table.children.length
    || Array.from(element.rows).some((row, i) => row.cells.length !== table.children[i].children.length)
    || element.querySelector('table,button,input,textarea,[data-slate-editor],[data-slate-node],[data-slate-fragment]')) {
    throw new Error('Semantic export did not produce the selected rectangle')
  }

  element.setAttribute('data-slate-fragment', encoded)
  return new Map([
    [FRAGMENT_TYPE, encoded],
    ['text/html', element.outerHTML],
    ['text/plain', rectangle.cells.map(row => row.map(field).join('\t')).join('\n')],
  ])
}

function dataTypes(data: ClipboardData): string[] | null {
  return data.types == null ? null : Array.from(data.types)
}

function verifyPayload(data: ClipboardData, payload: Payload) {
  const types = dataTypes(data)

  payload.forEach((value, type) => {
    if (types && !types.includes(type)) { throw new Error(`Clipboard did not retain ${type}`) }
    if (typeof data.getData !== 'function' || data.getData(type) !== value) {
      throw new Error(`Clipboard did not retain ${type}`)
    }
  })
}

function capturePrevious(data: ClipboardData): Map<string, string | null> {
  const types = dataTypes(data)

  return new Map(REQUIRED_TYPES.map(type => {
    const value = typeof data.getData === 'function' ? data.getData(type) : ''
    const present = types ? types.includes(type) : value !== ''

    return [type, present ? value : null] as [string, string | null]
  }))
}

/** Restore only the required formats, preserving unrelated MIME types. */
function restoreTargeted(data: ClipboardData, previous: Map<string, string | null>) {
  previous.forEach((value, type) => {
    try {
      if (value === null) {
        if (typeof data.clearData === 'function') { data.clearData(type) }
        else { data.setData(type, '') }
      } else {
        data.setData(type, value)
      }
    } catch {
      // Best effort: a closed or read-only transfer cannot be restored.
    }
  })
}

function sameCellReferences(a: TableCellElement[][], b: TableCellElement[][]): boolean {
  return a.length === b.length && a.every((row, i) => row.length === b[i].length
    && row.every((cell, j) => cell === b[i][j]))
}

function reportFailure(editor: IDomEditor, error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (typeof editor.alert === 'function') { editor.alert(message, 'error') }
}

function verifyRectangle(
  editor: IDomEditor,
  context: IClipboardFragmentContext,
  pending: WeakMap<object, Stage>,
) {
  const stage = pending.get(context.data)

  if (!stage) {
    if (context.handled && context.cancel && context.error) {
      reportFailure(editor, context.error)
    }
    return
  }
  pending.delete(context.data)

  if (stage.context !== context) {
    // A later write reused the same native transfer after this reservation.
    restoreTargeted(context.data, stage.previous)
    stage.context.cancel = true
    if (context.handled) { context.cancel = true }
    context.error = new Error('Stale clipboard fragment context')
    reportFailure(editor, context.error)
    return
  }

  const fail = (error: unknown) => {
    restoreTargeted(context.data, stage.previous)
    context.cancel = true
    context.error = error
    reportFailure(editor, error)
  }

  if (context.cancel) {
    // An explicit `false` from the writer chain or an out-of-band cancellation.
    restoreTargeted(context.data, stage.previous)
    if (context.error) { reportFailure(editor, context.error) }
    return
  }
  if (context.error) {
    fail(context.error)
    return
  }

  try {
    verifyPayload(context.data, stage.payload)

    if (editor.selection !== stage.selection) {
      throw new Error('Selection changed during clipboard export')
    }
    if (editor.getTableSelection?.() !== stage.matrix) {
      throw new Error('Table selection changed during clipboard export')
    }
    if (getTable(editor, stage.selection.anchor)?.children !== stage.table.children) {
      throw new Error('Table changed during clipboard export')
    }

    const native = readNativeSelection(editor)

    if (!native || !sameNativePair(native, stage.native)) {
      throw new Error('Browser selection changed during clipboard export')
    }

    const latest = snapshot(editor, stage.matrix, stage.selection, stage.table)

    // A writer can mutate selected cells in place without replacing objects.
    if (!sameCellReferences(latest.cells, stage.rectangle.cells)
      || JSON.stringify(latest.cells) !== stage.initialCells) {
      throw new Error('Selected cells changed during clipboard export')
    }
  } catch (error) {
    fail(error)
  }
}

function prepareRectangle(
  editor: IDomEditor,
  context: IClipboardFragmentContext,
  pending: WeakMap<object, Stage>,
  shapes: WeakMap<TableElement['children'], boolean>,
  selections: WeakMap<Matrix, Path>,
) {
  // A nested write on the same native transfer must not overwrite the outer
  // reservation. Check this before the selection guards: a nested Cut whose
  // selection looks ordinary must still be cancelled, or its content would be
  // deleted after the outer transfer already owns this native transfer. Cancel
  // both sides, but leave the original stage reserved: only the outer completion
  // may restore the clipboard, so writes the outer writer performs after this
  // point cannot escape cleanup. The nested attempt neither runs the writer nor
  // owns the cleanup callback.
  const existing = pending.get(context.data)

  if (existing) {
    context.handled = true
    context.skipWrite = true
    context.cancel = true
    context.error = new Error('Nested clipboard fragment write')
    existing.context.cancel = true
    return
  }

  const { selection } = editor

  if (!selection || Range.isCollapsed(selection)) { return }
  if (typeof editor.isDisabled === 'function' && editor.isDisabled()) { return }

  const table = getTable(editor, selection.anchor)

  if (!table || table !== getTable(editor, selection.focus)
    || Path.equals(cellPath(selection.anchor), cellPath(selection.focus))) {
    return
  }
  // Merged and otherwise irregular tables keep their historical behaviour.
  if (!shapeFor(shapes, table)) { return }

  // From here this is a confirmed rectangular table transfer. Never fall back
  // to the linear DOM-range writer, even if the rest of the checks fail.
  context.handled = true

  // Another participant already registered a completion. This module cannot
  // verify or restore the transfer afterwards, so decline ownership before
  // staging or writing: cancel the Cut and skip the writer immediately.
  if (!context.setCompletion(() => {
    verifyRectangle(editor, context, pending)
  })) {
    context.skipWrite = true
    context.cancel = true
    context.error = new Error('Clipboard completion already registered')
    return
  }

  try {
    const matrix = editor.getTableSelection?.()

    if (!matrix) { throw new Error('Missing or stale rectangular clipboard selection') }
    // The matrix must have been produced for this top-level table path by the
    // upstream selection operation. Layout updates replace the immutable row
    // array, so path identity is the stable provenance check.
    const recordedPath = selections.get(matrix)

    if (!recordedPath || !Path.equals(recordedPath, tablePath(selection))) {
      throw new Error('Table selection does not belong to this table')
    }

    const native = readNativeSelection(editor)

    if (!native || !sameNative(native, selection)) { throw new Error('Browser selection changed') }

    const rectangle = snapshot(editor, matrix, selection, table)
    // Capture both the cell contents and the prior clipboard formats before
    // invoking any custom exporter or outer writer.
    const initialCells = JSON.stringify(rectangle.cells)
    const previous = capturePrevious(context.data)
    const payload = preparePayload(editor, rectangle)

    if (JSON.stringify(rectangle.cells) !== initialCells) {
      throw new Error('Clipboard exporter changed selected cells')
    }

    pending.set(context.data, {
      context,
      payload,
      selection,
      matrix,
      table,
      rectangle,
      native,
      initialCells,
      previous,
    })
  } catch (error) {
    context.skipWrite = true
    context.cancel = true
    context.error = error
  }
}

/**
 * Install the Copy/Cut integration once per editor.
 */
export function withRectangularClipboard<T extends IDomEditor>(editor: T): T {
  if (INSTALLED.has(editor)) { return editor }
  INSTALLED.add(editor)

  const pending = new WeakMap<object, Stage>()
  const shapes = new WeakMap<TableElement['children'], boolean>()
  const selections = new WeakMap<Matrix, Path>()
  const { apply, setFragmentData } = editor

  // Cache the table shape and record which top-level table path produced each
  // active matrix, so warm fixed-small Copy does not rescan the source table.
  editor.apply = op => {
    apply(op)
    if (op.type !== 'set_selection') { return }

    const { selection } = editor

    if (!selection) { return }
    const matrix = editor.getTableSelection?.()
    const table = getTable(editor, selection.anchor)

    if (!matrix || !table) { return }
    if (!shapes.has(table.children)) { shapes.set(table.children, ordinary(table.children)) }
    selections.set(matrix, tablePath(selection))
  }

  editor.setFragmentData = data => {
    const stage = pending.get(data)

    // Drag and ordinary direct calls keep the original delegate untouched.
    if (!stage) { return setFragmentData.call(editor, data) }

    stage.payload.forEach((value, type) => {
      data.setData(type, value)
    })
  }

  if (typeof editor.on !== 'function') { return editor }

  editor.on(ClipboardFragmentEvents.BEFORE_WRITE, (context: IClipboardFragmentContext) => {
    prepareRectangle(editor, context, pending, shapes, selections)
  })

  return editor
}
