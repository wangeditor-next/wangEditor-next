import createEditor from '../../../tests/utils/create-editor'
import { renderTableCellConf, renderTableConf, renderTableRowConf } from '../src/module/render-elem'

describe('table module - render elem', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('render table td elem', () => {
    expect(renderTableCellConf.type).toBe('table-cell')

    const elem = { type: 'table-cell', children: [] }
    const vnode = renderTableCellConf.renderElem(elem, null, editor)

    expect(vnode.sel).toBe('td')
  })

  // // isHeader 必须在第一行才能生效，该 case 运行报错，暂注释 - wangfupeng 2022.05.20
  // it('render table th elem', () => {
  //   const cell = { type: 'table-cell', children: [], isHeader: true }
  //   const row = { type: 'table-row', children: [cell] }
  //   const table = { type: 'table', children: [row] }
  //   editor.insertNode(table)
  //   const vnode = renderTableCellConf.renderElem(cell, null, editor)
  //   expect(vnode.sel).toBe('th')
  // })

  it('render table row elem', () => {
    expect(renderTableRowConf.type).toBe('table-row')

    const elem = { type: 'table-row', children: [] }
    const vnode = renderTableRowConf.renderElem(elem, null, editor)

    expect(vnode.sel).toBe('tr')
  })

  it('render table row elem with height', () => {
    expect(renderTableRowConf.type).toBe('table-row')

    const elem = { type: 'table-row', children: [], height: 50 }
    const vnode = renderTableRowConf.renderElem(elem, null, editor)

    expect(vnode.sel).toBe('tr')
    expect(vnode.data?.style?.height).toBe('50px')
  })

  it('render table row elem without height should not set style', () => {
    expect(renderTableRowConf.type).toBe('table-row')

    const elem = { type: 'table-row', children: [] }
    const vnode = renderTableRowConf.renderElem(elem, null, editor)

    expect(vnode.sel).toBe('tr')
    expect(vnode.data?.style?.height).toBeUndefined()
  })

  it('render table elem', () => {
    expect(renderTableConf.type).toBe('table')

    const elem = { type: 'table', children: [] }

    /**
     * 改变了结构，新增外层 DIV
     */
    const observerVnode = renderTableConf.renderElem(elem, null, editor) as any

    expect(observerVnode.sel).toBe('div')
    const containerVnode = observerVnode.children[0] as any

    expect(containerVnode.sel).toBe('div')
    const tableVnode = containerVnode.children[0] as any

    expect(tableVnode.sel).toBe('table')
  })

  it('render table elem with full with', () => {
    const elem = { type: 'table', children: [], width: '100%' }

    const observerVnode = renderTableConf.renderElem(elem, null, editor) as any
    const containerVnode = observerVnode.children[0] as any
    const tableVnode = containerVnode.children[0] as any

    expect(tableVnode.data.width).toBe('100%')
  })

  it('render table with row resizer elements', () => {
    expect(renderTableConf.type).toBe('table')

    const elem = {
      type: 'table',
      width: 'auto',
      columnWidths: [100, 150],
      children: [
        {
          type: 'table-row',
          height: 30,
          children: [
            { type: 'table-cell', children: [{ text: 'Cell 1' }] },
            { type: 'table-cell', children: [{ text: 'Cell 2' }] },
          ],
        },
        {
          type: 'table-row',
          height: 40,
          children: [
            { type: 'table-cell', children: [{ text: 'Cell 3' }] },
            { type: 'table-cell', children: [{ text: 'Cell 4' }] },
          ],
        },
      ],
    }

    const observerVnode = renderTableConf.renderElem(elem, null, editor) as any
    const containerVnode = observerVnode.children[0] as any

    // 验证容器结构
    expect(containerVnode.sel).toBe('div')
    expect(containerVnode.data?.className).toBe('table-container')

    // 验证包含表格元素
    const tableVnode = containerVnode.children[0] as any

    expect(tableVnode.sel).toBe('table')

    // 验证包含列拖动手柄
    const columnResizer = containerVnode.children[1] as any

    expect(columnResizer.sel).toBe('div')
    expect(columnResizer.data?.className).toBe('column-resizer')

    // 验证包含行拖动手柄
    const rowResizer = containerVnode.children[2] as any

    expect(rowResizer.sel).toBe('div')
    expect(rowResizer.data?.className).toBe('row-resizer')

    // 验证行拖动手柄的数量与行数一致
    expect(rowResizer.children).toHaveLength(2)

    // 验证每个行拖动手柄的高度
    const firstRowResizer = rowResizer.children[0] as any

    expect(firstRowResizer.data?.style?.minHeight).toBe('30px')

    const secondRowResizer = rowResizer.children[1] as any

    expect(secondRowResizer.data?.style?.minHeight).toBe('40px')
  })

  it('render table row resizer with default height when height is not specified', () => {
    const elem = {
      type: 'table',
      width: 'auto',
      columnWidths: [100],
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'Cell' }] },
          ],
        },
      ],
    }

    const observerVnode = renderTableConf.renderElem(elem, null, editor) as any
    const containerVnode = observerVnode.children[0] as any
    const rowResizer = containerVnode.children[2] as any
    const firstRowResizer = rowResizer.children[0] as any

    // 验证使用默认高度 30px
    expect(firstRowResizer.data?.style?.minHeight).toBe('30px')
  })
})
