import {
  drawSelectionOverlay,
  getSelectionPerimeterSegments,
  SelectionRect,
} from '../src/module/render-elem/selection-overlay'

function createRect(top: number, right: number, bottom: number, left: number): DOMRect {
  return {
    x: left,
    y: top,
    top,
    right,
    bottom,
    left,
    width: right - left,
    height: bottom - top,
    toJSON: () => ({}),
  }
}

function createGrid(rowCount: number, columnCount: number): SelectionRect[] {
  return Array.from({ length: rowCount }, (_rowValue, row) =>
    Array.from({ length: columnCount }, (_columnValue, column) => ({
      top: row * 30,
      right: (column + 1) * 60,
      bottom: (row + 1) * 30,
      left: column * 60,
    }))
  ).flat()
}

describe('table selection perimeter segments', () => {
  test('keeps only the perimeter cell edges of a rectangular selection', () => {
    const segments = getSelectionPerimeterSegments(createGrid(3, 3))

    expect(segments).toHaveLength(4)
    expect(segments.map(segment => segment.side).sort()).toEqual(['bottom', 'left', 'right', 'top'])
  })

  test('keeps only the exposed part of a merged cell side', () => {
    const segments = getSelectionPerimeterSegments([
      { top: 0, right: 70, bottom: 30, left: 0 },
      { top: 30, right: 200, bottom: 75, left: 0 },
    ])
    const mergedCellTop = segments.filter(
      segment => segment.side === 'top' && segment.offset === 30
    )

    expect(mergedCellTop).toEqual([
      {
        side: 'top',
        offset: 30,
        start: 70,
        end: 200,
      },
    ])
    expect(
      segments.some(segment => segment.offset === 30 && segment.start === 0 && segment.end === 70)
    ).toBe(false)
  })

  test('closes both the outside and the inside of a selection containing a hole', () => {
    const cells = createGrid(3, 3).filter((_cell, index) => index !== 4)
    const segments = getSelectionPerimeterSegments(cells)
    const innerSegments = segments
      .filter(
        segment =>
          (segment.side === 'right' && segment.offset === 60) ||
          (segment.side === 'left' && segment.offset === 120) ||
          (segment.side === 'bottom' && segment.offset === 30) ||
          (segment.side === 'top' && segment.offset === 60)
      )
      .filter(segment => segment.start === 30 || segment.start === 60)

    expect(segments).toHaveLength(8)
    expect(innerSegments).toHaveLength(4)
  })

  test('draws with the owner document and skips layout when the selection is empty', () => {
    const iframe = document.createElement('iframe')

    document.body.appendChild(iframe)

    try {
      const targetDocument = iframe.contentDocument

      if (!targetDocument) {
        throw new Error('iframe document is unavailable')
      }

      const container = targetDocument.createElement('div')
      const table = targetDocument.createElement('table')
      const overlay = targetDocument.createElement('div')

      table.innerHTML = '<tbody><tr><td class="w-e-selected">A</td></tr></tbody>'
      container.appendChild(table)
      container.appendChild(overlay)
      targetDocument.body.appendChild(container)

      const cell = table.querySelector('td') as HTMLTableCellElement
      const overlayRect = vi
        .spyOn(overlay, 'getBoundingClientRect')
        .mockReturnValue(createRect(13, 12, 13, 12))

      vi.spyOn(cell, 'getBoundingClientRect').mockReturnValue(createRect(13, 112, 43, 12))

      expect(overlay instanceof HTMLElement).toBe(false)

      drawSelectionOverlay(overlay)

      const segments = Array.from(
        overlay.querySelectorAll<HTMLElement>('.w-e-table-selection-segment')
      )

      expect(segments).toHaveLength(4)
      expect(segments.every(segment => segment.ownerDocument === targetDocument)).toBe(true)
      expect(overlay.querySelector<HTMLElement>('[data-selection-edge="left"]')?.style.left).toBe(
        '0px'
      )

      overlayRect.mockClear()
      cell.classList.remove('w-e-selected')
      drawSelectionOverlay(overlay)

      expect(overlay.childElementCount).toBe(0)
      expect(overlayRect).not.toHaveBeenCalled()
    } finally {
      iframe.remove()
    }
  })
})
