/**
 * @description header helper
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Editor, Transforms } from 'slate'

type HeadingType = 'header1' | 'header2' | 'header3' | 'header4' | 'header5' | 'header6'

function isHeadingType(type: string): type is HeadingType {
  return /^header[1-6]$/.test(type)
}

/**
 * 获取 node type（'header1' 'header2' 等），未匹配则返回 'paragraph'
 */
export function getHeaderType(editor: IDomEditor): string {
  const [match] = Editor.nodes(editor, {
    match: n => {
      const type = DomEditor.getNodeType(n)
      const headingType = (n as any).headingType

      return type.startsWith('header') || /^header[1-6]$/.test(headingType)
    },
    universal: true,
  })

  // 未匹配到 header
  if (match == null) { return 'paragraph' }

  // 匹配到 header
  const [n] = match

  return (n as any).headingType || DomEditor.getNodeType(n)
}

export function isMenuDisabled(editor: IDomEditor): boolean {
  if (editor.selection == null) { return true }

  const [nodeEntry] = Editor.nodes(editor, {
    match: n => {
      const type = DomEditor.getNodeType(n)

      // 只可用于 p、header 和有序列表中的标题
      if (type === 'paragraph') { return true }
      if (type.startsWith('header')) { return true }
      if (type === 'list-item' && (n as any).ordered === true) { return true }

      return false
    },
    universal: true,
    mode: 'highest', // 匹配最高层级
  })

  // 匹配到 p header ，不禁用
  if (nodeEntry) {
    return false
  }
  // 未匹配到 p header ，则禁用
  return true
}

/**
 * 设置 node type （'header1' 'header2' 'paragraph' 等）
 */
export function setHeaderType(editor: IDomEditor, type: string) {
  if (!type) { return }

  const entries = Array.from(
    Editor.nodes(editor, {
      match: node => {
        const nodeType = DomEditor.getNodeType(node)

        return nodeType === 'paragraph' || nodeType.startsWith('header') || nodeType === 'list-item'
      },
      mode: 'highest',
    })
  )

  Editor.withoutNormalizing(editor, () => {
    entries.forEach(([node, path]) => {
      if (DomEditor.getNodeType(node) !== 'list-item') {
        Transforms.setNodes(editor, { type }, { at: path })
        return
      }

      const listNode = node as any
      const heading = isHeadingType(type) ? type : undefined
      const level = heading ? Number.parseInt(heading.slice('header'.length), 10) - 1 : listNode.level

      Transforms.setNodes(
        editor,
        {
          headingType: heading,
          listMode: heading && listNode.ordered ? 'outline' : undefined,
          level,
        },
        { at: path }
      )
    })
  })
}
