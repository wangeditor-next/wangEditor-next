/**
 * @description rectangular table Copy/Cut integration tests
 */

import { coreCreateEditor, DomEditor, ELEM_TO_HTML_CONF } from '@wangeditor-next/core'
import { createEditor } from '@wangeditor-next/editor'
import { Descendant, Editor, Node } from 'slate'

import {
  ClipboardFragmentEvents,
  writeClipboardFragment,
} from '../../core/src/editor/clipboard'
import withTable from '../src/module/plugin'
import { withRectangularClipboard } from '../src/module/rectangular-clipboard'
import { EDITOR_TO_SELECTION } from '../src/module/weak-maps'

type Cells = string[][]
type Headers = boolean[][]

interface TableOptions {
  cells?: Cells
  /** Optional block children per cell; defaults to one paragraph holding the cell text. */
  cellChildren?: Descendant[][][]
  headers?: Headers
  rowHeights?: number[]
  columnWidths?: number[]
  caption?: string
  config?: Record<string, unknown>
}

function createTableEditor(options: TableOptions = {}) {
  const cells = options.cells || [['A', 'B'], ['C', 'D']]
  const content = [
    {
      type: 'table',
      width: 'auto',
      caption: options.caption || 'CAP',
      columnWidths: options.columnWidths || [100, 200],
      children: cells.map((row, r) => ({
        type: 'table-row',
        ...(options.rowHeights && options.rowHeights[r] ? { height: options.rowHeights[r] } : {}),
        children: row.map((text, c) => ({
          type: 'table-cell',
          ...(options.headers && options.headers[r] && options.headers[r][c] ? { isHeader: true } : {}),
          children: options.cellChildren?.[r]?.[c] ?? [{ type: 'paragraph', children: [{ text }] }],
        })),
      })),
    },
    { type: 'paragraph', children: [{ text: 'tail' }] },
  ]
  const editor = createEditor({ content, config: options.config } as any)

  editor.alert = vi.fn()
  return editor
}

/** The browser path requires a native range; headless tests provide one. */
function stubNativeSelection(editor: any, getRange: () => any = () => editor.selection) {
  vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue({
    getSelection: () => ({ rangeCount: 1 }),
  } as any)
  vi.spyOn(DomEditor, 'toSlateRange').mockImplementation(() => getRange())
}

/**
 * Build the upstream matrix through a real `set_selection` operation so the
 * rectangle module can certify provenance against the top-level table path.
 */
function selectRectangle(editor: any, top: number, left: number, bottom: number, right: number) {
  const selection = {
    anchor: Editor.start(editor, [0, top, left]),
    focus: Editor.end(editor, [0, bottom, right]),
  }

  editor.apply({
    type: 'set_selection',
    properties: editor.selection,
    newProperties: selection,
  })

  const matrix = editor.getTableSelection()

  if (!matrix) { throw new Error('table selection was not created') }
  stubNativeSelection(editor)
  return matrix
}

function createClipboard() {
  const values = new Map<string, string>()

  return {
    values,
    get types() { return Array.from(values.keys()) },
    getData: (type: string) => values.get(type) || '',
    setData: (type: string, value: string) => { values.set(type, value) },
    clearData: (type: string) => { values.delete(type) },
  }
}

function decodeFragment(value: string) {
  return JSON.parse(decodeURIComponent(window.atob(value)))
}

function runCut(editor: any, clipboard: any) {
  const result = writeClipboardFragment(editor, clipboard, 'cut')

  if (!result.cancel) { Editor.deleteFragment(editor) }
  return result
}

function wrapWriter(editor: any, wrap: (data: any, run: () => void) => void) {
  const next = editor.setFragmentData

  editor.setFragmentData = (data: any) => {
    wrap(data, () => next(data))
  }
}

/**
 * Immutable node-property write applied as a raw operation. This is not
 * redirected to the selected cells by the table selection `Transforms.setNodes`
 * wrapper, so it models a layout update that replaces the row array.
 */
function setNodeProps(editor: any, path: number[], props: Record<string, unknown>) {
  const node = Node.get(editor, path) as Record<string, unknown>
  const properties: Record<string, unknown> = {}

  Object.keys(props).forEach(key => {
    properties[key] = node[key]
  })

  editor.apply({
    type: 'set_node',
    path,
    properties,
    newProperties: props,
  })
}

describe('rectangular table clipboard', () => {
  beforeEach(() => {
    window.getSelection?.()?.removeAllRanges()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('projects the selected rectangle, keeps row heights and the column width slice, and omits the caption', () => {
    const editor = createTableEditor({
      headers: [[true, true], [false, false]],
      rowHeights: [40, 50],
      columnWidths: [100, 200],
      caption: 'CAP',
    })

    selectRectangle(editor, 0, 0, 1, 0)

    const clipboard = createClipboard()
    const result = writeClipboardFragment(editor, clipboard, 'copy')

    expect(result.cancel).toBe(false)

    const html = clipboard.getData('text/html')

    expect(clipboard.getData('text/plain')).toBe('A\nC')
    expect(html).toContain('<th')
    expect(html).toContain('<td')
    expect(html).toContain('width="100"')
    expect(html).not.toContain('width="200"')
    expect(html).toContain('height: 40px')
    expect(html).toContain('height: 50px')
    expect(html).not.toContain('<caption')

    const fragment = decodeFragment(clipboard.getData('application/x-slate-fragment'))

    expect(Array.isArray(fragment)).toBe(true)
    expect(fragment).toHaveLength(1)
    expect(fragment[0].type).toBe('table')
    expect(fragment[0].children).toHaveLength(2)
    expect(fragment[0].children[0].children[0].children[0].children[0].text).toBe('A')
    expect(fragment[0].children[1].children[0].children[0].children[0].text).toBe('C')
  })

  it('keeps the configured class style mode in the projected HTML', () => {
    const editor = createTableEditor({
      headers: [[true, true], [false, false]],
      config: { textStyleMode: 'class' },
    })

    selectRectangle(editor, 0, 0, 1, 0)

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    expect(clipboard.getData('text/html')).toContain('class="w-e-table-layout-fixed"')
  })

  it('tolerates character offsets inside the selected cells', () => {
    const editor = createTableEditor()

    selectRectangle(editor, 0, 0, 1, 0)
    stubNativeSelection(editor, () => ({
      anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 1, 0, 0, 0], offset: 0 },
    }))

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    expect(clipboard.getData('text/plain')).toBe('A\nC')
  })

  it('does not promote a projected deeper row into a header', () => {
    const editor = createTableEditor({
      headers: [[false, false], [true, true]],
    })

    selectRectangle(editor, 1, 0, 1, 1)

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    expect(clipboard.getData('text/plain')).toBe('C\tD')
    expect(clipboard.getData('text/html')).not.toContain('<th')
  })

  it('quotes TSV fields and keeps empty cells in place', () => {
    const editor = createTableEditor({
      cells: [['a\tb', 'c"d'], ['e\nf', '']],
    })

    selectRectangle(editor, 0, 0, 1, 1)

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    expect(clipboard.getData('text/plain')).toBe('"a\tb"\t"c""d"\n"e\nf"\t')
  })

  it('preserves block text and marks inside cells', () => {
    // Build the multi-block cell through the initial content so Slate keeps
    // valid parent/index relations instead of mutating children out of band.
    const editor = createTableEditor({
      cellChildren: [[
        [
          { type: 'paragraph', children: [{ text: 'bold', bold: true }, { text: ' plain' }] },
          { type: 'paragraph', children: [{ text: 'second' }] },
        ],
      ]],
    })

    selectRectangle(editor, 0, 0, 1, 0)

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    // The multi-line field is quoted; the next cell follows on a real newline.
    expect(clipboard.getData('text/plain')).toBe('"bold plain\nsecond"\nC')
    expect(clipboard.getData('text/html')).toContain('<strong>bold</strong>')
  })

  it('keeps the single-cell flow on the default writer', () => {
    // A real DOM-less editor cannot run Slate's DOM range clone. Install a spy
    // writer *before* the table plugin, so the wrapper captures it as the
    // default delegate and the test observes that delegation directly.
    const original = vi.fn((data: any) => {
      data.setData('text/plain', 'routine plain')
      data.setData('text/html', '<p>routine html</p>')
    })
    const content: any[] = [
      {
        type: 'table',
        width: 'auto',
        columnWidths: [100, 200],
        children: [['A', 'B'], ['C', 'D']].map(row => ({
          type: 'table-row',
          children: row.map(text => ({
            type: 'table-cell',
            children: [{ type: 'paragraph', children: [{ text }] }],
          })),
        })),
      },
      { type: 'paragraph', children: [{ text: 'tail' }] },
    ]
    const editor = coreCreateEditor({
      content,
      plugins: [
        (ed: any) => {
          ed.setFragmentData = original
          return ed
        },
        withTable,
      ],
    }) as any

    editor.alert = vi.fn()
    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 0 },
      focus: { path: [0, 0, 0, 0, 0], offset: 1 },
    }

    const clipboard = createClipboard()
    const result = writeClipboardFragment(editor, clipboard, 'copy')

    expect(result.cancel).toBe(false)
    expect(original).toHaveBeenCalledTimes(1)
    // The delegate receives the very same transfer and its routine payload
    // survives the wrapper chain untouched.
    expect(original.mock.calls[0][0]).toBe(clipboard)
    expect(clipboard.getData('text/plain')).toBe('routine plain')
    expect(clipboard.getData('text/html')).toBe('<p>routine html</p>')
    expect(clipboard.getData('text/html')).not.toContain('<table')
  })

  it('serializes an all-empty rectangle with placeholders', () => {
    const editor = createTableEditor({ cells: [['', ''], ['', '']] })

    selectRectangle(editor, 0, 0, 1, 1)

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    expect(clipboard.getData('text/plain')).toBe('\t\n\t')
  })

  it('allows unrelated MIME types added by an outer writer', () => {
    const editor = createTableEditor()
    const clipboard = createClipboard()

    wrapWriter(editor, (data, run) => {
      run()
      data.setData('text/rtf', '{\\rtf1}')
    })
    selectRectangle(editor, 0, 0, 1, 0)

    const result = runCut(editor, clipboard)

    expect(result.cancel).toBe(false)
    expect(clipboard.getData('text/rtf')).toBe('{\\rtf1}')
    expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('')
    expect(Node.string(Node.get(editor, [0, 0, 1]))).toBe('B')
    expect(Node.string(Node.get(editor, [0, 1, 0]))).toBe('')
    expect(Node.string(Node.get(editor, [0, 1, 1]))).toBe('D')
  })

  it('does not rescan the whole table on a warm fixed-small Copy', () => {
    const editor = createTableEditor({ cells: [['A', 'B'], ['C', 'D'], ['E', 'F']] })

    selectRectangle(editor, 0, 0, 1, 0)

    const table = Node.get(editor, [0]) as any

    Object.defineProperty(table.children[2], 'children', {
      configurable: true,
      get() { throw new Error('scanned unselected row') },
    })

    const clipboard = createClipboard()

    expect(writeClipboardFragment(editor, clipboard, 'copy').cancel).toBe(false)
    expect(clipboard.getData('text/plain')).toBe('A\nC')
  })

  it('cuts only the selected content after row-height and selected-cell width updates', () => {
    const editor = createTableEditor({ rowHeights: [40, 50], columnWidths: [100, 200] })
    const matrix = selectRectangle(editor, 0, 0, 1, 0)

    const before = Node.get(editor, [0]) as any
    const cellsBefore = [
      Node.get(editor, [0, 0, 0]) as any,
      Node.get(editor, [0, 1, 0]) as any,
    ]

    // An explicit row-height write replaces the immutable row array after the
    // selection matrix was generated.
    setNodeProps(editor, [0, 0], { height: 72 })

    // A layout-only selected-cell width write clones each wrapper while
    // reusing the same children array.
    setNodeProps(editor, [0, 0, 0], { width: '150' })
    setNodeProps(editor, [0, 1, 0], { width: '150' })

    const after = Node.get(editor, [0]) as any
    const cellsAfter = [
      Node.get(editor, [0, 0, 0]) as any,
      Node.get(editor, [0, 1, 0]) as any,
    ]

    expect(after.children).not.toBe(before.children)
    expect(editor.getTableSelection?.()).toBe(matrix)
    expect(cellsAfter[0]).not.toBe(cellsBefore[0])
    expect(cellsAfter[1]).not.toBe(cellsBefore[1])
    expect(cellsAfter[0].children).toBe(cellsBefore[0].children)
    expect(cellsAfter[1].children).toBe(cellsBefore[1].children)
    expect(cellsAfter[0].width).toBe('150')
    expect(cellsAfter[1].width).toBe('150')

    const clipboard = createClipboard()
    const result = runCut(editor, clipboard)

    expect(result.cancel).toBe(false)
    expect(clipboard.getData('text/plain')).toBe('A\nC')
    expect(clipboard.getData('text/html')).toContain('height: 72px')
    // Only the selected cells lose content; the rest of the table is intact.
    expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('')
    expect(Node.string(Node.get(editor, [0, 0, 1]))).toBe('B')
    expect(Node.string(Node.get(editor, [0, 1, 0]))).toBe('')
    expect(Node.string(Node.get(editor, [0, 1, 1]))).toBe('D')
  })

  it('delegates direct Drag and ordinary writes when no reservation exists', () => {
    const original = vi.fn()
    const editor = {
      apply: vi.fn(),
      children: [],
      on: vi.fn(),
      setFragmentData: original,
    } as any

    withRectangularClipboard(editor)

    const data = createClipboard()

    editor.setFragmentData(data)

    expect(original).toHaveBeenCalledWith(data)
  })

  describe('R0 fault matrix', () => {
    const failures: Array<{
      name: string
      prepare?: (editor: any, clipboard: any, matrix: any[]) => void
      wrap?: (data: any, run: () => void) => void
    }> = [
      { name: 'writer no-op', wrap: () => undefined },
      { name: 'writer throws', wrap: () => { throw new Error('writer failed') } },
      { name: 'writer drops text/html', wrap: (data, run) => { run(); data.clearData('text/html') } },
      { name: 'writer drops text/plain', wrap: (data, run) => { run(); data.clearData('text/plain') } },
      {
        name: 'writer drops slate fragment',
        wrap: (data, run) => { run(); data.clearData('application/x-slate-fragment') },
      },
      {
        name: 'writer rewrites text/html',
        wrap: (data, run) => { run(); data.setData('text/html', '<table><tr><td>wrong</td></tr></table>') },
      },
      {
        name: 'writer rewrites slate fragment',
        wrap: (data, run) => { run(); data.setData('application/x-slate-fragment', 'corrupt') },
      },
      {
        name: 'writer rewrites text/plain',
        wrap: (data, run) => { run(); data.setData('text/plain', 'wrong') },
      },
      {
        name: 'missing matrix',
        prepare: editor => { EDITOR_TO_SELECTION.delete(editor) },
      },
      {
        name: 'stale matrix',
        prepare: (editor, _clipboard, matrix) => {
          const stale = matrix.map((row: any[]) => row.map(([[node]]) => [[node, [0, 0, 1]], {
            rtl: 0, ltr: 0, ttb: 0, btt: 0,
          }]))

          EDITOR_TO_SELECTION.set(editor, stale)
        },
      },
      {
        name: 'foreign matrix',
        prepare: editor => {
          EDITOR_TO_SELECTION.set(editor, [
            [[[Node.get(editor, [0, 0, 1]), [0, 0, 1]], { rtl: 0, ltr: 0, ttb: 0, btt: 0 }]],
            [[[Node.get(editor, [0, 1, 1]), [0, 1, 1]], { rtl: 0, ltr: 0, ttb: 0, btt: 0 }]],
          ])
        },
      },
      {
        name: 'mismatched matrix bounds',
        prepare: (editor, _clipboard, matrix) => {
          EDITOR_TO_SELECTION.set(editor, matrix.slice(0, 1))
        },
      },
      { name: 'clipboard is not writable', prepare: (_editor, clipboard) => {
        clipboard.setData = () => { throw new Error('clipboard write failed') }
      } },
    ]

    it.each(failures)('keeps the Cut source for $name', ({
      prepare, wrap,
    }) => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      const matrix = selectRectangle(editor, 0, 0, 1, 0)
      const before = editor.getHtml()
      const beforeHistory = (editor as any).history.undos.length

      if (wrap) { wrapWriter(editor, wrap) }
      prepare?.(editor, clipboard, matrix)

      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(editor.getHtml()).toBe(before)
      expect((editor as any).history.undos.length).toBe(beforeHistory)
      expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('A')
      expect(Node.string(Node.get(editor, [0, 1, 0]))).toBe('C')
    })

    it('keeps the Cut source when the semantic export fails', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      selectRectangle(editor, 0, 0, 1, 1)
      const before = JSON.stringify(editor.children)
      // A nested table would be schema-invalid here, so fail the real
      // registered table exporter that `getHtml` uses during projection.
      // `restoreAllMocks` in `afterEach` puts the original exporter back.
      const exportTable = vi.spyOn(ELEM_TO_HTML_CONF, 'table').mockImplementation(() => {
        throw new Error('semantic export failed')
      })
      const result = runCut(editor, clipboard)

      expect(exportTable).toHaveBeenCalled()
      expect(result.cancel).toBe(true)
      expect(JSON.stringify(editor.children)).toBe(before)
    })

    it('keeps the Cut source when the native selection already moved', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      const matrix = selectRectangle(editor, 0, 0, 1, 0)
      const rightColumn = {
        anchor: { path: [0, 0, 1, 0, 0], offset: 0 },
        focus: { path: [0, 1, 1, 0, 0], offset: 1 },
      }

      vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue({
        getSelection: () => ({ rangeCount: 1 }),
      } as any)
      vi.spyOn(DomEditor, 'toSlateRange').mockReturnValue(rightColumn as any)

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(matrix).toHaveLength(2)
      expect(result.cancel).toBe(true)
      expect(editor.getHtml()).toBe(before)
    })

    it('keeps the Cut source when the native selection is unavailable', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      selectRectangle(editor, 0, 0, 1, 0)
      vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue({
        getSelection: () => null,
      } as any)

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(editor.getHtml()).toBe(before)
    })

    it('restores the previous required formats and preserves unrelated formats', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      clipboard.setData('application/x-slate-fragment', 'OLD FRAGMENT')
      clipboard.setData('text/html', 'OLD HTML')
      clipboard.setData('text/plain', 'OLD TEXT')
      clipboard.setData('text/rtf', '{\\rtf1 old}')

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        data.clearData('text/html')
      })

      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(clipboard.getData('application/x-slate-fragment')).toBe('OLD FRAGMENT')
      expect(clipboard.getData('text/html')).toBe('OLD HTML')
      expect(clipboard.getData('text/plain')).toBe('OLD TEXT')
      expect(clipboard.getData('text/rtf')).toBe('{\\rtf1 old}')
    })

    it('clears newly written required formats without touching unrelated formats', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      clipboard.setData('text/rtf', '{\\rtf1 old}')

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        data.clearData('text/plain')
      })

      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(clipboard.getData('application/x-slate-fragment')).toBe('')
      expect(clipboard.getData('text/html')).toBe('')
      expect(clipboard.getData('text/plain')).toBe('')
      expect(clipboard.getData('text/rtf')).toBe('{\\rtf1 old}')
    })

    it('cancels and restores when an outer writer returns false after delegating', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      const next = editor.setFragmentData

      clipboard.setData('text/plain', 'OLD TEXT')
      selectRectangle(editor, 0, 0, 1, 0)
      editor.setFragmentData = (data: any) => {
        next(data)
        return false
      }

      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(clipboard.getData('text/plain')).toBe('OLD TEXT')
      expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('A')
    })

    it('keeps the Cut source when a writer mutates selected cell content', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        const text = Node.get(editor, [0, 0, 0, 0, 0]) as any

        text.text = 'CHANGED'
      })

      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('CHANGED')
    })

    it('keeps the Cut source when a writer changes editor.selection', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        editor.selection = {
          anchor: Editor.start(editor, [0, 0, 1]),
          focus: Editor.end(editor, [0, 0, 1]),
        }
      })

      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('A')
      expect(Node.string(Node.get(editor, [0, 1, 0]))).toBe('C')
    })
  })

  describe('races', () => {
    it('cancels Cut when the matrix is replaced during the writer chain', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        EDITOR_TO_SELECTION.set(editor, [
          [[[Node.get(editor, [0, 0, 1]), [0, 0, 1]], { rtl: 0, ltr: 0, ttb: 0, btt: 0 }]],
          [[[Node.get(editor, [0, 1, 1]), [0, 1, 1]], { rtl: 0, ltr: 0, ttb: 0, btt: 0 }]],
        ])
      })

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(editor.getHtml()).toBe(before)
    })

    it('cancels Cut when the native selection moves to another cell during the writer chain', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      let nativeRange: any

      selectRectangle(editor, 0, 0, 1, 0)
      nativeRange = editor.selection
      vi.spyOn(DomEditor, 'findDocumentOrShadowRoot').mockReturnValue({
        getSelection: () => ({ rangeCount: 1 }),
      } as any)
      vi.spyOn(DomEditor, 'toSlateRange').mockImplementation(() => nativeRange)
      wrapWriter(editor, (data, run) => {
        run()
        nativeRange = {
          anchor: { path: [0, 0, 1, 0, 0], offset: 0 },
          focus: { path: [0, 1, 1, 0, 0], offset: 1 },
        }
      })

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(editor.getHtml()).toBe(before)
    })

    it('rejects a nested write without running its writer or owning cleanup', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      let nested: any
      let writes = 0
      let htmlDuringOuter = ''

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        writes += 1
        run()
        nested = writeClipboardFragment(editor, data, 'cut')
        // The nested attempt must leave the outer payload and reservation alone.
        htmlDuringOuter = data.getData('text/html')
        // A later write by the outer writer must still be cleaned up by the
        // outer completion, which is why the stage cannot be released early.
        data.setData('text/html', 'ESCAPED')
      })

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(writes).toBe(1)
      expect(nested.cancel).toBe(true)
      expect(nested.skipWrite).toBe(true)
      expect(htmlDuringOuter).not.toBe('')
      expect(result.cancel).toBe(true)
      expect(clipboard.getData('text/html')).toBe('')
      expect(editor.getHtml()).toBe(before)
    })

    it('cancels a nested Cut of an ordinary range on the same native transfer', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      let nested: any

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        // The nested Cut now targets ordinary paragraph text, outside any table.
        editor.selection = {
          anchor: { path: [1, 0], offset: 0 },
          focus: { path: [1, 0], offset: 4 },
        }
        nested = runCut(editor, data)
      })

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(nested.cancel).toBe(true)
      expect(nested.skipWrite).toBe(true)
      expect(result.cancel).toBe(true)
      expect(Node.string(Node.get(editor, [1]))).toBe('tail')
      expect(editor.getHtml()).toBe(before)
    })

    it('declines a transfer when another participant already owns completion', () => {
      const cells = [['A', 'B'], ['C', 'D']]
      const content: any[] = [
        {
          type: 'table',
          width: 'auto',
          columnWidths: [100, 200],
          children: cells.map(row => ({
            type: 'table-row',
            children: row.map(text => ({
              type: 'table-cell',
              children: [{ type: 'paragraph', children: [{ text }] }],
            })),
          })),
        },
        { type: 'paragraph', children: [{ text: 'tail' }] },
      ]
      let completed = 0
      // Simulate a plugin installed before the table module: it registers the
      // single completion first, so the table module must not assume ownership.
      const editor = coreCreateEditor({
        content,
        plugins: [
          ed => {
            ed.on(ClipboardFragmentEvents.BEFORE_WRITE, (context: any) => {
              context.handled = true
              context.setCompletion(() => { completed += 1 })
            })
            return ed
          },
          withTable,
        ],
      }) as any

      editor.alert = vi.fn()
      selectRectangle(editor, 0, 0, 1, 0)

      const clipboard = createClipboard()

      clipboard.setData('text/html', 'OLD HTML')
      const before = JSON.stringify(editor.children)
      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(result.skipWrite).toBe(true)
      expect((result.error as Error).message).toBe('Clipboard completion already registered')
      expect(completed).toBe(1)
      expect(clipboard.getData('text/html')).toBe('OLD HTML')
      expect(clipboard.getData('application/x-slate-fragment')).toBe('')
      expect(clipboard.getData('text/plain')).toBe('')
      expect(JSON.stringify(editor.children)).toBe(before)
    })

    it('restores the pre-transfer formats when a nested write is cancelled', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      let nested: any

      clipboard.setData('text/plain', 'OLD TEXT')
      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        nested = writeClipboardFragment(editor, data, 'cut')
        data.setData('text/plain', 'ESCAPED')
      })

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(nested.cancel).toBe(true)
      expect(result.cancel).toBe(true)
      expect(clipboard.getData('text/plain')).toBe('OLD TEXT')
      expect(editor.getHtml()).toBe(before)
    })

    it('cleans up and alerts when a later before listener throws after ownership', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()

      selectRectangle(editor, 0, 0, 1, 0)
      editor.on(ClipboardFragmentEvents.BEFORE_WRITE, () => { throw new Error('later failed') })

      const before = editor.getHtml()
      const result = runCut(editor, clipboard)

      expect(result.cancel).toBe(true)
      expect(result.skipWrite).toBe(true)
      expect(clipboard.getData('text/html')).toBe('')
      expect(clipboard.getData('application/x-slate-fragment')).toBe('')
      expect(editor.alert).toHaveBeenCalled()
      expect(editor.getHtml()).toBe(before)
    })

    it('releases its reservation after a failed transfer', () => {
      const editor = createTableEditor()
      const clipboard = createClipboard()
      let fail = true

      selectRectangle(editor, 0, 0, 1, 0)
      wrapWriter(editor, (data, run) => {
        run()
        if (fail) {
          fail = false
          data.clearData('text/html')
        }
      })

      expect(runCut(editor, clipboard).cancel).toBe(true)
      expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('A')

      const second = runCut(editor, clipboard)

      expect(second.cancel).toBe(false)
      expect(Node.string(Node.get(editor, [0, 0, 0]))).toBe('')
      expect(Node.string(Node.get(editor, [0, 1, 0]))).toBe('')
    })
  })
})
