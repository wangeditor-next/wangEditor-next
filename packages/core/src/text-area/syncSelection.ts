/**
 * @description 同步 selection
 * @author wangfupeng
 */

import scrollIntoView from 'scroll-into-view-if-needed'
import { Range, Transforms } from 'slate'

import { DomEditor } from '../editor/dom-editor'
import { IDomEditor } from '../editor/interface'
import { DOMElement } from '../utils/dom'
import { IS_FIREFOX } from '../utils/ua'
import { EDITOR_TO_ELEMENT, IS_FOCUSED } from '../utils/weak-maps'
import { hasEditableTarget, isTargetInsideNonReadonlyVoid } from './helpers'
import TextArea from './TextArea'

/**
 * editor onchange 时，将 editor selection 同步给 DOM
 * @param textarea textarea
 * @param editor editor
 * @param focus 是否强制更新选区
 */
export function editorSelectionToDOM(textarea: TextArea, editor: IDomEditor, focus = false): void {
  const { selection } = editor
  const config = editor.getConfig()
  const root = DomEditor.findDocumentOrShadowRoot(editor)
  const domSelection = root.getSelection()

  if (!domSelection) { return }
  if (textarea.isComposing && !focus) { return }
  if (!editor.isFocused()) { return }

  const hasDomSelection = domSelection.type !== 'None'

  // If the DOM selection is properly unset, we're done.
  if (!selection && !hasDomSelection) { return }

  // verify that the dom selection is in the editor
  const editorElement = EDITOR_TO_ELEMENT.get(editor)!
  let hasDomSelectionInEditor = false

  if (
    editorElement.contains(domSelection.anchorNode)
    && editorElement.contains(domSelection.focusNode)
  ) {
    hasDomSelectionInEditor = true
  }

  // If the DOM selection is in the editor and the editor selection is already correct, we're done.
  if (hasDomSelection && hasDomSelectionInEditor && selection) {
    const slateRange = DomEditor.toSlateRange(editor, domSelection, {
      exactMatch: true,

      // domSelection is not necessarily a valid Slate range
      // (e.g. when clicking on contentEditable:false element)
      suppressThrow: true,
    })

    if (slateRange && Range.equals(slateRange, selection)) {
      let canReturn = true

      // 选区在 table 时，需要特殊处理
      if (Range.isCollapsed(selection)) {
        const { anchorNode, anchorOffset } = domSelection

        if (anchorNode === editorElement) {
          const childNodes = editorElement.childNodes
          let tableElem

          // 光标在 table 前面时
          tableElem = childNodes[anchorOffset] as DOMElement
          if (tableElem && tableElem.matches('table')) {
            canReturn = false // 不能就此结束，需要重置光标
          }

          // 光标在 table 后面时
          tableElem = childNodes[anchorOffset - 1] as DOMElement
          if (tableElem && tableElem.matches('table')) {
            canReturn = false // 不能就此结束，需要重置光标
          }
        }
      }

      // 其他情况，就此结束
      if (canReturn) { return }
    }
  }

  // when <Editable/> is being controlled through external value
  // then its children might just change - DOM responds to it on its own
  // but Slate's value is not being updated through any operation
  // and thus it doesn't transform selection on its own
  if (selection && !DomEditor.hasRange(editor, selection)) {
    editor.selection = DomEditor.toSlateRange(editor, domSelection, {
      exactMatch: false,
      suppressThrow: false,
    })
    return
  }

  // Otherwise the DOM selection is out of sync, so update it.
  textarea.isUpdatingSelection = true

  const newDomRange = selection && DomEditor.toDOMRange(editor, selection)

  if (newDomRange) {
    if (Range.isBackward(selection!)) {
      domSelection.setBaseAndExtent(
        newDomRange.endContainer,
        newDomRange.endOffset,
        newDomRange.startContainer,
        newDomRange.startOffset,
      )
    } else {
      domSelection.setBaseAndExtent(
        newDomRange.startContainer,
        newDomRange.startOffset,
        newDomRange.endContainer,
        newDomRange.endOffset,
      )
    }

    // 滚动到选区
    const leafEl = newDomRange.startContainer.parentElement! as Element
    const spacer = leafEl.closest('[data-slate-spacer]')

    // 这个 if 防止选中图片时发生滚动
    if (!spacer && newDomRange.getBoundingClientRect) {
      const rangeRect = newDomRange.getBoundingClientRect.bind(newDomRange)
      const rect = rangeRect()
      /**
       * 当在code、table空行回车时，Range.getBoundingClientRect 返回的各项值是：0，执行 scrollIntoView 函数时，会导致计算失效
       * 解决方法：判断是否是这种情况，如果存在则保留dom.getBoundingClientRect作为替代方案
       */

      if (!(rect.top === 0 && rect.right === 0 && rect.bottom === 0 && rect.left === 0 && rect.height === 0 && rect.width === 0)) {
        leafEl.getBoundingClientRect = newDomRange.getBoundingClientRect.bind(newDomRange)
      }

      const body = document.body

      scrollIntoView(leafEl, {
        scrollMode: 'if-needed',
        boundary: config.scroll ? editorElement.parentElement || body : body, // issue 4215
        block: 'end',
        behavior: 'smooth',
      })
      // @ts-ignore
      delete leafEl.getBoundingClientRect
    }
  } else {
    domSelection.removeAllRanges()
  }

  setTimeout(() => {
    // COMPAT: In Firefox, it's not enough to create a range, you also need
    // to focus the contenteditable element too. (2016/11/16)
    if (newDomRange && IS_FIREFOX) {
      editorElement.focus()
    }

    textarea.isUpdatingSelection = false
  })
}

/**
 * DOM selection change 时，把 DOM selection 同步给 slate
 * @param textarea textarea
 * @param editor editor
 */
export function DOMSelectionToEditor(textarea: TextArea, editor: IDomEditor) {
  const { isComposing, isUpdatingSelection, isDraggingInternally } = textarea
  const config = editor.getConfig()

  if (config.readOnly) { return }
  if (isComposing) { return }
  if (isUpdatingSelection) { return }
  if (isDraggingInternally) { return }

  const root = DomEditor.findDocumentOrShadowRoot(editor)
  const { activeElement } = root
  const el = DomEditor.toDOMNode(editor, editor)
  const domSelection = root.getSelection()

  if (activeElement === el) {
    textarea.latestElement = activeElement
    IS_FOCUSED.set(editor, true)
  } else {
    IS_FOCUSED.delete(editor)
    Transforms.deselect(editor)
    return
  }

  if (!domSelection) {
    return Transforms.deselect(editor)
  }

  const { anchorNode, focusNode } = domSelection

  const anchorNodeSelectable = hasEditableTarget(editor, anchorNode) || isTargetInsideNonReadonlyVoid(editor, anchorNode)
  const focusNodeSelectable = hasEditableTarget(editor, focusNode) || isTargetInsideNonReadonlyVoid(editor, focusNode)

  if (anchorNodeSelectable && focusNodeSelectable) {
    const range = DomEditor.toSlateRange(editor, domSelection, {
      exactMatch: false,
      suppressThrow: false,
    })

    Transforms.select(editor, range)
  } else {
    // 禁用此行，让光标选区继续生效
    // Transforms.deselect(editor)
  }
}
