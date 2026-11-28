import { DomEditor, type IEditorConfig } from '@wangeditor-next/core'
import { Editor, Text, Transforms } from 'slate'

import createEditor from '../../../tests/utils/create-editor'

const chromiumUserAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 '
  + '(KHTML, like Gecko) HeadlessChrome/156.0.0.0 Safari/537.36'

const tableHtml = '<table><tbody><tr><td>A123</td><td>B123</td></tr>'
  + '<tr><td>C123</td><td>D123</td></tr><tr><td>E123</td><td>F123</td></tr></tbody></table>'
  + '<p>after</p>'

function rect(x: number, y: number, width: number, height = 12): DOMRect {
  return {
    left: x, right: x + width, top: y, bottom: y + height, height,
  } as DOMRect
}

function mockLayout(root: HTMLElement) {
  const createRange = document.createRange.bind(document)

  vi.spyOn(document, 'createRange').mockImplementation(() => {
    const range = createRange()

    range.getClientRects = () => {
      const node = range.startContainer
      const el = node.nodeType === 1 ? node as Element : node.parentElement
      const cell = el?.closest<HTMLTableCellElement>('td,th')

      if (!cell) { return [] as unknown as DOMRectList }

      const { cellIndex } = cell
      const { rowIndex } = cell.parentElement as HTMLTableRowElement
      const zeroWidth = el?.hasAttribute('data-slate-zero-width')
      const width = range.collapsed || zeroWidth ? 0 : (node.textContent?.length ?? 0) * 10
      const offset = range.collapsed ? range.startOffset * 10 : 0
      const x = cellIndex * 100 + offset
      const y = rowIndex * 20

      if (!range.collapsed && cell.hasAttribute('data-test-tight-wrap')) {
        // The glyph boxes overlap even though their line tops differ by 8px.
        return [rect(x, y, width, 20), rect(x, y + 8, width, 20)] as unknown as DOMRectList
      }
      if (!range.collapsed && zeroWidth) {
        return [rect(x, y, 0), rect(x, y, 0)] as unknown as DOMRectList
      }
      return [rect(x, y, width)] as unknown as DOMRectList
    }

    return range
  })
  vi.spyOn(window, 'getComputedStyle').mockImplementation(el => ({
    direction: 'ltr',
    writingMode: 'horizontal-tb',
    visibility: el.closest<HTMLElement>('[style*="visibility"]')?.style.visibility || 'visible',
  } as CSSStyleDeclaration))
  Object.defineProperty(document, 'elementFromPoint', {
    configurable: true,
    value: (x: number, y: number) => root.querySelector('table')?.rows[Math.floor(y / 20)]
      ?.cells[Math.floor(x / 100)] ?? null,
  })
}

describe('table vertical arrow navigation', () => {
  const originalElementFromPoint = Object.getOwnPropertyDescriptor(document, 'elementFromPoint')

  afterEach(() => {
    vi.restoreAllMocks()
    if (originalElementFromPoint) {
      Object.defineProperty(document, 'elementFromPoint', originalElementFromPoint)
    } else {
      Reflect.deleteProperty(document, 'elementFromPoint')
    }
  })

  async function setup(
    html = tableHtml,
    userAgent = chromiumUserAgent,
    config: Partial<IEditorConfig> = {}
  ) {
    vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(userAgent)
    const editor = createEditor({ html, config: { autoFocus: false, ...config } })

    await Promise.resolve()
    const root = DomEditor.toDOMNode(editor, editor)

    mockLayout(root)
    // jsdom needs a tab stop to focus an editable DIV.
    root.tabIndex = 0
    editor.focus()

    const moveTo = (row: number, col: number, offset: number) => {
      const origin = { path: Editor.start(editor, [0, row, col]).path, offset }
      const cell = root.querySelector('table')?.rows[row].cells[col]
      const span = cell?.querySelector('[data-slate-string],[data-slate-zero-width]')
      const range = document.createRange()

      Transforms.select(editor, origin)
      range.setStart(span!.firstChild!, span!.hasAttribute('data-slate-zero-width') ? 1 : offset)
      range.collapse(true)
      document.getSelection()!.removeAllRanges()
      document.getSelection()!.addRange(range)
      return origin
    }

    const key = (keyName: string, options: KeyboardEventInit = {}) => {
      const event = new KeyboardEvent('keydown', {
        key: keyName, bubbles: true, cancelable: true, ...options,
      })

      root.dispatchEvent(event)
      return event
    }

    vi.spyOn(DomEditor, 'findEventRange').mockImplementation((_editor, event) => {
      const targetCell = event.target as HTMLTableCellElement
      const { cellIndex } = targetCell
      const { rowIndex } = targetCell.parentElement as HTMLTableRowElement
      const path = Editor.start(editor, [0, rowIndex, cellIndex]).path
      const point = { path, offset: Math.round((event.clientX - cellIndex * 100) / 10) }

      return { anchor: point, focus: point }
    })
    return { editor, root, moveTo, key }
  }

  test.each([
    ['ArrowUp', 0],
    ['ArrowDown', 2],
  ] as const)('uses one selection move to the same column for %s', async (name, row) => {
    const { editor, moveTo, key } = await setup()

    moveTo(1, 1, 2)
    const select = vi.spyOn(editor, 'select')
    const html = editor.getHtml()
    const point = { path: Editor.start(editor, [0, row, 1]).path, offset: 2 }

    expect(key(name).defaultPrevented).toBe(true)
    expect(select).toHaveBeenCalledExactlyOnceWith(point)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
    expect(editor.getHtml()).toBe(html)
  })

  test('uses offset zero for an empty target with duplicate line rectangles', async () => {
    const { editor, moveTo, key } = await setup(tableHtml.replace('F123', ''))

    moveTo(1, 1, 2)

    expect(key('ArrowDown').defaultPrevented).toBe(true)
    const point = Editor.start(editor, [0, 2, 1])

    expect(editor.selection).toEqual({ anchor: point, focus: point })
    expect(DomEditor.findEventRange).not.toHaveBeenCalled()
  })

  test('leaves table edges and modified keys to existing handlers', async () => {
    const { editor, moveTo, key } = await setup()
    const point = moveTo(0, 0, 2)

    expect(key('ArrowUp').defaultPrevented).toBe(false)
    expect(key('ArrowDown', { shiftKey: true }).defaultPrevented).toBe(false)
    expect(key('ArrowDown', { ctrlKey: true }).defaultPrevented).toBe(false)
    expect(key('ArrowDown', { altKey: true }).defaultPrevented).toBe(false)
    expect(key('ArrowDown', { metaKey: true }).defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test.each([
    ['a merged cell in another row', tableHtml.replace('<td>A123', '<td colspan="2">A123')],
    ['a marked target', tableHtml.replace('F123', '<strong>F123</strong>')],
    ['an explicit break in the target', tableHtml.replace('F123', 'F<br>123')],
  ])('leaves navigation native with %s', async (_label, html) => {
    const { editor, moveTo, key } = await setup(html)
    const point = moveTo(1, 1, 2)

    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test.each([
    chromiumUserAgent.replace('X11; Linux x86_64', 'Windows NT 10.0; Win64; x64'),
    chromiumUserAgent.replace('X11; Linux x86_64', 'Linux; Android 16'),
    'Mozilla/5.0 (X11; Linux x86_64; rv:155.0) Gecko/20100101 Firefox/155.0',
  ])('leaves unverified browser and platform combinations native (%s)', async userAgent => {
    const { editor, moveTo, key } = await setup(tableHtml, userAgent)
    const point = moveTo(1, 1, 2)

    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test.each([
    ['ArrowDown', true],
    ['Shift?+Down', true],
    ['down+Ctrl?+Option?', true],
    ['Ctrl+ArrowDown', false],
    ['ArrowUp', false],
  ])('reserves %s only if it matches the unmodified key', async (hotkey, reserved) => {
    const { editor, moveTo, key } = await setup()
    const point = moveTo(1, 1, 2)

    vi.spyOn(DomEditor, 'getToolbar').mockReturnValue({
      getMenus: () => ({ test: { hotkey } }),
    } as unknown as ReturnType<typeof DomEditor.getToolbar>)

    expect(key('ArrowDown').defaultPrevented).toBe(!reserved)
    if (reserved) {
      expect(editor.selection).toEqual({ anchor: point, focus: point })
    }
  })

  test.each([1, 2])('leaves overlapping text lines native in row %s', async row => {
    const { editor, root, moveTo, key } = await setup()
    const point = moveTo(1, 1, 2)

    root.querySelector('table')!.rows[row].cells[1].setAttribute('data-test-tight-wrap', 'true')

    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test.each([1, 2])('leaves inherited visibility:hidden text native in row %s', async row => {
    const { editor, root, moveTo, key } = await setup()
    const point = moveTo(1, 1, 2)
    const paragraph = root.querySelector('table')!.rows[row].cells[1].querySelector('p')!

    paragraph.style.visibility = 'hidden'

    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test('leaves a target split into decorated DOM leaves native', async () => {
    const { editor, root, moveTo, key } = await setup(tableHtml, chromiumUserAgent, {
      decorate: ([node, path]) => {
        if (!Text.isText(node) || node.text !== 'F123') { return [] }

        return [{ anchor: { path, offset: 0 }, focus: { path, offset: 2 }, bold: true }]
      },
    })
    const point = moveTo(1, 1, 2)
    const target = root.querySelector('table')!.rows[2].cells[1]

    expect(target.querySelectorAll('[data-slate-leaf]')).toHaveLength(2)
    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test('leaves a target covered by an overlay inside the target cell native', async () => {
    const { editor, root, moveTo, key } = await setup(tableHtml.replace('F123', 'F'))
    const point = moveTo(1, 1, 2)
    const target = root.querySelector('table')!.rows[2].cells[1]
    const overlay = document.createElement('div')

    overlay.setAttribute('contenteditable', 'false')
    target.appendChild(overlay)
    Object.defineProperty(document, 'elementFromPoint', { configurable: true, value: () => overlay })

    expect(overlay.closest('td')).toBe(target)
    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test('leaves temporarily mismatched Slate and DOM selections native', async () => {
    const { editor, moveTo, key } = await setup()

    moveTo(1, 1, 2)
    const point = Editor.start(editor, [0, 1, 0])

    Transforms.select(editor, point)
    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })

  test('checks the new table shape after an unrelated cell changes', async () => {
    const { editor, moveTo, key } = await setup()

    moveTo(1, 1, 2)
    expect(key('ArrowDown').defaultPrevented).toBe(true)

    Transforms.setNodes(editor, { rowSpan: 2 }, { at: [0, 0, 0] })
    const point = moveTo(1, 1, 2)

    expect(key('ArrowDown').defaultPrevented).toBe(false)
    expect(editor.selection).toEqual({ anchor: point, focus: point })
  })
})
