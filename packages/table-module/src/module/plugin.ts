/**
 * @description editor 插件，重写 editor API
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import {
  BaseText,
  Descendant,
  Editor,
  Element as SlateElement,
  Location,
  Node,
  NodeEntry,
  Path,
  Point,
  Selection,
  Text,
  Transforms,
} from 'slate'

import { EDITOR_TO_SELECTION } from './weak-maps'
import { withSelection } from './with-selection'

// table cell 内部的删除处理
function deleteHandler(newEditor: IDomEditor): boolean {
  const { selection } = newEditor

  if (selection == null) { return false }

  const [cellNodeEntry] = Editor.nodes(newEditor, {
    match: n => DomEditor.checkNodeType(n, 'table-cell'),
  })

  if (cellNodeEntry) {
    const [, cellPath] = cellNodeEntry
    const start = Editor.start(newEditor, cellPath)

    if (Point.equals(selection.anchor, start)) {
      return true // 阻止删除 cell
    }
  }

  return false
}

// #region 删除 cell 内的换行
/**
 * 判断光标是否在换行符中间 \n|\r
 * @param newEditor
 * @param location
 */
function isHalfBreak(newEditor: IDomEditor, location: Point): boolean {
  const offset = location.offset

  if (offset === 0) { return false }
  const node = Editor.node(newEditor, location)

  if (!Text.isText(node[0])) { return false }

  const text = Node.string((node[0]))

  if (offset >= text.length) { return false }

  return text[offset - 1] === '\n' && text[offset] === '\r'
}

/**
 * 删除 cell 内的换行，光标首尾在同一个位置的情况
 * @param newEditor
 * @returns 是否在内部处理了删除
 */
function deleteCellBreak(newEditor: IDomEditor, unit: Parameters<IDomEditor['deleteBackward']>[0], direction: 'forward' | 'backward'): boolean {
  const { selection } = newEditor

  if (selection == null || unit === 'line') { return false }

  // 判断目标位置是否在同一个 cell 内，不在同一个 cell 内不处理
  const [cellNodeEntry] = Editor.nodes(newEditor, {
    match: n => DomEditor.checkNodeType(n, 'table-cell'),
  })

  // 根据删除的方向及当前的光标位置，获取到真实的删除位置
  let targetPoint: Point | undefined = selection.anchor

  if (direction === 'backward' && selection.anchor.offset === 0) {
    targetPoint = Editor.before(newEditor, selection)
  }

  if (direction === 'forward' && Editor.isEnd(newEditor, selection.anchor, selection.anchor.path)) {
    targetPoint = Editor.after(newEditor, selection)
  }

  if (targetPoint == null) { return false }
  const aboveCell = Editor.above(newEditor, {
    at: targetPoint,
    match: n => DomEditor.checkNodeType(n, 'table-cell'),
  })

  if (aboveCell == null || cellNodeEntry == null || !Path.equals(aboveCell[1], cellNodeEntry[1])) { return false }
  const targetNode = Editor.node(newEditor, targetPoint)

  if (!Text.isText(targetNode[0]) || targetNode[0].text.length < 2) { return false } // 如果存在\n\r，那长度必定大于2

  // 处理光标在换行符首/尾的情况,|表示光标  |\n\r   \n\r|
  const parameters: Parameters<typeof String.prototype.slice> = direction === 'backward'
    ? [targetPoint.offset - 2, targetPoint.offset]
    : [targetPoint.offset, targetPoint.offset + 2]

  const nodeText = Node.string(targetNode[0])
  const isBreak = nodeText.slice(...parameters) === '\n\r'

  if (isBreak) {
    Transforms.insertText(newEditor, nodeText.slice(0, parameters[0]) + nodeText.slice(parameters[1]), {
      at: {
        anchor: Editor.start(newEditor, targetPoint.path),
        focus: Editor.end(newEditor, targetPoint.path),
      },
    })
    return true
  }

  // 处理光标在换行符中间的情况
  if (isHalfBreak(newEditor, targetPoint)) {
    Transforms.insertText(newEditor, nodeText.slice(0, selection.anchor.offset - 1) + nodeText.slice(selection.anchor.offset + 1), {
      at: {
        anchor: Editor.start(newEditor, targetPoint.path),
        focus: Editor.end(newEditor, targetPoint.path),
      },
    })
    return true
  }

  return false
}
// #endregion

/**
 * 判断该 location 有没有命中 table
 * @param editor editor
 * @param location location
 */
function isTableLocation(editor: IDomEditor, location: Location): boolean {
  const tables = Editor.nodes(editor, {
    at: location,
    match: n => {
      const type = DomEditor.getNodeType(n)

      return type === 'table'
    },
  })

  const hasTable = !![...tables].find(() => true)

  return hasTable
}

function withTable<T extends IDomEditor>(editor: T): T {
  const {
    insertBreak,
    deleteBackward,
    deleteForward,
    deleteFragment,
    normalizeNode,
    insertData,
    handleTab,
    selectAll,
  } = editor
  const newEditor = editor

  // 重写 insertBreak - cell 内换行，只换行文本，不拆分 node
  newEditor.insertBreak = () => {
    const selectedNode = DomEditor.getSelectedNodeByType(newEditor, 'table')

    if (selectedNode != null) {
      // 选中了 table ，则在 cell 内换行
      newEditor.insertText('\n\r')
      return
    }

    // 未选中 table ，默认的换行
    insertBreak()
  }

  // 重写 delete - cell 内删除，只删除文字，不删除 node
  newEditor.deleteBackward = unit => {
    const res = deleteHandler(newEditor)

    if (res) { return } // 命中 table cell ，自己处理删除

    if (deleteCellBreak(newEditor, unit, 'backward')) { return } // 命中了 cell 内删除换行符，自行处理删除

    // 防止从 table 后面的 p 删除时，删除最后一个 cell - issues/4221
    const { selection } = newEditor

    if (selection) {
      const before = Editor.before(newEditor, selection) // 前一个 location
      const tableCell = Editor.above(newEditor, {
        at: selection,
        match: n => DomEditor.checkNodeType(n, 'table-cell'),
      })

      if (before) {
        const isTableOnBeforeLocation = isTableLocation(newEditor, before) // before 是否是 table
        // 如果前面是 table, 当前是 paragraph ，则不执行删除。否则会删除 table 最后一个 cell
        // 兼容了 table 嵌套 p标签元素 selection数组五层的情况 - issues/342

        if (!tableCell && isTableOnBeforeLocation && DomEditor.getSelectedNodeByType(newEditor, 'paragraph')) {
          return
        }
      }
    }

    // 执行默认的删除
    deleteBackward(unit)
  }

  // 重写 handleTab 在table内按tab时跳到下一个单元格
  newEditor.handleTab = () => {
    const selectedNode = DomEditor.getSelectedNodeByType(newEditor, 'table')

    if (selectedNode) {
      const above = Editor.above(editor) as NodeEntry<SlateElement>

      // 常规情况下选中文字外层 table-cell 进行跳转
      if (DomEditor.checkNodeType(above[0], 'table-cell')) {
        Transforms.select(editor, above[1])
      }

      let next = Editor.next(editor)

      if (next) {
        if (next[0] && (next[0] as BaseText).text) {
          // 多个单元格同时选中按 tab 导致错位修复
          next = (Editor.above(editor, { at: next[1] }) as NodeEntry<Descendant>) ?? next
        }
        Transforms.select(editor, next[1])
      } else {
        const topLevelNodes = newEditor.children || []
        const topLevelNodesLength = topLevelNodes.length
        // 在最后一个单元格按tab时table末尾如果没有p则插入p后光标切到p上

        if (DomEditor.checkNodeType(topLevelNodes[topLevelNodesLength - 1], 'table')) {
          const p = DomEditor.genEmptyParagraph()

          Transforms.insertNodes(newEditor, p, { at: [topLevelNodesLength] })
          // 在表格末尾插入p后再次执行使光标切到p上
          newEditor.handleTab()
        }
      }
      return
    }

    handleTab()
  }

  newEditor.deleteForward = unit => {
    const res = deleteHandler(newEditor)

    if (res) { return }

    if (deleteCellBreak(newEditor, unit, 'forward')) { return }

    // 防止从 table 前面的 p 删除时，删除第一个 cell
    const { selection } = newEditor

    if (selection) {
      const after = Editor.after(newEditor, selection) // 后一个 location
      const tableCell = Editor.above(newEditor, {
        at: selection,
        match: n => DomEditor.checkNodeType(n, 'table-cell'),
      })

      if (after) {
        const isTableOnAfterLocation = isTableLocation(newEditor, after) // after 是否是 table
        // 如果后面是 table, 当前是 paragraph，则不执行删除

        if (!tableCell && isTableOnAfterLocation && DomEditor.getSelectedNodeByType(newEditor, 'paragraph')) {
          return
        }
      }
    }

    // 执行默认的删除
    deleteForward(unit)
  }

  // 重写区域选中的删除，修正可能半选的换行符
  newEditor.deleteFragment = unit => {
    const { selection } = newEditor

    if (!selection) { return }
    let hasChange = false
    const newSelection: Selection = {
      anchor: selection.anchor,
      focus: selection.focus,
    }
    // 是否是从左到右的选区
    const isLeftToRight = Point.isBefore(newSelection.anchor, newSelection.focus)

    if (isHalfBreak(newEditor, selection.anchor)) {
      const nv = Editor[isLeftToRight ? 'before' : 'after'](newEditor, selection.anchor)

      if (nv) {
        newSelection.anchor = nv
      }
      hasChange = true
    }
    if (isHalfBreak(newEditor, selection.focus)) {
      const nv = Editor[isLeftToRight ? 'after' : 'before'](newEditor, selection.focus)

      if (nv) {
        newSelection.focus = nv
      }
      hasChange = true
    }
    if (hasChange) {
      Transforms.setSelection(newEditor, newSelection)
    }
    deleteFragment(unit)
  }

  // 重新 normalize
  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node)

    if (type !== 'table') {
      // 未命中 table ，执行默认的 normalizeNode
      return normalizeNode([node, path])
    }

    // -------------- table 是 editor 最后一个节点，需要后面插入 p --------------
    const isLast = DomEditor.isLastNode(newEditor, node)

    if (isLast) {
      const p = DomEditor.genEmptyParagraph()

      Transforms.insertNodes(newEditor, p, { at: [path[0] + 1] })
    }
  }

  // 重写 insertData - 粘贴文本
  newEditor.insertData = (data: DataTransfer) => {
    const tableNode = DomEditor.getSelectedNodeByType(newEditor, 'table')

    if (tableNode == null) {
      insertData(data) // 执行默认的 insertData
      return
    }

    // 获取文本，并插入到 cell
    const text = data.getData('text/plain')

    // 单图或图文 插入
    if (text === '\n' || /<img[^>]+>/.test(data.getData('text/html'))) {
      insertData(data)
      return
    }

    Editor.insertText(newEditor, text)
  }

  // 重写 table-cell 中的全选
  newEditor.selectAll = () => {
    const selection = newEditor.selection

    if (selection == null) {
      selectAll()
      return
    }

    const cell = DomEditor.getSelectedNodeByType(newEditor, 'table-cell')

    if (cell == null) {
      selectAll()
      return
    }

    const { anchor, focus } = selection

    if (!Path.equals(anchor.path.slice(0, 3), focus.path.slice(0, 3))) {
      // 选中了多个 cell ，忽略
      selectAll()
      return
    }

    const text = Node.string(cell)
    const textLength = text.length

    if (textLength === 0) {
      selectAll()
      return
    }

    const path = DomEditor.findPath(newEditor, cell)
    const start = Editor.start(newEditor, path)
    const end = Editor.end(newEditor, path)
    const newSelection = {
      anchor: start,
      focus: end,
    }

    newEditor.select(newSelection) // 选中 table-cell 内部的全部文字
  }

  /**
   * 光标选区行为新增
   */
  withSelection(newEditor)

  /**
   * 添加获取表格批量选择的方法
   */
  newEditor.getTableSelection = () => {
    return EDITOR_TO_SELECTION.get(newEditor) || null
  }

  /**
   * 重写mark和node操作方法以支持表格批量选择
   */
  const { addMark: originalAddMark, removeMark: originalRemoveMark } = newEditor
  const originalTransforms = { ...Transforms }

  newEditor.addMark = (key: string, value: any) => {
    const tableSelection = EDITOR_TO_SELECTION.get(newEditor)

    if (tableSelection && tableSelection.length > 0) {
      // 表格批量选择：对每个选中的单元格应用mark
      // 保存当前选择状态
      const originalSelection = newEditor.selection

      tableSelection.forEach(row => {
        row.forEach(cell => {
          const [, cellPath] = cell[0]

          // 为每个单元格设置选择范围（选中整个单元格的内容）
          const start = Editor.start(newEditor, cellPath)
          const end = Editor.end(newEditor, cellPath)

          // 设置选择范围到当前单元格
          Transforms.select(newEditor, { anchor: start, focus: end })

          // 在当前单元格范围内应用原始的 addMark 方法
          originalAddMark(key, value)
        })
      })

      // 恢复原始选择状态
      if (originalSelection) {
        Transforms.select(newEditor, originalSelection)
      }
    } else {
      // 常规选择：使用原有逻辑
      originalAddMark(key, value)
    }
  }

  newEditor.removeMark = (key: string) => {
    const tableSelection = EDITOR_TO_SELECTION.get(newEditor)

    if (tableSelection && tableSelection.length > 0) {
      // 表格批量选择：对每个选中的单元格移除mark
      // 保存当前选择状态
      const originalSelection = newEditor.selection

      tableSelection.forEach(row => {
        row.forEach(cell => {
          const [, cellPath] = cell[0]

          // 为每个单元格设置选择范围（选中整个单元格的内容）
          const start = Editor.start(newEditor, cellPath)
          const end = Editor.end(newEditor, cellPath)

          // 设置选择范围到当前单元格
          Transforms.select(newEditor, { anchor: start, focus: end })

          // 在当前单元格范围内应用原始的 removeMark 方法
          originalRemoveMark(key)
        })
      })

      // 恢复原始选择状态
      if (originalSelection) {
        Transforms.select(newEditor, originalSelection)
      }
    } else {
      // 常规选择：使用原有逻辑
      originalRemoveMark(key)
    }
  }

  /**
   * 重写Transforms.setNodes以支持表格批量选择（如对齐功能）
   */
  Transforms.setNodes = (targetEditor, props, options = {}) => {
    // 只有当传入的editor是当前newEditor且有表格选择时才特殊处理
    if (targetEditor === newEditor) {
      const tableSelection = EDITOR_TO_SELECTION.get(newEditor)

      if (tableSelection && tableSelection.length > 0) {
        // 排除合并单元格操作
        if ((props as any).hidden || (props as any).rowSpan || (props as any).colSpan) {
          originalTransforms.setNodes(targetEditor, props, options)
          return
        }
        // 表格批量选择：对所有选中的单元格应用属性
        tableSelection.forEach(row => {
          row.forEach(cell => {
            const [, cellPath] = cell[0]

            originalTransforms.setNodes(targetEditor, props, {
              ...options,
              at: cellPath,
            })
          })
        })
        return
      }
    }

    // 常规情况：使用原有逻辑
    originalTransforms.setNodes(targetEditor, props, options)
  }

  // 可继续修改其他 newEditor API ...

  // 返回 editor ，重要！
  return newEditor
}

export default withTable
