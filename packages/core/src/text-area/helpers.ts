/**
 * @description textarea helper fns
 * @author wangfupeng
 */

import { Editor, Element } from 'slate'

import { DomEditor } from '../editor/dom-editor'
import { IDomEditor } from '../editor/interface'
import {
  DOMElement,
  DOMNode,
  DOMRange,
  isDOMElement,
  isDOMNode,
  isDOMText,
} from '../utils/dom'

/**
 * Check if two DOM range objects are equal.
 */
export const isRangeEqual = (a: DOMRange, b: DOMRange) => {
  return (
    (a.startContainer === b.startContainer
      && a.startOffset === b.startOffset
      && a.endContainer === b.endContainer
      && a.endOffset === b.endOffset)
    || (a.startContainer === b.endContainer
      && a.startOffset === b.endOffset
      && a.endContainer === b.startContainer
      && a.endOffset === b.startOffset)
  )
}

/**
 * Check if the target is editable and in the editor.
 */
export function hasEditableTarget(
  editor: IDomEditor,
  target: EventTarget | null,
): target is DOMNode {
  return isDOMNode(target) && DomEditor.hasDOMNode(editor, target, { editable: true })
}

/**
 * Check if the target is in the editor.
 */
export function hasTarget(editor: IDomEditor, target: EventTarget | null): target is DOMNode {
  return isDOMNode(target) && DomEditor.hasDOMNode(editor, target)
}

/**
 * Check if the target is inside void and in an non-readonly editor.
 */
export function isTargetInsideNonReadonlyVoid(
  editor: IDomEditor,
  target: EventTarget | null,
): boolean {
  const { readOnly } = editor.getConfig()

  if (readOnly) { return false }

  const slateNode = hasTarget(editor, target) && DomEditor.toSlateNode(editor, target)

  return !!slateNode && Element.isElement(slateNode) && Editor.isVoid(editor, slateNode)
}

/**
 * Check if the target can participate in editor selection.
 */
export function hasSelectableTarget(editor: IDomEditor, target: EventTarget | null): boolean {
  if (hasEditableTarget(editor, target)) { return true }
  if (!hasTarget(editor, target)) { return false }

  let targetEl: DOMElement | null = null

  if (isDOMElement(target)) {
    targetEl = target
  } else if (isDOMText(target)) {
    targetEl = target.parentElement
  }

  if (targetEl?.closest('[data-w-e-reserve]')) {
    return true
  }

  return isTargetInsideNonReadonlyVoid(editor, target)
}

/**
 * Check if a DOM event is overrode by a handler.
 */
export function isDOMEventHandled(event: Event, handler?: (event: Event) => void | boolean) {
  if (!handler) {
    return false
  }

  // The custom event handler may return a boolean to specify whether the event
  // shall be treated as being handled or not.
  const shouldTreatEventAsHandled = handler(event)

  if (shouldTreatEventAsHandled != null) {
    return shouldTreatEventAsHandled
  }

  return event.defaultPrevented
}
