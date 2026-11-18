import { IDomEditor } from '@wangeditor-next/core'

import withVideo, { serializeVideoClipboardHtml } from '../src/module/plugin'

type ClipboardValues = Record<string, string>

function createClipboardData(values: ClipboardValues = {}) {
  return {
    getData: (type: string) => values[type] || '',
    setData: (type: string, value: string) => {
      values[type] = value
    },
  }
}

describe('video clipboard playback attributes', () => {
  it('serializes playback markers as real HTML boolean attributes', () => {
    const html = serializeVideoClipboardHtml(
      '<figure><video data-w-e-video-autoplay="true" data-w-e-video-muted="true"></video></figure>'
    )

    expect(html).toContain('<video autoplay="" muted=""></video>')
    expect(html).not.toContain('data-w-e-video-autoplay')
    expect(html).not.toContain('data-w-e-video-muted')
  })

  it('wraps the editor clipboard writer and preserves playback attributes', () => {
    const originalSetFragmentData = vi.fn(data => {
      data.setData(
        'text/html',
        '<figure><video data-w-e-video-autoplay="true" data-w-e-video-muted="true"></video></figure>'
      )
    })
    const editor = {
      isVoid: vi.fn(() => false),
      normalizeNode: vi.fn(),
      setFragmentData: originalSetFragmentData,
    } as unknown as IDomEditor

    const wrappedEditor = withVideo(editor)

    const values: ClipboardValues = {}

    wrappedEditor.setFragmentData(createClipboardData(values))

    const html = values['text/html']

    expect(originalSetFragmentData).toHaveBeenCalledTimes(1)
    expect(html).toContain('autoplay=""')
    expect(html).toContain('muted=""')
    expect(html).not.toContain('data-w-e-video-autoplay')
    expect(html).not.toContain('data-w-e-video-muted')
  })
})
