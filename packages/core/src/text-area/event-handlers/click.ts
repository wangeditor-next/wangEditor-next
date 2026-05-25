/**
 * @description 处理 click 事件
 * @author wangfupeng
 */

import {
  Editor, Node, Path, Transforms,
} from 'slate'

import { DomEditor } from '../../editor/dom-editor'
import { IDomEditor } from '../../editor/interface'
import { isDOMNode } from '../../utils/dom'
import { hasTarget } from '../helpers'
import TextArea from '../TextArea'

function handleOnClick(event: Event, textarea: TextArea, editor: IDomEditor) {
  const { readOnly } = editor.getConfig()

  if (readOnly) { return }
  if (!hasTarget(editor, event.target)) { return }
  if (!isDOMNode(event.target)) { return }

  const node = DomEditor.toSlateNode(editor, event.target)
  const path = DomEditor.findPath(editor, node)

  // At this time, the Slate document may be arbitrarily different,
  // because onClick handlers can change the document before we get here.
  // Therefore we must check that this path actually exists,
  // and that it still refers to the same node.
  if (Editor.hasPath(editor, path)) {
    const lookupNode = Node.get(editor, path)

    if (lookupNode === node) {
      const start = Editor.start(editor, path)
      const end = Editor.end(editor, path)

      const startVoid = Editor.void(editor, { at: start })
      const endVoid = Editor.void(editor, { at: end })

      if (startVoid && endVoid && Path.equals(startVoid[1], endVoid[1])) {
        const range = Editor.range(editor, start)

        Transforms.select(editor, range)
      }
    }
  }
}

export default handleOnClick
