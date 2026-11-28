import createEditor from '../../../../tests/utils/create-editor'

describe.each(['inline', 'class'] as const)('link href round-trip in %s mode', textStyleMode => {
  it.each([
    ['literal named entity', '/&amp;copy;', '/&copy;'],
    ['literal numeric entity', '/&amp;#169;', '/&#169;'],
    ['query parameters', '/?a=1&amp;b=2', '/?a=1&b=2'],
    ['Unicode', '/©/中文', '/©/中文'],
    ['attribute delimiters', '/a&quot;&amp;&lt;&gt;\'b', '/a"&<>\'b'],
    ['formatting whitespace', '/a b\tc%20d', '/a%20bc%20d'],
  ])('preserves %s', (_label, htmlPath, expectedPath) => {
    const origin = 'https://example.org'
    const url = origin + expectedPath
    const href = origin + htmlPath
    const editor = createEditor({
      config: { textStyleMode },
      html: `<p><a href="${href}" target="_self"><strong>docs</strong></a></p>`,
    })
    const firstHtml = editor.getHtml()

    for (let i = 0; i < 3; i += 1) {
      expect(editor.getElemsByTypePrefix('link')).toMatchObject([
        { type: 'link', url, target: '_self', children: [{ text: 'docs', bold: true }] },
      ])
      const html = editor.getHtml()
      const anchor = new DOMParser().parseFromString(html, 'text/html').querySelector('a')

      expect(html).toBe(firstHtml)
      expect(anchor?.getAttribute('href')).toBe(url)
      expect(anchor?.href).toBe(new URL(url).href)
      editor.setHtml(html)
    }
  })
})
