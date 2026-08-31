import { Node } from 'slate'

import createEditor from '../../../tests/utils/create-editor'

describe('table rich cell content', () => {
  it('preserves paragraph and list blocks through HTML round-trip', () => {
    const editor = createEditor()

    editor.setHtml(
      '<table><tbody><tr><td><p>第一段</p><p>第二段</p><ul><li>列表项</li></ul></td></tr></tbody></table>'
    )

    const cell: any = (editor.children[0] as any).children[0].children[0]

    expect(cell.children.map((child: any) => child.type)).toEqual([
      'paragraph',
      'paragraph',
      'list-item',
    ])
    expect(Node.string(cell)).toContain('第一段')
    expect(Node.string(cell)).toContain('列表项')

    const output = editor.getHtml()

    expect(output).toContain('<p>第一段</p>')
    expect(output).toContain('<p>第二段</p>')
    expect(output).toContain('<ul>')
    expect(output).toContain('<li>列表项</li>')
  })
})
