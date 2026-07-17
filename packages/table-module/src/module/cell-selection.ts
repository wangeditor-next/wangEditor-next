import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import {
  Editor,
  Element as SlateElement,
  Path,
  PathRef,
  Range,
} from 'slate'

/**
 * Keeps one mouse drag isolated per editor. The PathRef invalidates the drag when setHtml removes
 * its anchor table, while eventWindow ensures listeners are detached from the correct document.
 */
interface CellDragSelectionState {
  anchorPathRef: PathRef
  lastTargetPath: Path
  isCrossCellSelecting: boolean
  eventWindow: Window
  stop: () => void
}

/** Editor-scoped storage prevents multiple editors from overwriting each other's active drag. */
const EDITOR_TO_CELL_DRAG_SELECTION = new WeakMap<IDomEditor, CellDragSelectionState>()

/** Releases DOM listeners and Slate path tracking together so neither outlives the drag. */
function clearCellDragSelection(editor: IDomEditor) {
  const state = EDITOR_TO_CELL_DRAG_SELECTION.get(editor)

  if (!state) { return }

  state.eventWindow.removeEventListener('mouseup', state.stop)
  state.eventWindow.removeEventListener('blur', state.stop)
  state.anchorPathRef.unref()
  EDITOR_TO_CELL_DRAG_SELECTION.delete(editor)
}

/** Resolves the direct cell or the cell underneath a resize hotzone in the same DOM root. */
function getCellElement(event: MouseEvent): HTMLElement | null {
  if (event.target instanceof HTMLElement) {
    const cell = event.target.closest<HTMLElement>('[data-block-type="table-cell"]')

    if (cell) { return cell }
  }

  const target = event.target
  const ownerDocument = target instanceof Node ? target.ownerDocument : null
  const root = target instanceof Node ? target.getRootNode() : null
  const pointLookupRoot = root && 'elementsFromPoint' in root
    ? root as Document | ShadowRoot
    : ownerDocument || document

  // A visible resize hotzone may sit above the cell while an existing selection is extended.
  return pointLookupRoot.elementsFromPoint(event.clientX, event.clientY)
    .map(element => element.closest<HTMLElement>('[data-block-type="table-cell"]'))
    .find((element): element is HTMLElement => element != null) || null
}

/** Uses the target document's window for iframe-safe listener registration and cleanup. */
function getEventWindow(event: MouseEvent): Window {
  const targetDocument = event.target instanceof Node ? event.target.ownerDocument : null

  return event.view as Window | null || targetDocument?.defaultView || window
}

/** Maps the pointer target to a live Slate cell path, treating stale DOM nodes as no target. */
function getCellPath(editor: IDomEditor, event: MouseEvent): Path | null {
  const cellElement = getCellElement(event)

  if (!cellElement) { return null }

  try {
    const cellNode = DomEditor.toSlateNode(editor, cellElement)

    if (!SlateElement.isElement(cellNode) || DomEditor.getNodeType(cellNode) !== 'table-cell') {
      return null
    }

    return DomEditor.findPath(editor, cellNode)
  } catch {
    // The DOM node can become stale if setHtml replaces the table during a drag.
    return null
  }
}

/** Cell paths end with row and column segments, so the remaining prefix identifies the table. */
function isCellInSameTable(anchorPath: Path, targetPath: Path): boolean {
  if (anchorPath.length < 3 || targetPath.length < 3) { return false }

  return Path.equals(anchorPath.slice(0, -2), targetPath.slice(0, -2))
}

/** Builds a directional Slate range that includes both boundary cells completely. */
export function getCellDragSelectionRange(
  editor: IDomEditor,
  anchorPath: Path,
  targetPath: Path,
): Range {
  if (Path.compare(anchorPath, targetPath) <= 0) {
    return {
      anchor: Editor.start(editor, anchorPath),
      focus: Editor.end(editor, targetPath),
    }
  }

  return {
    anchor: Editor.end(editor, anchorPath),
    focus: Editor.start(editor, targetPath),
  }
}

/** Records the starting cell without disturbing native text selection inside that cell. */
export function handleCellDragSelectionMouseDown(editor: IDomEditor, event: MouseEvent) {
  clearCellDragSelection(editor)

  if (editor.isDisabled() || event.button !== 0) { return }

  const anchorPath = getCellPath(editor, event)

  if (!anchorPath) { return }

  const stop = () => clearCellDragSelection(editor)
  const eventWindow = getEventWindow(event)

  // setHtml removes this PathRef, preventing an old drag from selecting replacement content.
  EDITOR_TO_CELL_DRAG_SELECTION.set(editor, {
    anchorPathRef: Editor.pathRef(editor, anchorPath),
    lastTargetPath: anchorPath,
    isCrossCellSelecting: false,
    eventWindow,
    stop,
  })
  eventWindow.addEventListener('mouseup', stop)
  eventWindow.addEventListener('blur', stop)
}

/**
 * Takes over only after the pointer crosses into another cell. This avoids Chrome collapsing the
 * native range for wrapped cells while preserving ordinary text selection within one cell.
 */
export function handleCellDragSelectionMouseMove(editor: IDomEditor, event: MouseEvent) {
  const state = EDITOR_TO_CELL_DRAG_SELECTION.get(editor)

  if (!state) { return }

  if ((event.buttons & 1) === 0) {
    clearCellDragSelection(editor)
    return
  }

  const anchorPath = state.anchorPathRef.current

  // The anchor becomes null when setHtml replaces the table while the mouse is still pressed.
  if (!anchorPath) {
    clearCellDragSelection(editor)
    return
  }

  const targetPath = getCellPath(editor, event)

  if (!targetPath || !isCellInSameTable(anchorPath, targetPath)) { return }

  const isAnchorCell = Path.equals(anchorPath, targetPath)

  if (!state.isCrossCellSelecting && isAnchorCell) { return }

  // Once cross-cell selection starts, suppress Chrome's collapsing native range on every move.
  event.preventDefault()

  if (Path.equals(state.lastTargetPath, targetPath)) { return }

  state.isCrossCellSelecting = true
  state.lastTargetPath = targetPath
  editor.select(getCellDragSelectionRange(editor, anchorPath, targetPath))
}
