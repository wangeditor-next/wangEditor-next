import { createEditor } from '../src/index'

describe('issue #1044 HTML entity round-trip', () => {
  it('escapes ampersands and preserves entity-like inline text', () => {
    const text = 'Write &lt;b&gt; for <b>, and &amp; for &'
    const container = document.createElement('div')

    document.body.appendChild(container)
    const editor = createEditor({
      selector: container,
      content: [{ type: 'paragraph', children: [{ text }] }],
    })

    try {
      const html = editor.getHtml()

      expect(html).toBe('<p>Write &amp;lt;b&amp;gt; for &lt;b&gt;, and &amp;amp; for &amp;</p>')

      const roundTripEditor = createEditor({ html })

      expect(roundTripEditor.getText()).toBe(text)

      editor.setHtml(html)
      expect(editor.getText()).toBe(text)
      expect(editor.getHtml()).toBe(html)
    } finally {
      document.body.removeChild(container)
    }
  })

  it('preserves entity-like text inside inline elements', () => {
    const html = '<p><strong>&amp;lt;b&amp;gt;</strong> <span>&amp;amp;</span></p>'
    const editor = createEditor({ html })

    expect(editor.getText()).toBe('&lt;b&gt; &amp;')
    expect(editor.children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: '&lt;b&gt;', bold: true }, { text: ' ' }, { text: '&amp;' }],
      },
    ])
    expect(editor.getHtml()).toBe('<p><strong>&amp;lt;b&amp;gt;</strong> &amp;amp;</p>')
  })

  it('preserves literal `&nbsp;` inside code blocks', () => {
    const html = '<pre><code>s = "&amp;nbsp;"</code></pre>'
    const editor = createEditor({ html })

    expect(editor.getText()).toBe('s = "&nbsp;"')
    expect(editor.getHtml()).toBe('<pre><code >s = "&amp;nbsp;"</code></pre>')

    const roundTripEditor = createEditor({ html: editor.getHtml() })

    expect(roundTripEditor.getText()).toBe('s = "&nbsp;"')
    expect(roundTripEditor.getHtml()).toBe(editor.getHtml())
  })

  it('keeps consecutive spaces encoded as nbsp entities', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'a  b' }] }],
    })
    const html = editor.getHtml()

    expect(html).toBe('<p>a &nbsp;b</p>')
    expect(createEditor({ html }).getText()).toBe('a  b')
  })
})
