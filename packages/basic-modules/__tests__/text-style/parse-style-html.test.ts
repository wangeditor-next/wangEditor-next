import createEditor from '../../../../tests/utils/create-editor'
import { parseStyleHtml } from '../../src/modules/text-style/parse-style-html'
import $ from '../../src/utils/dom'

describe('parse style html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('it should return directly if give node that type is not text', () => {
    const element = $('<p></p>')
    const node = { type: 'paragraph', children: [] }

    expect(parseStyleHtml(element[0], node, editor)).toEqual(node)
  })

  it('it should do nothing if give not exist element', () => {
    const element = $('#text')
    const node = { type: 'paragraph', children: [] }

    expect(parseStyleHtml(element[0], node, editor)).toEqual(node)
  })

  it('it should set bold property for node if give strong element', () => {
    const element = $('<strong></strong>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, bold: true })
  })

  it('it should set bold property for node if give b element', () => {
    const element = $('<b></b>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, bold: true })
  })

  it('it should set italic property for node if give i element', () => {
    const element = $('<i></i>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, italic: true })
  })

  it('it should set italic property for node if give em element', () => {
    const element = $('<em></em>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, italic: true })
  })

  it('it should set underline property for node if give u element', () => {
    const element = $('<u></u>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, underline: true })
  })

  it('it should set through property for node if give s element', () => {
    const element = $('<s></s>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, through: true })
  })

  it('it should set through property for node if give strike element', () => {
    const element = $('<strike></strike>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, through: true })
  })

  it('it should set sub property for node if give sub element', () => {
    const element = $('<sub></sub>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, sub: true })
  })

  it('it should set sup property for node if give sup element', () => {
    const element = $('<sup></sup>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, sup: true })
  })

  it('it should set code property for node if give code element', () => {
    const element = $('<code></code>')
    const node = { text: 'text' }

    expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, code: true })
  })

  it('it should set text styles from inline style attrs', () => {
    const cases = [
      { html: '<span style="font-weight: 700;"></span>', key: 'bold' },
      { html: '<span style="font-style: italic;"></span>', key: 'italic' },
      { html: '<span style="text-decoration: underline;"></span>', key: 'underline' },
      { html: '<span style="text-decoration-line: line-through;"></span>', key: 'through' },
      { html: '<span style="vertical-align: sub;"></span>', key: 'sub' },
      { html: '<span style="vertical-align: super;"></span>', key: 'sup' },
    ]

    cases.forEach(({ html, key }) => {
      const element = $(html)
      const node = { text: 'text' }

      expect(parseStyleHtml(element[0], node, editor)).toEqual({ ...node, [key]: true })
    })
  })

  it('it should keep nested bold scoped to the matching text only', () => {
    const nestedEditor = createEditor({ html: '<p><span>A<strong>B</strong>C</span></p>' })

    expect(nestedEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          { text: 'B', bold: true },
          { text: 'C' },
        ],
      },
    ])
  })

  it('it should keep nested sup scoped to the matching text only', () => {
    const nestedEditor = createEditor({ html: '<p><span>A<sup>2</sup>B</span></p>' })

    expect(nestedEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          { text: '2', sup: true },
          { text: 'B' },
        ],
      },
    ])
  })

  it('it should parse Office-like inline styles without expanding them to the whole segment', () => {
    const nestedEditor = createEditor({
      html: '<p><span>A<span style="font-weight: 700;">B</span><span style="vertical-align: super;">2</span>C</span></p>',
    })

    expect(nestedEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [
          { text: 'A' },
          { text: 'B', bold: true },
          { text: '2', sup: true },
          { text: 'C' },
        ],
      },
    ])
  })

  it('it should preserve consecutive spaces in underlined html imports', () => {
    const underlinedSpaces = '        '
    const nestedEditor = createEditor({ html: `<p><u>${underlinedSpaces}</u></p>` })

    expect(nestedEditor.children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: underlinedSpaces, underline: true }],
      },
    ])
    expect(nestedEditor.getText()).toBe(underlinedSpaces)
  })
})
