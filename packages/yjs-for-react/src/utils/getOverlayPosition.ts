import type { IDomEditor } from '@wangeditor-next/editor'
import { DomEditor } from '@wangeditor-next/editor'
import {
  BaseRange, Editor, Path, Range, Text,
} from 'slate'

import { reactEditorToDomRangeSafe } from './react-editor-to-dom-range-safe'

export type SelectionRect = {
  width: number
  height: number
  top: number
  left: number
}

export type CaretPosition = {
  height: number
  top: number
  left: number
}

export type OverlayPosition = {
  caretPosition: CaretPosition | null
  selectionRects: SelectionRect[]
}

export type GetSelectionRectsOptions = {
  xOffset: number
  yOffset: number
  shouldGenerateOverlay?: (node: Text, path: Path) => boolean
}

export function getOverlayPosition(
  editor: IDomEditor,
  range: BaseRange,
  { yOffset, xOffset, shouldGenerateOverlay }: GetSelectionRectsOptions,
): OverlayPosition {
  const [start, end] = Range.edges(range)
  const domRange = reactEditorToDomRangeSafe(editor, range)

  if (!domRange) {
    return {
      caretPosition: null,
      selectionRects: [],
    }
  }

  const selectionRects: SelectionRect[] = []
  const nodeIterator = Editor.nodes(editor, {
    at: range,
    match: (n, p) => Text.isText(n) && (!shouldGenerateOverlay || shouldGenerateOverlay(n, p)),
  })

  let caretPosition: CaretPosition | null = null
  const isBackward = Range.isBackward(range)

  for (const [node, path] of nodeIterator) {
    const domNode = DomEditor.toDOMNode(editor, node)

    const isStartNode = Path.equals(path, start.path)
    const isEndNode = Path.equals(path, end.path)

    let clientRects: DOMRectList | null = null

    if (isStartNode || isEndNode) {
      const nodeRange = document.createRange()

      nodeRange.selectNode(domNode)

      if (isStartNode) {
        nodeRange.setStart(domRange.startContainer, domRange.startOffset)
      }
      if (isEndNode) {
        nodeRange.setEnd(domRange.endContainer, domRange.endOffset)
      }

      clientRects = nodeRange.getClientRects()
    } else {
      clientRects = domNode.getClientRects()
    }

    const isCaret = isBackward ? isStartNode : isEndNode

    for (let i = 0; i < clientRects.length; i += 1) {
      const clientRect = clientRects.item(i)

      if (!clientRect) {
        continue
      }

      const isCaretRect = isCaret && (isBackward ? i === 0 : i === clientRects.length - 1)

      const top = clientRect.top - yOffset
      const left = clientRect.left - xOffset

      if (isCaretRect) {
        caretPosition = {
          height: clientRect.height,
          top,
          left: left + (isBackward || Range.isCollapsed(range) ? 0 : clientRect.width),
        }
      }

      selectionRects.push({
        width: clientRect.width,
        height: clientRect.height,
        top,
        left,
      })
    }
  }

  return {
    selectionRects,
    caretPosition,
  }
}
