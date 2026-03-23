import { Node } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { TableElement } from '../../src/module/custom-types'
import CellProperty from '../../src/module/menu/CellProperty'
import TableProperty from '../../src/module/menu/TableProperty'
import { EDITOR_TO_SELECTION } from '../../src/module/weak-maps'
import { NodeEntryWithContext } from '../../src/utils'

function createTableContent() {
  return [
    {
      type: 'table',
      width: 'auto',
      children: [
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'A' }] },
            { type: 'table-cell', children: [{ text: 'B' }] },
          ],
        },
        {
          type: 'table-row',
          children: [
            { type: 'table-cell', children: [{ text: 'C' }] },
            { type: 'table-cell', children: [{ text: 'D' }] },
          ],
        },
      ],
      columnWidths: [60, 60],
      scrollWidth: 120,
      height: 62,
    },
  ]
}

function setSelectionInsideFirstCell(editor) {
  editor.selection = {
    anchor: { path: [0, 0, 0, 0], offset: 0 },
    focus: { path: [0, 0, 0, 0], offset: 0 },
  }
}

function createContextSelection(editor, rows: number[][][]): NodeEntryWithContext[][] {
  return rows.map(row => row.map(path => [
    [Node.get(editor, path as any) as any, path as any],
    {
      rtl: 0,
      ltr: 1,
      ttb: 1,
      btt: 0,
    },
  ]))
}

describe('table property menus', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('TableProperty updates the selected table and restores focus after submit', () => {
    vi.useFakeTimers()
    const editor = createEditor({ content: createTableContent() })
    const menu = new TableProperty()
    const focusSpy = vi.spyOn(editor, 'focus').mockImplementation(() => {})

    setSelectionInsideFirstCell(editor)

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const borderStyle = elem.querySelector('[name="borderStyle"]') as HTMLSelectElement
    const borderColor = elem.querySelector('[name="borderColor"]') as HTMLInputElement
    const borderWidth = elem.querySelector('[name="borderWidth"]') as HTMLInputElement
    const backgroundColor = elem.querySelector('[name="backgroundColor"]') as HTMLInputElement
    const textAlign = elem.querySelector('[name="textAlign"]') as HTMLSelectElement
    const button = elem.querySelector('button') as HTMLButtonElement

    borderStyle.value = 'dashed'
    borderColor.value = '#ff0000'
    borderWidth.value = '2'
    backgroundColor.value = '#00ff00'
    textAlign.value = 'center'

    button.click()
    vi.runAllTimers()

    const table = editor.children[0] as TableElement & Record<string, string>

    expect(table.borderStyle).toBe('dashed')
    expect(table.borderColor).toBe('#ff0000')
    expect(table.borderWidth).toBe('2')
    expect(table.backgroundColor).toBe('#00ff00')
    expect(table.textAlign).toBe('center')
    expect(focusSpy).toHaveBeenCalled()
  })

  test('CellProperty applies properties to every selected cell in the batch selection', () => {
    vi.useFakeTimers()
    const editor = createEditor({ content: createTableContent() })
    const menu = new CellProperty()
    const focusSpy = vi.spyOn(editor, 'focus').mockImplementation(() => {})

    setSelectionInsideFirstCell(editor)
    EDITOR_TO_SELECTION.set(
      editor,
      createContextSelection(editor, [
        [[0, 0, 0], [0, 0, 1]],
        [[0, 1, 0], [0, 1, 1]],
      ]),
    )

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const borderStyle = elem.querySelector('[name="borderStyle"]') as HTMLSelectElement
    const textAlign = elem.querySelector('[name="textAlign"]') as HTMLSelectElement
    const backgroundColor = elem.querySelector('[name="backgroundColor"]') as HTMLInputElement
    const button = elem.querySelector('button') as HTMLButtonElement

    borderStyle.value = 'solid'
    textAlign.value = 'right'
    backgroundColor.value = '#cccccc'

    button.click()
    vi.runAllTimers()

    const table = editor.children[0] as TableElement
    const allCells = table.children.flatMap(row => row.children)

    expect(allCells.every(cell => cell.borderStyle === 'solid')).toBe(true)
    expect(allCells.every(cell => cell.textAlign === 'right')).toBe(true)
    expect(allCells.every(cell => cell.backgroundColor === '#cccccc')).toBe(true)
    expect(focusSpy).toHaveBeenCalled()
  })

  test('TableProperty renders color panels and updates hidden values through the color picker', () => {
    const editor = createEditor({ content: createTableContent() })
    const menu = new TableProperty()

    setSelectionInsideFirstCell(editor)
    vi.spyOn(editor, 'getMenuConfig').mockImplementation((mark: string) => {
      if (mark === 'color') { return { colors: ['#ff0000', '#00ff00'] } as any }
      if (mark === 'bgColor') { return { colors: ['#cccccc'] } as any }
      return {} as any
    })

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const borderColorTrigger = elem.querySelector('[data-mark="color"]') as HTMLElement
    const borderColorInput = elem.querySelector('[name="borderColor"]') as HTMLInputElement

    borderColorTrigger.click()

    const panel = borderColorTrigger.querySelector('.w-e-drop-panel') as HTMLElement
    const colorOption = panel.querySelector('li[data-value="#00ff00"]') as HTMLElement

    expect(panel).not.toBeNull()
    colorOption.click()

    expect(borderColorInput.value).toBe('#00ff00')
    expect((borderColorTrigger.querySelector('.color-group-block') as HTMLElement).style.backgroundColor)
      .toContain('0, 255, 0')

    const clearPanel = menu.getPanelContentElem(editor, {
      mark: 'bgColor',
      selectedColor: '#cccccc',
      callback: vi.fn(),
    })

    expect(clearPanel.text()).toContain('清除')
    expect(clearPanel.find('li.active').attr('data-value')).toBe('#cccccc')
  })
})
