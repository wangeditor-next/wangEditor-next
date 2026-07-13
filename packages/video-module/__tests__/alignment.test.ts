import {
  getVideoAlign,
  getVideoAlignClass,
  getVideoJustifyContent,
  normalizeVideoAlign,
} from '../src/module/alignment'

describe('video alignment', () => {
  it.each([
    ['left', 'flex-start'],
    ['center', 'center'],
    ['right', 'flex-end'],
  ] as const)('maps %s to a stable flex layout', (align, justifyContent) => {
    expect(normalizeVideoAlign(align)).toBe(align)
    expect(getVideoAlignClass(align)).toBe(`w-e-video-align-${align}`)
    expect(getVideoJustifyContent(align)).toBe(justifyContent)
  })

  it('uses center for missing and unsupported values', () => {
    expect(normalizeVideoAlign(undefined)).toBe('center')
    expect(normalizeVideoAlign('justify')).toBe('center')
  })

  it('reads legacy textAlign only when align is missing', () => {
    expect(getVideoAlign({ type: 'video', align: 'right' } as any)).toBe('right')
    expect(getVideoAlign({ type: 'video', textAlign: 'left' } as any)).toBe('left')
  })
})
