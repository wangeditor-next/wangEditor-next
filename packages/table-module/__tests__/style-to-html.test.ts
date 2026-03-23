import { describe, expect, test } from 'vitest'

import { styleToHtml } from '../src/module/style-to-html'
import $ from '../src/utils/dom'

if ($.fn && !$.fn.css) {
  $.fn.css = function (key: string, value: string) {
    this.forEach((elem: HTMLElement) => {
      elem.style.setProperty(key, value)
    })
    return this
  }
}

describe('table styleToHtml', () => {
  test('returns original html for non-table nodes', () => {
    const html = '<div>plain</div>'

    expect(styleToHtml({ type: 'paragraph' }, html)).toBe(html)
  })

  test('returns original html when no table styles are provided', () => {
    const html = '<table><tr><td>a</td></tr></table>'

    expect(styleToHtml({ type: 'table' }, html)).toBe(html)
  })

  test('applies table-cell styles and omits border-style none', () => {
    const html = '<td>a</td>'
    const styled = styleToHtml(
      {
        type: 'table-cell',
        backgroundColor: '#fff',
        borderWidth: '2',
        borderStyle: 'none',
        borderColor: '#000',
        textAlign: 'center',
      },
      html,
    )

    expect(styled).toContain('background-color: rgb(255, 255, 255);')
    expect(styled).toContain('border-width: 2px;')
    expect(styled).toContain('border-color: #000;')
    expect(styled).toContain('text-align: center;')
    expect(styled).not.toContain('border-style:')
  })
})
