/**
 * @description render table
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import debounce from 'lodash.debounce'
import {
  Editor,
  Element as SlateElement,
  Path, Point, Range,
} from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, jsx, VNode } from 'snabbdom'

import {
  getColumnWidthRatios,
  handleCellBorderHighlight,
  handleCellBorderMouseDown,
  handleCellBorderVisible,
  observerTableResize,
  unObserveTableResize,
} from '../column-resize'
import { TableElement, TableRowElement } from '../custom-types'
import {
  handleRowBorderHighlight,
  handleRowBorderMouseDown,
  handleRowBorderVisible,
} from '../row-resize'
import { TableCursor } from '../table-cursor'

/**
 * 计算 table 是否可编辑。如果选区跨域 table 和外部内容，删除，会导致 table 结构打乱。所以，有时要让 table 不可编辑
 * @param editor editor
 * @param tableElem table elem
 */
function getContentEditable(editor: IDomEditor, tableElem: SlateElement): boolean {
  if (editor.isDisabled()) { return false }

  const { selection } = editor

  if (selection == null) { return true }
  if (Range.isCollapsed(selection)) { return true }

  const { anchor, focus } = selection
  const tablePath = DomEditor.findPath(editor, tableElem)

  const tableStart = Editor.start(editor, tablePath)
  const tableEnd = Editor.end(editor, tablePath)
  const isAnchorInTable = Point.compare(anchor, tableEnd) <= 0 && Point.compare(anchor, tableStart) >= 0
  const isFocusInTable = Point.compare(focus, tableEnd) <= 0 && Point.compare(focus, tableStart) >= 0

  // 选区在 table 内部，且选中了同一个单元格。表格可以编辑
  if (isAnchorInTable && isFocusInTable) {
    if (Path.equals(anchor.path.slice(0, 3), focus.path.slice(0, 3))) {
      return true
    }
  }

  return false
}

function renderTable(elemNode: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  // 是否可编辑
  const editable = getContentEditable(editor, elemNode)

  // 宽度和高度
  const {
    width: tableWidth = 'auto',
    height,
    columnWidths = [],
    scrollWidth = 0,
    isHoverCellBorder,
    resizingIndex,
    isResizing,
    isHoverRowBorder,
    resizingRowIndex,
    isResizingRow,
  } = elemNode as TableElement

  // 光标是否选中
  const selected = DomEditor.isNodeSelected(editor, elemNode)
  // 光标是否有选区
  const [isSelecting] = TableCursor.selection(editor)
  // 列宽之间比值
  const columnWidthRatios = getColumnWidthRatios(columnWidths)

  const vnode = (
    <div
      className="table-container"
      data-selected={selected}
      on={{
        mousedown: (e: MouseEvent) => {
          // @ts-ignore 阻止光标定位到 table 后面
          if (e.target.tagName === 'DIV') { e.preventDefault() }

          if (editor.isDisabled()) { return }

          // @ts-ignore 如果用户行为是获取焦点输入文本时，需释放选区
          if (e.target.closest('[data-block-type="table-cell"]')) {
            TableCursor.unselect(editor)
          }

          // 是否需要定位到 table 内部
          const tablePath = DomEditor.findPath(editor, elemNode)
          const tableStart = Editor.start(editor, tablePath)
          const { selection } = editor

          if (selection == null) {
            editor.select(tableStart) // 选中 table 内部
            return
          }
          const { path } = selection.anchor

          if (path[0] === tablePath[0]) { return } // 当前选区，就在 table 内部
          // @ts-ignore
          if (e.target.tagName === 'DIV') {
            editor.select(tableStart)
          } // 选中 table 内部
        },
      }}
    >
      <table
        width={tableWidth}
        contentEditable={editable}
        /**
         * 1. 当表格处于选区状态，屏蔽 Chrome 自带的样式
         * 2. table 宽度为 auto 时，宽度为 列宽之和
         * 3. 鼠标移动到 单元格 边缘，设置 visible className
         */
        className={`table ${isSelecting ? 'table-selection-none' : ''}`}
        style={{
          width: tableWidth === '100%' ? tableWidth : `${columnWidths.reduce((a, b) => a + b, 0)}px`,
        }}
        on={{
          mousemove: debounce(
            (e: MouseEvent) => {
              if (!TableCursor.hasSelected(editor)) {
                handleCellBorderVisible(editor, elemNode, e, scrollWidth)
                handleRowBorderVisible(editor, elemNode, e)
              }
            },
            25,
          ),
        }}
      >
        <colgroup contentEditable={false}>
          {
            /**
             * 剔除 firstRowCells，因单元格合并 表头 th，会计算错误。
             * 使用 columnWidth 数组长度代表列数
             * 拖动行为及变量设置均参考 飞书
             */
            columnWidths.map(width => {
              return <col width={width}></col>
            })
          }
        </colgroup>
        <tbody>{children}</tbody>
      </table>

      <div className="column-resizer" contentEditable={false}>
        {columnWidths.map((width, index) => {
          let minWidth = width
          /**
           * table width 为 100% 模式时
           * columnWidths 表示的是比例
           * 1. 需要计算出真实的宽度
           */

          if (tableWidth === '100%') {
            minWidth = columnWidthRatios[index] * scrollWidth
          }

          return (
            <div className="column-resizer-item" style={{ minWidth: `${minWidth}px` }}>
              <div
                className={
                  `resizer-line-hotzone ${
                    isHoverCellBorder && index === resizingIndex ? 'visible ' : ''
                  }${isResizing && index === resizingIndex ? 'highlight' : ''}`
                }
                style={{ height: `${height}px` }}
                on={{
                  mouseenter: (e: MouseEvent) => handleCellBorderHighlight(editor, e),
                  mouseleave: (e: MouseEvent) => handleCellBorderHighlight(editor, e),
                  mousedown: (_e: MouseEvent) => handleCellBorderMouseDown(editor, elemNode),
                }}
              >
                <div className="resizer-line"></div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="row-resizer" contentEditable={false}>
        {(elemNode as TableElement).children.map((rowNode, index) => {
          const totalTableWidth = columnWidths.reduce((a, b) => a + b, 0)
          const rowHeight = (rowNode as TableRowElement).height || 30

          return (
            <div className="row-resizer-item" style={{ minHeight: `${rowHeight}px` }}>
              <div
                className={
                  `resizer-line-hotzone-horizontal ${
                    isHoverRowBorder && index === resizingRowIndex ? 'visible ' : ''
                  }${isResizingRow && index === resizingRowIndex ? 'highlight' : ''}`
                }
                style={{ width: `${totalTableWidth}px` }}
                on={{
                  mouseenter: (e: MouseEvent) => handleRowBorderHighlight(editor, e),
                  mouseleave: (e: MouseEvent) => handleRowBorderHighlight(editor, e),
                  mousedown: (_e: MouseEvent) => handleRowBorderMouseDown(editor, elemNode),
                }}
              >
                <div className="resizer-line-horizontal"></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  /**
   * 移出直接返回 vnode
   * 添加 ObserverResize 监听行为
   * 监听 table 内部变化，更新 table resize-bar 高度
   */
  const containerVnode = h(
    'div',
    {
      hook: {
        insert: ({ elm }: VNode) => observerTableResize(editor, elm),
        destroy: () => {
          unObserveTableResize()
        },
      },
    },
    vnode,
  )

  return containerVnode
}

export default renderTable
