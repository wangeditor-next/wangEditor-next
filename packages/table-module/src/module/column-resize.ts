import { IDomEditor, isHTMLElememt } from '@wangeditor-next/core'
import throttle from 'lodash.throttle'
import { Editor, Element as SlateElement, Transforms } from 'slate'

import { isOfType } from '../utils'
import $ from '../utils/dom'
import { TableElement } from './custom-types'

/** *
 * 计算 cell border 距离 table 左侧距离
 */
function getCumulativeWidths(columnWidths: number[]) {
  const cumulativeWidths: number[] = []
  let totalWidth = 0

  for (const width of columnWidths) {
    totalWidth += width
    cumulativeWidths.push(totalWidth)
  }

  return cumulativeWidths
}

/** *
 * 用于计算拖动 cell 时，cell 宽度变化的比例
 */
export function getColumnWidthRatios(columnWidths: number[]) {
  const columnWidthsRatio: number[] = []
  const totalWidth = columnWidths.reduce((a, b) => a + b, 0)

  for (const width of columnWidths) {
    columnWidthsRatio.push(width / totalWidth)
  }

  return columnWidthsRatio
}

/**
 * 监听 table 内部变化，如新增行、列，删除行列等操作，引起的高度变化。
 * ResizeObserver 需要即时释放，以免引起内存泄露
 */
let resizeObserver: ResizeObserver | null = null

export function observerTableResize(editor: IDomEditor, elm: Node | undefined) {
  if (isHTMLElememt(elm)) {
    const table = elm.querySelector('table')

    if (table) {
      resizeObserver = new ResizeObserver(([{ contentRect }]) => {
        // 当非拖动引起的宽度变化，需要调整 columnWidths
        Transforms.setNodes(
          editor,
          {
            scrollWidth: contentRect.width,
            height: contentRect.height,
          } as TableElement,
          { mode: 'highest' },
        )
      })
      resizeObserver.observe(table)
    }
  }
}

export function unObserveTableResize() {
  if (resizeObserver) {
    resizeObserver?.disconnect()
    resizeObserver = null
  }
}

// 是否为光标选区行为
let isSelectionOperation = false
// 拖拽列宽相关信息
let isMouseDownForResize = false
let clientXWhenMouseDown = 0
let cellWidthWhenMouseDown = 0
let editorWhenMouseDown: IDomEditor | null = null
const $window = $(window)

function onMouseDown(event: Event) {
  const elem = event.target as HTMLElement
  // 判断是否为光标选区行为，对列宽变更行为进行过滤
  // console.log('onMouseDown', elem)

  if (elem.closest('[data-block-type="table-cell"]')) {
    isSelectionOperation = true
  } else if (elem.tagName === 'DIV' && elem.closest('.column-resizer-item')) {
    if (editorWhenMouseDown === null) { return }

    const [[elemNode]] = Editor.nodes(editorWhenMouseDown, {
      match: isOfType(editorWhenMouseDown, 'table'),
    })
    const { columnWidths = [], resizingIndex = -1 } = elemNode as TableElement

    // 记录必要信息
    isMouseDownForResize = true
    const { clientX } = event as MouseEvent

    clientXWhenMouseDown = clientX
    cellWidthWhenMouseDown = columnWidths[resizingIndex]
    document.body.style.cursor = 'col-resize'
    event.preventDefault()
  }

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  $window.on('mousemove', onMouseMove)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  $window.on('mouseup', onMouseUp)
}

$window.on('mousedown', onMouseDown)

/**
 * 计算等比例调整所有列宽度（用于最右侧列拖动）
 */
function calculateProportionalWidths(columnWidths: number[], resizingIndex: number, newRightmostWidth: number): number[] {
  const currentTotalWidth = columnWidths.reduce((a, b) => a + b, 0)
  const currentRightmostWidth = columnWidths[resizingIndex]

  // 确保最右侧列不小于最小宽度
  const actualNewRightmostWidth = Math.max(10, newRightmostWidth)

  // 计算新的总宽度
  const newTotalWidth = currentTotalWidth - currentRightmostWidth + actualNewRightmostWidth

  // 如果新总宽度太小，则设置最小总宽度
  const minTotalWidth = columnWidths.length * 10 // 每列至少10px

  if (newTotalWidth < minTotalWidth) {
    // 如果新总宽度小于最小值，则所有列都设为最小宽度
    return columnWidths.map(() => 10)
  }

  // 计算其他列的总宽度
  const otherColumnsCurrentWidth = currentTotalWidth - currentRightmostWidth
  const otherColumnsNewWidth = newTotalWidth - actualNewRightmostWidth

  // 如果其他列需要的总宽度为0或负数，则只保留最右侧列
  if (otherColumnsNewWidth <= 0) {
    const result = columnWidths.map(() => 10)

    result[resizingIndex] = Math.max(10, newTotalWidth - (columnWidths.length - 1) * 10)
    return result
  }

  // 计算其他列的缩放比例
  const otherColumnsScaleFactor = otherColumnsCurrentWidth > 0 ? otherColumnsNewWidth / otherColumnsCurrentWidth : 1

  // 调整所有列宽度
  const newWidths = columnWidths.map((width, index) => {
    if (index === resizingIndex) {
      // 最右侧列直接使用新宽度
      return Math.floor(actualNewRightmostWidth * 100) / 100
    }
    // 其他列按比例调整
    const newWidth = width * otherColumnsScaleFactor

    return Math.max(10, Math.floor(newWidth * 100) / 100)

  })

  // 由于最小宽度限制，可能导致总宽度偏差，需要微调最右侧列
  const actualTotalWidth = newWidths.reduce((a, b) => a + b, 0)
  const widthDifference = newTotalWidth - actualTotalWidth

  if (Math.abs(widthDifference) > 0.01) {
    newWidths[resizingIndex] = Math.max(10, newWidths[resizingIndex] + widthDifference)
  }

  return newWidths
}

/**
 * 计算相邻列宽度调整（用于中间列拖动）
 */
function calculateAdjacentWidths(columnWidths: number[], resizingIndex: number, widthChange: number): number[] {
  const newWidths = [...columnWidths]

  // 找到右侧的相邻列进行调整
  const adjacentIndex = resizingIndex + 1

  if (adjacentIndex >= newWidths.length) {
    // 如果没有右侧相邻列，则不进行调整
    return newWidths
  }

  const leftColumnWidth = newWidths[resizingIndex]
  const rightColumnWidth = newWidths[adjacentIndex]

  // 计算边界可以移动的范围
  const minLeftWidth = 10
  const minRightWidth = 10
  const maxLeftWidth = leftColumnWidth + rightColumnWidth - minRightWidth

  // 计算新的左列宽度（边界直接跟随鼠标）
  let newLeftWidth = leftColumnWidth + widthChange

  // 限制左列宽度在允许范围内
  newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth))

  // 计算新的右列宽度（确保总宽度不变）
  const newRightWidth = leftColumnWidth + rightColumnWidth - newLeftWidth

  // 应用新宽度
  newWidths[resizingIndex] = Math.floor(newLeftWidth * 100) / 100
  newWidths[adjacentIndex] = Math.floor(newRightWidth * 100) / 100

  return newWidths
}

/**
 * 根据鼠标位置计算列宽度
 * @param columnWidths 当前列宽度数组
 * @param resizingIndex 正在调整的边界索引
 * @param mousePositionInTable 鼠标相对于表格左边的位置
 * @param cumulativeWidths 列宽度的累积和数组
 * @returns 调整后的列宽度数组
 */
function calculateAdjacentWidthsByBorderPosition(
  columnWidths: number[],
  resizingIndex: number,
  mousePositionInTable: number,
  cumulativeWidths: number[],
): number[] {
  const newWidths = [...columnWidths]

  // 检查边界范围
  if (resizingIndex < 0 || resizingIndex >= columnWidths.length) {
    return newWidths
  }

  // 计算当前边界的左边界位置（前面所有列的宽度总和）
  const leftBoundary = resizingIndex === 0 ? 0 : cumulativeWidths[resizingIndex - 1]

  // 计算当前边界的右边界位置（包括当前列和下一列的宽度）
  const rightBoundary = resizingIndex + 1 < columnWidths.length
    ? cumulativeWidths[resizingIndex + 1]
    : cumulativeWidths[resizingIndex]

  // 计算允许的边界移动范围
  const minBorderPosition = leftBoundary + 10 // 左列最小宽度
  const maxBorderPosition = rightBoundary - 10 // 右列最小宽度

  // 限制鼠标位置在允许范围内
  const clampedMousePosition = Math.max(minBorderPosition, Math.min(maxBorderPosition, mousePositionInTable))

  // 计算新的左列宽度（第resizingIndex列）
  const newLeftWidth = clampedMousePosition - leftBoundary

  // 计算新的右列宽度（第resizingIndex+1列）
  const adjacentIndex = resizingIndex + 1

  if (adjacentIndex < columnWidths.length) {
    const currentTwoColumnsWidth = columnWidths[resizingIndex] + columnWidths[adjacentIndex]
    const newRightWidth = currentTwoColumnsWidth - newLeftWidth

    // 应用新宽度
    newWidths[resizingIndex] = Math.floor(newLeftWidth * 100) / 100
    newWidths[adjacentIndex] = Math.floor(newRightWidth * 100) / 100
  }

  return newWidths
}

const onMouseMove = throttle((event: Event) => {
  if (!isMouseDownForResize) { return }
  if (editorWhenMouseDown === null) { return }
  event.preventDefault()

  const { clientX } = event as MouseEvent
  const widthChange = clientX - clientXWhenMouseDown // 计算宽度变化

  const [[elemNode]] = Editor.nodes(editorWhenMouseDown, {
    match: isOfType(editorWhenMouseDown, 'table'),
  })
  const { columnWidths = [], resizingIndex = -1 } = elemNode as TableElement

  let adjustColumnWidths: number[]

  // 判断是否为最右侧列
  const isRightmostColumn = resizingIndex === columnWidths.length - 1

  if (isRightmostColumn) {
    // 最右侧列：等比例调整所有列宽度
    const newRightmostWidth = cellWidthWhenMouseDown + widthChange

    adjustColumnWidths = calculateProportionalWidths(columnWidths, resizingIndex, newRightmostWidth)
  } else {
    // 中间列：计算边界的绝对位置
    const tableElement = document.querySelector('.table')

    if (tableElement) {
      const tableRect = tableElement.getBoundingClientRect()
      const mousePositionInTable = clientX - tableRect.left // 鼠标相对于表格左边的位置

      // 计算边界的新位置
      const cumulativeWidths = getCumulativeWidths(columnWidths)
      const newBorderPosition = mousePositionInTable

      // 根据新的边界位置计算列宽度
      adjustColumnWidths = calculateAdjacentWidthsByBorderPosition(columnWidths, resizingIndex, newBorderPosition, cumulativeWidths)
    } else {
      // 如果找不到表格元素，则使用原来的逻辑
      adjustColumnWidths = calculateAdjacentWidths(columnWidths, resizingIndex, widthChange)
    }
  }

  // 检查容器宽度限制（仅对最右侧列生效）
  if (isRightmostColumn) {
    const containerElement = document.querySelector('.table-container')

    if (containerElement) {
      const newTotalWidth = adjustColumnWidths.reduce((a, b) => a + b, 0)
      const minTableWidth = columnWidths.length * 10 // 最小表格宽度
      const maxTableWidth = containerElement.clientWidth - 1// 最大表格宽度

      // 如果新宽度小于最小宽度，则使用最小宽度
      if (newTotalWidth < minTableWidth) {
        adjustColumnWidths = columnWidths.map(() => 10)
      } else if (newTotalWidth > maxTableWidth) {
        // 如果新宽度超过容器宽度，则限制在容器宽度内
        // 计算允许的最大最右侧列宽度
        const otherColumnsWidth = adjustColumnWidths.slice(0, -1).reduce((a, b) => a + b, 0)
        const maxRightmostWidth = Math.max(10, maxTableWidth - otherColumnsWidth)

        // 重新计算等比例调整后的列宽度，限制在最大宽度内
        adjustColumnWidths = calculateProportionalWidths(columnWidths, resizingIndex, maxRightmostWidth)

        // 确保总宽度不超过容器宽度
        const finalTotalWidth = adjustColumnWidths.reduce((a, b) => a + b, 0)

        if (finalTotalWidth > maxTableWidth) {
          // 如果仍然超过，则按比例缩小所有列
          const scaleFactor = maxTableWidth / finalTotalWidth

          adjustColumnWidths = adjustColumnWidths.map(width => Math.max(10, Math.floor(width * scaleFactor * 100) / 100))
        }
      }
    }
  }

  // 应用新的列宽度
  Transforms.setNodes(editorWhenMouseDown, { columnWidths: adjustColumnWidths } as TableElement, {
    mode: 'highest',
  })
}, 100)

function onMouseUp(_event: Event) {
  isSelectionOperation = false
  isMouseDownForResize = false
  editorWhenMouseDown = null
  document.body.style.cursor = ''

  // 解绑事件
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  $window.off('mousemove', onMouseMove)
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  $window.off('mouseup', onMouseUp)
}
/**
 * 鼠标移动时，判断在哪个 Cell border 上
 * Class 先 visible 后 highlight @跟随飞书
 * 避免光标选区功能收到干扰
 */
export function handleCellBorderVisible(
  editor: IDomEditor,
  elemNode: SlateElement,
  e: MouseEvent,
  scrollWidth: number,
) {
  if (editor.isDisabled()) { return }
  if (isSelectionOperation || isMouseDownForResize) { return }

  const {
    width: tableWidth = 'auto',
    columnWidths = [],
    isHoverCellBorder,
    resizingIndex,
  } = elemNode as TableElement

  // Cell Border 宽度为 10px
  const { clientX, target } = e
  // 当单元格合并的时候，鼠标在 cell 中间，则不显示 cell border

  if (isHTMLElememt(target)) {
    const rect = target.getBoundingClientRect()

    if (clientX > rect.x + 5 && clientX < rect.x + rect.width - 5) {
      if (isHoverCellBorder) {
        Transforms.setNodes(
          editor,
          { isHoverCellBorder: false, resizingIndex: -1 } as TableElement,
          { mode: 'highest' },
        )
      }
      return
    }
  }
  if (isHTMLElememt(target)) {
    const parent = target.closest('.table')

    if (parent) {
      // eslint-disable-next-line @typescript-eslint/no-shadow
      const { clientX } = e
      const rect = parent.getBoundingClientRect()
      const widths = tableWidth === '100%'
        ? getColumnWidthRatios(columnWidths).map(v => v * scrollWidth)
        : columnWidths

      const cumulativeWidths = getCumulativeWidths(widths)

      // 鼠标移动时，计算当前鼠标位置，判断在哪个 Cell border 上
      for (let i = 0; i < cumulativeWidths.length; i += 1) {
        if (
          clientX - rect.x >= cumulativeWidths[i] - 5
          && clientX - rect.x < cumulativeWidths[i] + 5
        ) {
          // 节流，防止多次引起Transforms.setNodes重绘
          if (resizingIndex === i) { return }
          Transforms.setNodes(
            editor,
            { isHoverCellBorder: true, resizingIndex: i } as TableElement,
            { mode: 'highest' },
          )
          return
        }
      }
    }
  }

  // 鼠标移出时，重置
  if (isHoverCellBorder === true) {
    Transforms.setNodes(editor, { isHoverCellBorder: false, resizingIndex: -1 } as TableElement, {
      mode: 'highest',
    })
  }
}

/**
 * 设置 class highlight
 * 将 render-cell.tsx 拖动功能迁移至 div.column-resize
 */
export function handleCellBorderHighlight(editor: IDomEditor, e: MouseEvent) {
  if (e.type === 'mouseenter') {
    Transforms.setNodes(editor, { isResizing: true } as TableElement, { mode: 'highest' })
  } else {
    Transforms.setNodes(editor, { isResizing: false } as TableElement, { mode: 'highest' })
  }
}

export function handleCellBorderMouseDown(editor: IDomEditor, _elemNode: SlateElement) {
  if (isMouseDownForResize) { return } // 此时正在修改列宽
  editorWhenMouseDown = editor
}
