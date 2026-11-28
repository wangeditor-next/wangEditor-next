import createEditor from '../../../tests/utils/create-editor'
import { formatHtml } from '../src/module/helper'

describe('plugin-html-source helper', () => {
  it('puts each top-level element on its own line', () => {
    const html = '<h1>Title</h1><p>Hello <strong>world</strong></p><ul><li>a</li><li>b</li></ul>'

    expect(formatHtml(html)).toBe(
      '<h1>Title</h1>\n<p>Hello <strong>world</strong></p>\n<ul><li>a</li><li>b</li></ul>',
    )
  })

  it('keeps the inner content of each element unchanged', () => {
    const html = '<pre><code class="language-js">if (a &lt; b) {\n  run()\n}</code></pre><p>a&nbsp;&nbsp;b</p>'

    expect(formatHtml(html)).toBe(
      '<pre><code class="language-js">if (a &lt; b) {\n  run()\n}</code></pre>\n<p>a&nbsp;&nbsp;b</p>',
    )
  })

  it('drops whitespace between top-level elements', () => {
    expect(formatHtml('<p>a</p>\n  <p>b</p>\n')).toBe('<p>a</p>\n<p>b</p>')
  })

  it('returns the html unchanged when it contains top-level text', () => {
    const html = 'plain <p>text</p>'

    expect(formatHtml(html)).toBe(html)
  })

  it('returns an empty string for empty html', () => {
    expect(formatHtml('')).toBe('')
  })

  it('keeps setHtml round-trips stable for rich content', () => {
    const editor = createEditor({
      html: [
        '<h1>Title</h1>',
        '<p><span style="color: rgb(255, 0, 0);">red</span> &amp; <a href="https://example.com/?a=1&amp;b=2" target="_blank">link</a></p>',
        '<ul><li>one</li><li>two</li></ul>',
        '<blockquote>quote</blockquote>',
        '<pre><code class="language-javascript">const a = 1 &lt; 2</code></pre>',
        '<table style="width: auto;"><tbody><tr><th colspan="1" rowspan="1" width="auto">head</th></tr><tr><td colspan="1" rowspan="1" width="auto">cell</td></tr></tbody></table>',
        '<p><img src="https://example.com/a.png" alt="a" data-href="" style=""/></p>',
      ].join(''),
    })
    const html = editor.getHtml()

    expect(html).toContain('<table')
    expect(html).toContain('<img')
    expect(html).toContain('<ul>')

    editor.setHtml(formatHtml(html))

    expect(editor.getHtml()).toBe(html)
  })
})
