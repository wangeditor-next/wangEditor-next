import { DomEditor, IDomEditor, isHTMLElememt } from '@wangeditor-next/core'
import throttle from 'lodash.throttle'
import { Editor, Element as SlateElement, Transforms } from 'slate'

import { isOfType } from '../utils'
import $ from '../utils/dom'
import { TableElement, TableRowElement } from './custom-types'

/**
 * 计算行高度的比例
 */
export function getRowHeightRatios(rowHeights: number[]) {
  const rowHeightRatios: number[] = []
  const totalHeight = rowHeights.reduce((a, b) => a + b, 0)

  for (const height of rowHeights) {
    rowHeightRatios.push(height / totalHeight)
  }

  return rowHeightRatios
}

/**
 * 计算累积行高度
 */
function getCumulativeHeights(rowHeights: number[]) {
  const cumulativeHeights: number[] = []
  let totalHeight = 0

  for (const height of rowHeights) {
    totalHeight += height
    cumulativeHeights.push(totalHeight)
  }

  return cumulativeHeights
}

function getRowHeightsForResize(tableNode: TableElement): number[] {
  const { children: tableRows, rowHeights = [] } = tableNode

  const hasValidSnapshot = (
    rowHeights.length === tableRows.length
    && rowHeights.every(height => Number.isFinite(height) && height > 0)
  )

  if (hasValidSnapshot) {
    return rowHeights
  }

  return tableRows.map(row => (row as TableRowElement).height || 30)
}

// 行拖拽相关状态
let isMouseDownForRowResize = false
let clientYWhenMouseDown = 0
let editorWhenMouseDownForRow: IDomEditor | null = null
const $window = $(window)

/**
 * 计算行高度调整
 */
function calculateRowHeights(rowHeights: number[], resizingRowIndex: number, heightChange: number, editor: IDomEditor): number[] {
  const newHeights = [...rowHeights]

  // 获取最小高度配置
  const { minRowHeight = 30 } = editor.getMenuConfig('insertTable') || {}
  const minHeight = parseInt(minRowHeight.toString(), 10) || 30

  // 直接增加当前行的高度，其他行保持不变
  const currentHeight = newHeights[resizingRowIndex]
  const newHeight = Math.max(minHeight, currentHeight + heightChange)

  newHeights[resizingRowIndex] = Math.floor(newHeight * 100) / 100

  return newHeights
}

/**
 * 根据鼠标位置计算行高度
 */
function calculateRowHeightsByBorderPosition(
  rowHeights: number[],
  resizingRowIndex: number,
  mousePositionInTable: number,
  cumulativeHeights: number[],
  editor: IDomEditor,
): number[] {
  const newHeights = [...rowHeights]

  // 检查边界范围
  if (resizingRowIndex < 0 || resizingRowIndex >= rowHeights.length) {
    return newHeights
  }

  // 获取最小高度配置
  const { minRowHeight = 30 } = editor.getMenuConfig('insertTable') || {}
  const minHeight = parseInt(minRowHeight.toString(), 10) || 30

  // 计算当前边界的上边界位置
  const topBoundary = resizingRowIndex === 0 ? 0 : cumulativeHeights[resizingRowIndex - 1]

  // 计算鼠标位置相对于当前行上边界的偏移
  const mouseOffset = mousePositionInTable - topBoundary

  // 确保不小于最小高度
  const newHeight = Math.max(minHeight, mouseOffset)

  // 直接设置当前行的高度，其他行保持不变
  newHeights[resizingRowIndex] = Math.floor(newHeight * 100) / 100

  return newHeights
}

function onMouseMoveForRowHandler(event: Event) {
  if (!isMouseDownForRowResize) { return }
  if (editorWhenMouseDownForRow === null) { return }
  event.preventDefault()

  const { clientY } = event as MouseEvent
  const heightChange = clientY - clientYWhenMouseDown

  const [[elemNode]] = Editor.nodes(editorWhenMouseDownForRow, {
    match: isOfType(editorWhenMouseDownForRow, 'table'),
  })
  const tableNode = elemNode as TableElement
  const { resizingRowIndex = -1 } = tableNode

  // 优先使用 ResizeObserver 采集到的真实 DOM 行高
  const rowHeights = getRowHeightsForResize(tableNode)

  let adjustRowHeights: number[]
  const selectedTableNode = DomEditor.getSelectedNodeByType(editorWhenMouseDownForRow, 'table') as TableElement
  const tableDom = DomEditor.toDOMNode(editorWhenMouseDownForRow, selectedTableNode)

  const tableElement = tableDom.querySelector('.table')

  if (tableElement) {
    const tableRect = tableElement.getBoundingClientRect()
    const mousePositionInTable = clientY - tableRect.top

    // 计算边界的新位置
    const cumulativeHeights = getCumulativeHeights(rowHeights)
    const newBorderPosition = mousePositionInTable

    // 根据新的边界位置计算行高度
    adjustRowHeights = calculateRowHeightsByBorderPosition(rowHeights, resizingRowIndex, newBorderPosition, cumulativeHeights, editorWhenMouseDownForRow)
  } else {
    // 如果找不到表格元素，则使用简单的高度变化逻辑
    adjustRowHeights = calculateRowHeights(rowHeights, resizingRowIndex, heightChange, editorWhenMouseDownForRow)
  }

  // 直接更新对应行元素的高度
  const currentTableNode = DomEditor.getSelectedNodeByType(editorWhenMouseDownForRow, 'table') as TableElement

  if (currentTableNode && resizingRowIndex >= 0 && resizingRowIndex < adjustRowHeights.length) {
    const tablePath = DomEditor.findPath(editorWhenMouseDownForRow, currentTableNode)
    const rowPath = [...tablePath, resizingRowIndex]

    try {
      Transforms.setNodes(
        editorWhenMouseDownForRow,
        { height: adjustRowHeights[resizingRowIndex] } as TableRowElement,
        { at: rowPath },
      )
    } catch (error) {
      // 如果路径不存在，忽略错误
      console.warn('更新行高度失败:', error)
    }
  }
}

const onMouseMoveForRowThrottled = throttle(onMouseMoveForRowHandler, 100)

function onMouseUpForRow(_event: Event) {
  isMouseDownForRowResize = false
  editorWhenMouseDownForRow = null
  document.body.style.cursor = ''

  // 解绑事件
  $window.off('mousemove', onMouseMoveForRowThrottled)
  $window.off('mouseup', onMouseUpForRow)
}

/**
 * 鼠标移动时，判断在哪个行边界上
 */
export function handleRowBorderVisible(
  editor: IDomEditor,
  elemNode: SlateElement,
  e: MouseEvent,
) {
  if (editor.isDisabled()) { return }
  if (isMouseDownForRowResize) { return }

  const tableNode = elemNode as TableElement
  const { isHoverRowBorder, resizingRowIndex } = tableNode

  const { target } = e

  if (isHTMLElememt(target)) {
    const parent = target.closest('.table')

    if (parent) {
      const { clientY: mouseY } = e
      const rect = parent.getBoundingClientRect()

      // 优先使用 ResizeObserver 采集到的真实 DOM 行高
      const actualRowHeights = getRowHeightsForResize(tableNode)
      const cumulativeHeights = getCumulativeHeights(actualRowHeights)

      // 鼠标移动时，计算当前鼠标位置，判断在哪个行边界上
      for (let i = 0; i < cumulativeHeights.length; i += 1) {
        if (
          mouseY - rect.y >= cumulativeHeights[i] - 5
          && mouseY - rect.y < cumulativeHeights[i] + 5
        ) {
          // 节流，防止多次引起Transforms.setNodes重绘
          if (resizingRowIndex === i) { return }
          Transforms.setNodes(
            editor,
            { isHoverRowBorder: true, resizingRowIndex: i } as TableElement,
            { mode: 'highest' },
          )
          return
        }
      }
    }
  }

  // 鼠标移出时，重置
  if (isHoverRowBorder === true) {
    Transforms.setNodes(editor, { isHoverRowBorder: false, resizingRowIndex: -1 } as TableElement, {
      mode: 'highest',
    })
  }
}

/**
 * 设置行拖拽高亮
 */
export function handleRowBorderHighlight(editor: IDomEditor, e: MouseEvent) {
  if (e.type === 'mouseenter') {
    Transforms.setNodes(editor, { isResizingRow: true } as TableElement, { mode: 'highest' })
  } else {
    Transforms.setNodes(editor, { isResizingRow: false } as TableElement, { mode: 'highest' })
  }
}

export function handleRowBorderMouseDown(editor: IDomEditor, _elemNode: SlateElement) {
  if (isMouseDownForRowResize) { return }
  editorWhenMouseDownForRow = editor
}

function onMouseDownForRow(event: Event) {
  const elem = event.target as HTMLElement

  if (elem.tagName === 'DIV' && elem.closest('.row-resizer-item')) {
    if (editorWhenMouseDownForRow === null) { return }

    // 记录必要信息
    isMouseDownForRowResize = true
    const { clientY } = event as MouseEvent

    clientYWhenMouseDown = clientY
    document.body.style.cursor = 'row-resize'
    event.preventDefault()
  }

  $window.on('mousemove', onMouseMoveForRowThrottled)
  $window.on('mouseup', onMouseUpForRow)
}

$window.on('mousedown', onMouseDownForRow)
