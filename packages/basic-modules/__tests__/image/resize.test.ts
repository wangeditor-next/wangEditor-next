/**
 * @description image resize policy test
 */

import { describe, expect, it, vi } from 'vitest'

import { normalizeImageSize, updateImageSize, validateImageSize } from '../../src/modules/image/resize'

describe('image resize policy', () => {
  it('preserves legacy values when no unit is configured', () => {
    expect(normalizeImageSize('30%', undefined)).toBe('30%')
    expect(normalizeImageSize('100', undefined)).toBe('100px')
    expect(normalizeImageSize('invalid', undefined)).toBe('auto')
  })

  it('normalizes numeric values and rejects mismatched units', () => {
    expect(normalizeImageSize('100', 'px')).toBe('100px')
    expect(normalizeImageSize('100%', 'px')).toBeNull()
    expect(normalizeImageSize('30', '%')).toBe('30%')
    expect(normalizeImageSize('30px', '%')).toBeNull()
  })

  it('maps legacy preset percentages to the configured px unit', () => {
    expect(normalizeImageSize('30%', 'px', 'preset')).toBe('30px')
  })

  it('passes normalized values and the resize source to custom validation', () => {
    const checkImageSize = vi.fn(() => true)
    const editor = {
      getConfig: () => ({ imageResize: { resizeUnit: 'px', checkImageSize } }),
      alert: vi.fn(),
    } as any

    expect(validateImageSize(editor, '100', '80', 'drag')).toEqual({
      width: '100px',
      height: '80px',
    })
    expect(checkImageSize).toHaveBeenCalledWith({
      width: '100px',
      height: '80px',
      rawWidth: '100',
      rawHeight: '80',
      source: 'drag',
    })
  })

  it('rejects custom validation without mutating the editor', () => {
    const editor = {
      getConfig: () => ({ imageResize: { resizeUnit: 'px', checkImageSize: () => false } }),
      alert: vi.fn(),
    } as any

    expect(validateImageSize(editor, '100px', '80px', 'modal')).toBeNull()
    expect(editor.alert).not.toHaveBeenCalled()
  })

  it('does not fall back to updating every image when the target path is unavailable', () => {
    const editor = {
      getConfig: () => ({ imageResize: {} }),
      alert: vi.fn(),
    } as any

    expect(updateImageSize(editor, { type: 'image' }, '100px', '80px', 'modal')).toBe(false)
  })
})
