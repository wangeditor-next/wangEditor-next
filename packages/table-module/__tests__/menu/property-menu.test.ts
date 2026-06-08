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

function changeInputValue(input: HTMLInputElement | HTMLSelectElement, value: string) {
  input.value = value
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

function selectBorderStyle(elem: HTMLElement, value: string) {
  const trigger = elem.querySelector('.w-e-table-property-select-trigger') as HTMLButtonElement
  const option = elem.querySelector(
    `.w-e-table-property-select-option[data-value="${value}"]`
  ) as HTMLButtonElement

  trigger.click()
  option.click()
}

function createContextSelection(editor, rows: number[][][]): NodeEntryWithContext[][] {
  return rows.map(row =>
    row.map(path => [
      [Node.get(editor, path as any) as any, path as any],
      {
        rtl: 0,
        ltr: 1,
        ttb: 1,
        btt: 0,
      },
    ])
  )
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
    const borderStyle = elem.querySelector('[name="borderStyle"]') as HTMLInputElement
    const borderWidth = elem.querySelector('[name="borderWidth"]') as HTMLInputElement
    const borderColorTrigger = elem.querySelector('[data-mark="color"]') as HTMLElement
    const backgroundColorTrigger = elem.querySelector('[data-mark="bgColor"]') as HTMLElement
    const textAlign = elem.querySelector('[name="textAlign"]') as HTMLInputElement | null
    const width = elem.querySelector('[name="width"]') as HTMLInputElement | null
    const button = elem.querySelector('.button-container button') as HTMLButtonElement

    vi.spyOn(editor, 'getMenuConfig').mockImplementation((mark: string) => {
      if (mark === 'color') {
        return { colors: ['#ff0000'] } as any
      }
      if (mark === 'bgColor') {
        return { colors: ['#00ff00'] } as any
      }
      return {} as any
    })

    selectBorderStyle(elem, 'dashed')
    changeInputValue(borderWidth, '2')
    borderColorTrigger.click()
    ;(borderColorTrigger.querySelector('li[data-value="#ff0000"]') as HTMLElement).click()
    backgroundColorTrigger.click()
    ;(backgroundColorTrigger.querySelector('li[data-value="#00ff00"]') as HTMLElement).click()

    expect(textAlign).toBeNull()
    expect(width).toBeNull()
    expect(borderStyle.value).toBe('dashed')

    button.click()
    vi.runAllTimers()

    const table = editor.children[0] as TableElement & Record<string, string>

    expect(table.width).toBe('auto')
    expect(table.borderStyle).toBe('dashed')
    expect(table.borderColor).toBe('#ff0000')
    expect(table.borderWidth).toBe('2')
    expect(table.backgroundColor).toBe('#00ff00')
    expect(table.textAlign).toBeUndefined()
    expect(focusSpy).toHaveBeenCalled()
  })

  test('TableProperty shows default border style and makes selected border color visible', () => {
    vi.useFakeTimers()
    const editor = createEditor({ content: createTableContent() })
    const menu = new TableProperty()

    setSelectionInsideFirstCell(editor)
    vi.spyOn(editor, 'getMenuConfig').mockImplementation((mark: string) => {
      if (mark === 'color') {
        return { colors: ['#ff0000'] } as any
      }
      return {} as any
    })

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const borderStyle = elem.querySelector('[name="borderStyle"]') as HTMLInputElement
    const borderWidth = elem.querySelector('[name="borderWidth"]') as HTMLInputElement
    const borderColorTrigger = elem.querySelector('[data-mark="color"]') as HTMLElement
    const button = elem.querySelector('.button-container button') as HTMLButtonElement

    expect(borderStyle.value).toBe('none')
    expect(borderWidth.placeholder).toBe('默认 1')

    borderColorTrigger.click()
    ;(borderColorTrigger.querySelector('li[data-value="#ff0000"]') as HTMLElement).click()

    expect(borderStyle.value).toBe('solid')
    expect(borderWidth.value).toBe('1')

    button.click()
    vi.runAllTimers()

    const table = editor.children[0] as TableElement & Record<string, string>

    expect(table.borderColor).toBe('#ff0000')
    expect(table.borderStyle).toBe('solid')
    expect(table.borderWidth).toBe('1')
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
        [
          [0, 0, 0],
          [0, 0, 1],
        ],
        [
          [0, 1, 0],
          [0, 1, 1],
        ],
      ])
    )

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const textAlign = elem.querySelector('[name="textAlign"]') as HTMLInputElement
    const rightAlignButton = elem.querySelector(
      '.w-e-table-property-align-button[data-value="right"]'
    ) as HTMLButtonElement
    const middleVerticalAlignButton = elem.querySelector(
      '.w-e-table-property-segment-button[data-value="middle"]'
    ) as HTMLButtonElement
    const verticalAlign = elem.querySelector('[name="verticalAlign"]') as HTMLInputElement
    const backgroundColorTrigger = elem.querySelector('[data-mark="bgColor"]') as HTMLElement
    const button = elem.querySelector('.button-container button') as HTMLButtonElement

    vi.spyOn(editor, 'getMenuConfig').mockImplementation((mark: string) => {
      if (mark === 'bgColor') {
        return { colors: ['#cccccc'] } as any
      }
      return {} as any
    })

    selectBorderStyle(elem, 'solid')
    rightAlignButton.click()
    middleVerticalAlignButton.click()
    backgroundColorTrigger.click()
    ;(backgroundColorTrigger.querySelector('li[data-value="#cccccc"]') as HTMLElement).click()

    expect(textAlign.value).toBe('right')
    expect(rightAlignButton.classList.contains('active')).toBe(true)
    expect(verticalAlign.value).toBe('middle')
    expect(middleVerticalAlignButton.classList.contains('active')).toBe(true)

    button.click()
    vi.runAllTimers()

    const table = editor.children[0] as TableElement
    const allCells = table.children.flatMap(row => row.children)

    expect(allCells.every(cell => cell.borderStyle === 'solid')).toBe(true)
    expect(allCells.every(cell => cell.textAlign === 'right')).toBe(true)
    expect(allCells.every(cell => cell.verticalAlign === 'middle')).toBe(true)
    expect(allCells.every(cell => cell.backgroundColor === '#cccccc')).toBe(true)
    expect(focusSpy).toHaveBeenCalled()
  })

  test('CellProperty only applies changed properties in batch selection', () => {
    vi.useFakeTimers()
    const editor = createEditor({
      content: [
        {
          type: 'table',
          width: 'auto',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  borderStyle: 'dashed',
                  backgroundColor: '#ffffff',
                  children: [{ text: 'A' }],
                },
                {
                  type: 'table-cell',
                  borderStyle: 'solid',
                  backgroundColor: '#eeeeee',
                  children: [{ text: 'B' }],
                },
              ],
            },
          ],
          columnWidths: [60, 60],
          scrollWidth: 120,
          height: 31,
        },
      ],
    })
    const menu = new CellProperty()

    setSelectionInsideFirstCell(editor)
    EDITOR_TO_SELECTION.set(
      editor,
      createContextSelection(editor, [
        [
          [0, 0, 0],
          [0, 0, 1],
        ],
      ])
    )

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const backgroundColor = elem.querySelector('[name="backgroundColor"]') as HTMLInputElement
    const borderStyle = elem.querySelector('[name="borderStyle"]') as HTMLInputElement
    const rightAlignButton = elem.querySelector(
      '.w-e-table-property-align-button[data-value="right"]'
    ) as HTMLButtonElement
    const button = elem.querySelector('.button-container button') as HTMLButtonElement

    expect(borderStyle.getAttribute('data-mixed')).toBe('true')
    expect(backgroundColor.getAttribute('data-mixed')).toBe('true')

    rightAlignButton.click()
    button.click()
    vi.runAllTimers()

    const table = editor.children[0] as TableElement
    const [firstCell, secondCell] = table.children[0].children

    expect(firstCell.borderStyle).toBe('dashed')
    expect(secondCell.borderStyle).toBe('solid')
    expect(firstCell.backgroundColor).toBe('#ffffff')
    expect(secondCell.backgroundColor).toBe('#eeeeee')
    expect(firstCell.textAlign).toBe('right')
    expect(secondCell.textAlign).toBe('right')
  })

  test('TableProperty renders color panels and updates hidden values through the color picker', () => {
    const editor = createEditor({ content: createTableContent() })
    const menu = new TableProperty()

    setSelectionInsideFirstCell(editor)
    vi.spyOn(editor, 'getMenuConfig').mockImplementation((mark: string) => {
      if (mark === 'color') {
        return { colors: ['#ff0000', '#00ff00'] } as any
      }
      if (mark === 'bgColor') {
        return { colors: ['#cccccc'] } as any
      }
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
    expect((elem.querySelector('[name="borderStyle"]') as HTMLInputElement).value).toBe('solid')
    expect((elem.querySelector('[name="borderWidth"]') as HTMLInputElement).value).toBe('1')
    expect(
      (borderColorTrigger.querySelector('.color-group-block') as HTMLElement).style.backgroundColor
    ).toContain('0, 255, 0')

    const clearPanel = menu.getPanelContentElem(editor, {
      mark: 'bgColor',
      selectedColor: '#cccccc',
      callback: vi.fn(),
    })

    expect(clearPanel.text()).toContain('清除')
    expect(clearPanel.find('li.active').attr('data-value')).toBe('#cccccc')
  })

  test('CellProperty marks the current text alignment button as active', () => {
    const editor = createEditor({
      content: [
        {
          type: 'table',
          width: 'auto',
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  textAlign: 'right',
                  verticalAlign: 'bottom',
                  children: [{ text: 'A' }],
                },
              ],
            },
          ],
          columnWidths: [60],
          scrollWidth: 60,
          height: 31,
        },
      ],
    })
    const menu = new CellProperty()

    setSelectionInsideFirstCell(editor)

    const elem = menu.getModalContentElem(editor) as HTMLDivElement
    const rightAlignButton = elem.querySelector(
      '.w-e-table-property-align-button[data-value="right"]'
    ) as HTMLButtonElement
    const leftAlignButton = elem.querySelector(
      '.w-e-table-property-align-button[data-value="left"]'
    ) as HTMLButtonElement
    const bottomVerticalAlignButton = elem.querySelector(
      '.w-e-table-property-segment-button[data-value="bottom"]'
    ) as HTMLButtonElement

    expect(rightAlignButton.classList.contains('active')).toBe(true)
    expect(rightAlignButton.getAttribute('aria-pressed')).toBe('true')
    expect(leftAlignButton.classList.contains('active')).toBe(false)
    expect(leftAlignButton.getAttribute('aria-pressed')).toBe('false')
    expect(bottomVerticalAlignButton.classList.contains('active')).toBe(true)
    expect(bottomVerticalAlignButton.getAttribute('aria-pressed')).toBe('true')
  })
})
