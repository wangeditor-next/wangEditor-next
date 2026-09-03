import { Element, Node } from 'slate'

import createEditor from '../../../tests/utils/create-editor'

const RICH_CELL_HTML = [
  '<table><tbody><tr><td>',
  '<p>第一段</p><p>第二段</p>',
  '<ol start="3" type="A"><li>编号项</li></ol>',
  '<ul><li>无序项</li></ul>',
  '</td></tr></tbody></table>',
  '<p><br></p>',
].join('')

function getFirstCell(editor: ReturnType<typeof createEditor>) {
  return (editor.children[0] as any).children[0].children[0]
}

function getCellBlockTypes(editor: ReturnType<typeof createEditor>) {
  return getFirstCell(editor).children.map((child: any) => child.type)
}

describe('table rich cell content', () => {
  it('preserves paragraph and list blocks from HTML to Slate to HTML', () => {
    const editor = createEditor({ html: RICH_CELL_HTML })

    expect(getCellBlockTypes(editor)).toEqual([
      'paragraph',
      'paragraph',
      'list-item',
      'list-item',
    ])
    expect(Node.string(getFirstCell(editor))).toContain('第一段')

    const output = editor.getHtml()

    expect(output).toContain('<p>第一段</p>')
    expect(output).toContain('<ol type="A" start="3">')
    expect(output).toContain('<li>编号项</li>')
    expect(output).toContain('<ul><li>无序项</li></ul>')
  })

  it('preserves rich Slate blocks through Slate to HTML to Slate', () => {
    const editor = createEditor({
      content: [
        {
          type: 'table',
          width: 'auto',
          columnWidths: [90],
          children: [
            {
              type: 'table-row',
              children: [
                {
                  type: 'table-cell',
                  children: [
                    { type: 'paragraph', children: [{ text: '段落' }] },
                    { type: 'list-item', ordered: false, children: [{ text: '列表' }] },
                  ],
                },
              ],
            },
          ],
        },
      ],
    })

    const output = editor.getHtml()

    editor.setHtml(output)
    expect(getCellBlockTypes(editor)).toEqual(['paragraph', 'list-item'])
    expect(Node.string(getFirstCell(editor))).toBe('段落列表')
  })

  it('keeps setHtml(getHtml()) and toHtml(parseHtml(html)) stable', () => {
    const editor = createEditor({ html: RICH_CELL_HTML })
    const firstOutput = editor.getHtml()

    editor.setHtml(firstOutput)
    const secondOutput = editor.getHtml()
    const reparsedEditor = createEditor({ html: firstOutput })

    expect(secondOutput).toBe(firstOutput)
    expect(reparsedEditor.getHtml()).toBe(firstOutput)
    expect(getCellBlockTypes(reparsedEditor)).toEqual([
      'paragraph',
      'paragraph',
      'list-item',
      'list-item',
    ])
  })

  it('canonicalizes legacy text-only cells before paths are created', () => {
    const legacyContent: any[] = [
      {
        type: 'table',
        width: 'auto',
        columnWidths: [90],
        children: [
          {
            type: 'table-row',
            children: [{ type: 'table-cell', children: [{ text: 'legacy', bold: true }] }],
          },
        ],
      },
    ]
    const editor = createEditor({ content: legacyContent })
    const cell = getFirstCell(editor)

    expect(cell.children).toEqual([
      { type: 'paragraph', children: [{ text: 'legacy', bold: true }] },
    ])
    expect(legacyContent[0].children[0].children[0].children).toEqual([
      { text: 'legacy', bold: true },
    ])
  })

  it('preserves pasted paragraph and list blocks inside a cell', () => {
    const editor = createEditor({ html: '<table><tbody><tr><td><p>A</p></td></tr></tbody></table>' })

    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 0, 0], offset: 1 },
    }
    editor.insertData({
      getData(type: string) {
        if (type === 'text/html') {return '<p>第二段</p><ul><li>粘贴列表</li></ul>'}
        if (type === 'text/plain') {return '第二段\n粘贴列表'}
        return ''
      },
    } as DataTransfer)

    const cell = getFirstCell(editor)

    expect(cell.children.every(Element.isElement)).toBe(true)
    expect(cell.children).toEqual([
      expect.objectContaining({ type: 'paragraph' }),
      expect.objectContaining({ type: 'list-item' }),
    ])
    expect(editor.getHtml()).toContain('<ul><li>粘贴列表</li></ul>')
  })

  it('rejects unsupported nested nodes from internal Slate fragments', () => {
    const editor = createEditor({
      html: '<table><tbody><tr><td><p>A</p></td></tr></tbody></table>',
    })
    const unsupportedFragment = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'video',
            src: 'https://example.com/video.mp4',
            children: [{ text: '' }],
          },
        ],
      },
    ]
    const encodedFragment = window.btoa(encodeURIComponent(JSON.stringify(unsupportedFragment)))

    editor.selection = {
      anchor: { path: [0, 0, 0, 0, 0], offset: 1 },
      focus: { path: [0, 0, 0, 0, 0], offset: 1 },
    }
    editor.insertData({
      getData(type: string) {
        if (type === 'application/x-slate-fragment') {return encodedFragment}
        if (type === 'text/plain') {return 'fallback'}
        return ''
      },
    } as DataTransfer)

    const cell = getFirstCell(editor)

    expect(Node.string(cell)).toBe('Afallback')
    expect(cell.children).toEqual([
      { type: 'paragraph', children: [{ text: 'Afallback' }] },
    ])
  })
})
