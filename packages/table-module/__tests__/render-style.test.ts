import { describe, expect, test } from 'vitest'

import { renderStyle } from '../src/module/render-style'

describe('table renderStyle', () => {
  test('applies vertical align to table cell vnode', () => {
    const vnode = { data: {} } as any
    const styled = renderStyle(
      {
        type: 'table-cell',
        verticalAlign: 'middle',
        children: [{ text: 'A' }],
      } as any,
      vnode
    ) as any

    expect(styled.data.style.verticalAlign).toBe('middle')
  })
})
