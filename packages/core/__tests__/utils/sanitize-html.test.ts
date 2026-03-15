/**
 * @description sanitize html test
 * @author Codex
 */

import { defaultSanitizeHtml } from '../../src/utils/sanitize-html'

describe('sanitize html', () => {
  it('removes executable tags, attrs and urls', () => {
    const unsafeHref = ['java', 'script:alert(1)'].join('')
    const html = `
      <img src="x" onerror="alert(1)" />
      <a href="${unsafeHref}" onclick="alert(1)">bad</a>
      <iframe src="//player.example.com/embed/1" srcdoc="<script>alert(1)</script>"></iframe>
      <svg onload="alert(1)"><circle></circle></svg>
    `
    const sanitized = defaultSanitizeHtml(html)

    expect(sanitized).not.toContain('onerror')
    expect(sanitized).not.toContain('onclick')
    expect(sanitized).not.toContain(unsafeHref)
    expect(sanitized).not.toContain('srcdoc')
    expect(sanitized).not.toContain('<svg')
    expect(sanitized).toContain('<img src="x">')
    expect(sanitized).toContain('<a>bad</a>')
    expect(sanitized).toContain('<iframe src="//player.example.com/embed/1"></iframe>')
  })

  it('preserves editor supported attrs', () => {
    const html = `
      <div data-w-e-type="video" data-w-e-is-void style="text-align: center;">
        <iframe
          src="//player.bilibili.com/player.html?aid=1"
          allowfullscreen="true"
          frameborder="0"
        ></iframe>
      </div>
      <div data-w-e-type="todo"><input type="checkbox" disabled checked>task</div>
    `
    const sanitized = defaultSanitizeHtml(html)

    expect(sanitized).toContain('data-w-e-type="video"')
    expect(sanitized).toContain('data-w-e-is-void=""')
    expect(sanitized).toContain('style="text-align: center;"')
    expect(sanitized).toContain('allowfullscreen="true"')
    expect(sanitized).toContain('frameborder="0"')
    expect(sanitized).toContain('type="checkbox"')
    expect(sanitized).toContain('disabled=""')
    expect(sanitized).toContain('checked=""')
  })
})
