/**
 * @description editor 插件，重写 editor API
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import {
  Editor, Node, Point,
  Transforms,
} from 'slate'

function insertParagraphBeforeNewline(editor: any) {
  editor.deleteBackward('character') // 删除最后一个 \n

  // 插入一个 paragraph
  const p = { type: 'paragraph', children: [{ text: '' }] }

  Transforms.insertNodes(editor, p, { mode: 'highest' })
}

function withBlockquote<T extends IDomEditor>(editor: T): T {
  const { insertBreak, insertText } = editor
  const newEditor = editor

  // 重写 insertBreak - 换行时插入 p
  newEditor.insertBreak = () => {
    const { selection } = newEditor

    if (selection == null) { return insertBreak() }

    const [nodeEntry] = Editor.nodes(editor, {
      match: n => DomEditor.checkNodeType(n, 'blockquote'),
      universal: true,
    })

    if (!nodeEntry) { return insertBreak() }

    const quoteElem = nodeEntry[0]
    // 如果正在粘贴中，没有 path 可用，则直接换行退出 blockquote
    // TODO: 粘贴未处理其它富文本一个 block 中套两个 div 用作换行的情况

    if (!DomEditor.getParentNode(editor, quoteElem)) {
      insertParagraphBeforeNewline(newEditor)
      return
    }
    const quotePath = DomEditor.findPath(editor, quoteElem)
    const quoteEndLocation = Editor.end(editor, quotePath)

    if (Point.equals(quoteEndLocation, selection.focus)) {
      const lastNode = Editor.last(editor, quoteEndLocation.path)
      // 光标位于 blockquote 最后
      const str = Node.string(lastNode[0])

      if (str && str.slice(-1) === '\n') {
        insertParagraphBeforeNewline(newEditor)
        return
      }
    }

    // 情况情况，插入换行符
    insertText('\n')
  }

  // 返回 editor ，重要！
  return newEditor
}

export default withBlockquote
