/**
 * @description 处理 cut 事件
 * @author wangfupeng
 */

import {
  Editor, Element, Node, Range, Transforms,
} from 'slate'

import { writeClipboardFragment } from '../../editor/clipboard'
import { IDomEditor } from '../../editor/interface'
import { hasEditableTarget } from '../helpers'
import TextArea from '../TextArea'

function handleOnCut(e: Event, textarea: TextArea, editor: IDomEditor) {
  const event = e as ClipboardEvent
  const { selection } = editor
  const { readOnly } = editor.getConfig()

  if (readOnly) { return }
  event.preventDefault()
  if (!hasEditableTarget(editor, event.target)) { return }

  const data = event.clipboardData

  if (data == null) { return }

  const clipboardFragment = writeClipboardFragment(editor, data, 'cut')

  // A writer that explicitly failed, or an internal participant that verified
  // its own transfer and failed, must not delete the source.
  if (clipboardFragment.cancel) { return }

  if (selection) {
    if (Range.isExpanded(selection)) {
      Editor.deleteFragment(editor)
    } else {
      const node = Node.parent(editor, selection.anchor.path)

      if (Element.isElement(node) && Editor.isVoid(editor, node)) {
        Transforms.delete(editor)
      }
    }
  }
}

export default handleOnCut
