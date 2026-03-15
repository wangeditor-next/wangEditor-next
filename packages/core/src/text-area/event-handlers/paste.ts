/**
 * @description 处理 paste 事件
 * @author wangfupeng
 */

import { IDomEditor } from '../../editor/interface'
import { isPlainTextOnlyPaste } from '../../utils/dom'
import { HAS_BEFORE_INPUT_SUPPORT, IS_SAFARI } from '../../utils/ua'
import { EDITOR_TO_CAN_PASTE } from '../../utils/weak-maps'
import { hasEditableTarget } from '../helpers'
import TextArea from '../TextArea'

function handleOnPaste(e: Event, textarea: TextArea, editor: IDomEditor) {
  EDITOR_TO_CAN_PASTE.set(editor, true) // 标记为：可执行默认粘贴

  const event = e as ClipboardEvent
  const { readOnly } = editor.getConfig()

  if (readOnly) { return }
  if (!hasEditableTarget(editor, event.target)) { return }

  const { customPaste } = editor.getConfig()

  if (customPaste) {
    const res = customPaste(editor, event)

    if (res === false) {
      // 自行实现粘贴，不执行默认粘贴
      EDITOR_TO_CAN_PASTE.set(editor, false) // 标记为：不可执行默认粘贴
      event.preventDefault()
      return
    }
  }

  // 如果支持 beforeInput 且不是纯粘贴文本（如 html、图片文件），则使用 beforeInput 来实现
  // 这里只处理：不支持 beforeInput 或者 粘贴纯文本
  if (!IS_SAFARI && HAS_BEFORE_INPUT_SUPPORT && !isPlainTextOnlyPaste(event)) { return }

  event.preventDefault()

  const data = event.clipboardData

  if (data == null) { return }
  editor.insertData(data)
}

export default handleOnPaste
