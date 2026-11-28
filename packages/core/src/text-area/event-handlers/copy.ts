/**
 * @description 处理 copy 事件
 * @author wangfupeng
 */

import { writeClipboardFragment } from '../../editor/clipboard'
import { IDomEditor } from '../../editor/interface'
import { hasEditableTarget } from '../helpers'
import TextArea from '../TextArea'

function handleOnCopy(e: Event, _textarea: TextArea, editor: IDomEditor) {
  const event = e as ClipboardEvent

  if (!hasEditableTarget(editor, event.target)) { return }
  const { readOnly } = editor.getConfig()

  if (!readOnly) { event.preventDefault() }

  const data = event.clipboardData

  if (data == null) { return }

  const clipboardFragment = writeClipboardFragment(editor, data, 'copy')

  // Copy has no destructive side effect. Keep calling `customCopy` for legacy
  // writers that return false; only an internal participant that verified and
  // rejected this transfer suppresses it.
  if (clipboardFragment.cancel && clipboardFragment.handled) { return }

  const { customCopy } = editor.getConfig()

  if (customCopy) {
    customCopy(editor, event)
  }
}

export default handleOnCopy
