import { Editor } from 'slate'

import { DomEditor } from '../../../src/editor/dom-editor'
import { withEventData } from '../../../src/editor/plugins/with-event-data'

describe('withEventData', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('setFragmentData returns early for collapsed non-void selections', () => {
    const data = {
      setData: vi.fn(),
      getData: vi.fn(),
    }
    const editor = withEventData({
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 0 },
      },
    } as any)

    vi.spyOn(Editor, 'void').mockReturnValue(null)

    editor.setFragmentData(data)

    expect(data.setData).not.toHaveBeenCalled()
  })

  test('setFragmentData writes slate fragment, html, and plain text', () => {
    const data = {
      setData: vi.fn(),
      getData: vi.fn(),
    }
    const editor = withEventData({
      selection: {
        anchor: { path: [0, 0], offset: 0 },
        focus: { path: [0, 0], offset: 1 },
      },
      getFragment: () => [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    } as any)
    const domRange = {
      cloneContents: () => {
        const fragment = document.createDocumentFragment()

        fragment.appendChild(document.createTextNode('hello'))
        return fragment
      },
    }

    vi.spyOn(Editor, 'void').mockReturnValue(null)
    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue(domRange as any)

    editor.setFragmentData(data)

    expect(data.setData).toHaveBeenCalledWith(
      'application/x-slate-fragment',
      expect.any(String),
    )
    expect(data.setData).toHaveBeenCalledWith(
      'text/html',
      expect.stringContaining('data-slate-fragment'),
    )
    expect(data.setData).toHaveBeenCalledWith('text/plain', 'hello')
  })

  test('insertData restores slate fragments before checking html or text', () => {
    const editor = withEventData({
      insertFragment: vi.fn(),
      insertText: vi.fn(),
      dangerouslyInsertHtml: vi.fn(),
      getConfig: () => ({}),
    } as any)
    const fragment = [{ type: 'paragraph', children: [{ text: 'A' }] }]
    const encoded = window.btoa(encodeURIComponent(JSON.stringify(fragment)))

    editor.insertData({
      getData: (type: string) => (type === 'application/x-slate-fragment' ? encoded : ''),
    } as DataTransfer)

    expect(editor.insertFragment).toHaveBeenCalledWith(fragment)
    expect(editor.dangerouslyInsertHtml).not.toHaveBeenCalled()
    expect(editor.insertText).not.toHaveBeenCalled()
  })

  test('insertData sanitizes html and inserts plain text fragments with line breaks', () => {
    const sanitizeHtml = vi.fn((html: string) => `<section>${html}</section>`)
    const htmlEditor = withEventData({
      insertFragment: vi.fn(),
      insertText: vi.fn(),
      dangerouslyInsertHtml: vi.fn(),
      getConfig: () => ({ sanitizeHtml }),
    } as any)

    htmlEditor.insertData({
      getData: (type: string) => {
        if (type === 'text/html') { return '<p>unsafe</p>' }
        return ''
      },
    } as DataTransfer)

    expect(sanitizeHtml).toHaveBeenCalledWith('<p>unsafe</p>')
    expect(htmlEditor.dangerouslyInsertHtml).toHaveBeenCalledWith('<section><p>unsafe</p></section>')

    const textEditor = withEventData({
      insertFragment: vi.fn(),
      insertText: vi.fn(),
      dangerouslyInsertHtml: vi.fn(),
      getConfig: () => ({}),
    } as any)

    textEditor.insertData({
      getData: (type: string) => {
        if (type === 'text/plain') { return 'line1\nline2' }
        return ''
      },
    } as DataTransfer)

    expect(textEditor.insertFragment).toHaveBeenCalledWith([
      { type: 'paragraph', children: [{ text: 'line1' }] },
      { type: 'paragraph', children: [{ text: 'line2' }] },
    ])
    expect(textEditor.insertText).not.toHaveBeenCalled()
  })
})
