/**
 * @description slate 插件 - content
 * @author wangfupeng
 */

import {
  Editor, Element, Node, Operation, Path, Range, Text, Transforms,
} from 'slate'

import { IDomEditor } from '../..'
import { IGNORE_TAGS } from '../../constants'
import { htmlToContent } from '../../create/helper'
import { PARSE_ELEM_HTML_CONF, TEXT_TAGS } from '../../parse-html/index'
import parseElemHtml from '../../parse-html/parse-elem-html'
import { genElemId } from '../../render/helper'
import node2html from '../../to-html/node2html'
import $, {
  DOMElement, isDOMElement, isDOMText,
  isUnprocessedListElement,
} from '../../utils/dom'
import { Key } from '../../utils/key'
import { findCurrentLineRange } from '../../utils/line'
import { EDITOR_TO_SELECTION, NODE_TO_KEY } from '../../utils/weak-maps'
import { DomEditor } from '../dom-editor'
import { ElementWithId } from '../interface'

const getMatches = (e: IDomEditor, path: Path) => {
  const matches: [Path, Key][] = []

  for (const [n, p] of Editor.levels(e, { at: path })) {
    const key = DomEditor.findKey(e, n)

    matches.push([p, key])
  }
  return matches
}

/**
 * 把 elem 插入到编辑器
 * @param editor editor
 * @param elem slate elem
 */
function insertElemToEditor(editor: IDomEditor, elem: Element) {
  if (editor.isInline(elem)) {
    // inline elem 直接插入
    editor.insertNode(elem)

    // link 特殊处理，否则后面插入的文字全都在 a 里面 issue#4573
    if (elem.type === 'link') { editor.insertFragment([{ text: '' }]) }
  } else {
    // block elem ，另起一行插入 —— 重要
    Transforms.insertNodes(editor, elem, { mode: 'highest' })
  }
}

export const withContent = <T extends Editor>(editor: T) => {
  const e = editor as T & IDomEditor
  const {
    onChange, insertText, apply, deleteBackward,
  } = e

  e.insertText = (text: string) => {
    const { readOnly } = e.getConfig()

    if (readOnly) { return }

    insertText(text)
  }

  // 重写 apply 方法，参考 slate 最新版本的实现
  e.apply = (op: Operation) => {
    const matches: [Path, Key][] = []

    switch (op.type) {
      case 'insert_text':
      case 'remove_text':
      case 'set_node':
      case 'split_node': {
        matches.push(...getMatches(e, op.path))
        break
      }

      case 'insert_node':
      case 'remove_node': {
        matches.push(...getMatches(e, Path.parent(op.path)))
        break
      }

      case 'merge_node': {
        const prevPath = Path.previous(op.path)

        matches.push(...getMatches(e, prevPath))
        break
      }

      case 'move_node': {
        const commonPath = Path.common(
          Path.parent(op.path),
          Path.parent(op.newPath),
        )

        matches.push(...getMatches(e, commonPath))
        break
      }
      default:
    }

    // 执行原本的 apply
    apply(op)

    // 更新 node 和 key 的映射
    for (const [path, key] of matches) {
      const [node] = Editor.node(e, path)

      NODE_TO_KEY.set(node, key)
    }
  }

  // 重写 deleteBackward，参考 slate 最新版本的实现
  e.deleteBackward = unit => {
    if (unit !== 'line') {
      return deleteBackward(unit)
    }

    if (editor.selection && Range.isCollapsed(editor.selection)) {
      const parentBlockEntry = Editor.above(editor, {
        match: n => Editor.isBlock(editor, n),
        at: editor.selection,
      })

      if (parentBlockEntry) {
        const [, parentBlockPath] = parentBlockEntry
        const parentElementRange = Editor.range(
          editor,
          parentBlockPath,
          editor.selection.anchor,
        )

        const currentLineRange = findCurrentLineRange(e, parentElementRange)

        if (!Range.isCollapsed(currentLineRange)) {
          Transforms.delete(editor, { at: currentLineRange })
        }
      }
    }
  }

  // 重写 onchange API
  e.onChange = () => {
    // 记录当前选区
    const { selection } = e

    if (selection != null) {
      EDITOR_TO_SELECTION.set(e, selection)
    }

    // 触发配置的 change 事件
    e.emit('change')

    onChange()
  }

  // tab
  e.handleTab = () => {
    e.insertText('    ')
  }

  // 获取 html （去掉了格式化 2021.12.10）
  e.getHtml = (): string => {
    const { children = [] } = e
    const html = children.map(child => node2html(child, e)).join('')

    return html
  }

  // 获取 text
  e.getText = (): string => {
    const { children = [] } = e

    return children.map(child => Node.string(child)).join('\n')
  }

  // 获取选区文字
  e.getSelectionText = (): string => {
    const { selection } = e

    if (selection == null) { return '' }
    return Editor.string(editor, selection)
  }

  // 根据 type 获取 elems
  e.getElemsByType = (type: string, isPrefix = false): ElementWithId[] => {
    const elems: ElementWithId[] = []

    // 获取 editor 所有 nodes
    const nodeEntries = Editor.nodes(e, {
      at: [],
      universal: true,
    })

    for (const nodeEntry of nodeEntries) {
      const [node] = nodeEntry

      if (Element.isElement(node)) {
        // 判断 type （前缀 or 全等）
        const flag = isPrefix ? node.type.indexOf(type) >= 0 : node.type === type

        if (flag) {
          const key = DomEditor.findKey(e, node)
          const id = genElemId(node.type, key.id)

          // node + id
          elems.push({
            ...node,
            id,
          })
        }
      }
    }

    return elems
  }

  // 根据 type 前缀，获取 elems
  e.getElemsByTypePrefix = (typePrefix: string): ElementWithId[] => {
    return e.getElemsByType(typePrefix, true)
  }

  /**
   * 判断 editor 是否为空（只有一个空 paragraph）
   */
  e.isEmpty = () => {
    const { children = [] } = e

    if (children.length > 1) { return false } // >1 个顶级节点

    const firstNode = children[0]

    if (firstNode == null) { return true } // editor.children 空数组

    if (!Element.isElement(firstNode) || firstNode.type !== 'paragraph') { return false }
    const { children: texts = [] } = firstNode

    if (texts.length > 1) { return false } // >1 text node
    const t = texts[0]

    return t == null || (Text.isText(t) && t.text === '') // 无 text 节点 or 只有一个 text 且是空字符串
  }

  /**
   * 清空内容
   */
  e.clear = () => {
    const initialEditorValue: Node[] = [
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ]

    Transforms.delete(e, {
      at: {
        anchor: Editor.start(e, []),
        focus: Editor.end(e, []),
      },
    })

    if (e.children.length === 0) {
      Transforms.insertNodes(e, initialEditorValue)
    }
  }

  e.getParentNode = (node: Node) => {
    return DomEditor.getParentNode(e, node)
  }

  /**
   * 插入 html （不保证语义完全正确），用于粘贴
   * @param html html string
   * @param isRecursive 是否递归调用（内部使用，使用者不要传参）
   */
  e.dangerouslyInsertHtml = (html: string = '', isRecursive = false) => {
    if (!html) { return }

    // ------------- 把 html 转换为 DOM nodes -------------
    const div = document.createElement('div')

    div.innerHTML = html
    let domNodes = Array.from(div.childNodes)

    // 过滤一下，只保留 elem 和 text ，并却掉一些无用标签（如 style script 等）
    domNodes = domNodes.filter(n => {
      const { nodeName } = n
      // Text Node

      if (isDOMText(n)) { return true }

      // Element Node
      if (isDOMElement(n)) {
        // 过滤掉忽略的 tag
        if (IGNORE_TAGS.has(nodeName.toLowerCase())) { return false }
        return true
      }
      return false
    })
    if (domNodes.length === 0) { return }

    // ------------- 把 DOM nodes 转换为 slate nodes ，并插入到编辑器 -------------

    const { selection } = e

    if (selection == null) { return }
    let curEmptyParagraphPath: Path | null = null

    // 是否当前选中了一个空 p （如果是，后面会删掉）
    // 递归调用时不判断
    if (DomEditor.isSelectedEmptyParagraph(e) && !isRecursive) {
      const { focus } = selection

      curEmptyParagraphPath = [focus.path[0]] // 只记录顶级 path 即可
    }

    div.setAttribute('hidden', 'true')
    document.body.appendChild(div)

    let insertedElemNum = 0 // 记录插入 elem 的数量 ( textNode 不算 )

    domNodes.forEach((n, index) => {
      const { nodeName, textContent = '' } = n

      // ------ Text node ------
      if (isDOMText(n)) {
        if (!textContent || !textContent.trim()) { return } // 无内容的 Text

        // 插入文本
        // 【注意】insertNode 和 insertText 有区别：后者会继承光标处的文本样式（如加粗）；前者会加入纯文本，无样式；
        e.insertNode({ text: textContent })
        return
      }

      // ------ Element Node ------
      if (nodeName === 'BR') {
        e.insertText('\n') // 换行
        return
      }

      // 判断当前的 el 是否是可识别的 tag
      const el = n as DOMElement
      let isParseMatch = false

      if (TEXT_TAGS.includes(nodeName.toLowerCase())) {
        // text elem，如 <span>
        isParseMatch = true
      } else {
        for (const selector in PARSE_ELEM_HTML_CONF) {
          if (el.matches(selector)) {
            // 普通 elem，如 <p> <a> 等（非 text elem）
            isParseMatch = true
            break
          }
        }
      }

      // 匹配上了，则生成 slate elem 并插入
      if (isParseMatch) {
        // 生成并插入
        const $el = $(el)
        const parsedRes = parseElemHtml($el, e) as Element

        if (Array.isArray(parsedRes)) {
          parsedRes.forEach(parsedEl => insertElemToEditor(e, parsedEl))
          insertedElemNum += 1 // 记录数量
        } else {
          insertElemToEditor(e, parsedRes)
          insertedElemNum += 1 // 记录数量
        }

        // 如果当前选中 void node ，则选区移动一下
        if (DomEditor.isSelectedVoidNode(e)) { e.move(1) }

        return
      }

      // 没有匹配上（如 div ）
      const display = window.getComputedStyle(el).display

      if (!DomEditor.isSelectedEmptyParagraph(e)) {
        // 当前不是空行，且 非 inline - 则换行
        if (display.indexOf('inline') < 0) {
          if (index >= 1) {
            const prevEl = domNodes[index - 1] as DOMElement
            // 如果是 list 列表需要多插入一个回车,模拟双回车删除空 list

            if (isUnprocessedListElement(prevEl)) {
              e.insertBreak()
            }
          }
          e.insertBreak()
        }
      }
      e.dangerouslyInsertHtml(el.innerHTML, true) // 继续插入子内容
    })

    // 删除第一个空行
    if (insertedElemNum && curEmptyParagraphPath) {
      if (DomEditor.isEmptyPath(e, curEmptyParagraphPath)) {
        Transforms.removeNodes(e, { at: curEmptyParagraphPath })
      }
    }

    div.remove() // 粘贴完了，移除 div
  }

  /**
   * 重置 HTML 内容
   * @param html html string
   */
  e.setHtml = (html: string | null = '') => {
    // 记录编辑器当前状态
    const isEditorDisabled = e.isDisabled()
    const isEditorFocused = e.isFocused()
    const editorSelectionStr = JSON.stringify(e.selection)

    // 删除当前内容
    e.enable()
    e.focus()
    // 需要标准的{anchor:xxx, focus: xxxx} 否则无法通过slate history的检查
    // 使用 e.select([]) e.selectAll() 生成的location不是标准的{anchor: xxxx, focus: xxx}形式
    // https://github.com/wangeditor-team/wangeditor/issues/4754
    e.clear()
    // 设置新内容
    const newContent = htmlToContent(e, html == null ? '' : html)

    Transforms.insertFragment(e, newContent)

    // 恢复编辑器状态和选区
    if (!isEditorFocused) {
      e.deselect()
      e.blur()
    }
    if (isEditorDisabled) {
      e.deselect()
      e.disable()
    }
    if (e.isFocused()) {
      try {
        e.select(JSON.parse(editorSelectionStr)) // 选中原来的位置
      } catch (ex) {
        e.select(Editor.start(e, [])) // 选中开始
      }
    }
  }

  return e
}
