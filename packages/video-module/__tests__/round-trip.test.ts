import createEditor from '../../../tests/utils/create-editor'

describe.each(['inline', 'class'] as const)('video %s mode round-trip', textStyleMode => {
  it('keeps media alignment through HTML and Slate conversions', () => {
    const editor = createEditor({
      content: [
        {
          type: 'video',
          src: 'test.mp4',
          poster: 'poster.png',
          align: 'right',
          style: { width: '640px', height: '360px' },
          children: [{ text: '' }],
        },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      config: { textStyleMode },
    })

    const firstHtml = editor.getHtml()

    expect(firstHtml).toContain('<figure data-w-e-type="video"')
    expect(firstHtml).toContain('data-w-e-align="right"')
    if (textStyleMode === 'class') {
      expect(firstHtml).toContain('class="w-e-video w-e-video-align-right"')
      expect(firstHtml).not.toMatch(/<figure[^>]*style=/)
    } else {
      expect(firstHtml).toContain('justify-content: flex-end')
    }

    editor.setHtml(firstHtml)

    const video = editor.getElemsByTypePrefix('video')[0] as any
    const secondHtml = editor.getHtml()

    expect(video.align).toBe('right')
    expect(secondHtml).toBe(firstHtml)
  })

  it('keeps video playback attributes through HTML and Slate conversions', () => {
    const editor = createEditor({
      content: [
        {
          type: 'video',
          src: 'test.mp4',
          poster: 'poster.png',
          autoplay: true,
          loop: true,
          muted: true,
          playsInline: true,
          preload: 'metadata',
          controlsList: 'nodownload noplaybackrate',
          disablePictureInPicture: true,
          children: [{ text: '' }],
        },
        { type: 'paragraph', children: [{ text: '' }] },
      ],
      config: { textStyleMode },
    })

    const firstHtml = editor.getHtml()

    expect(firstHtml).toContain(
      ' autoplay loop muted playsinline preload="metadata" controlslist="nodownload noplaybackrate" disablepictureinpicture>',
    )

    editor.setHtml(firstHtml)

    const video = editor.getElemsByTypePrefix('video')[0] as any

    expect(video).toEqual(expect.objectContaining({
      autoplay: true,
      loop: true,
      muted: true,
      playsInline: true,
      preload: 'metadata',
      controlsList: 'nodownload noplaybackrate',
      disablePictureInPicture: true,
    }))
    expect(editor.getHtml()).toBe(firstHtml)

    // The editable DOM shows the same controls, but never autoplays while editing.
    const videoElem = editor.getEditableContainer().querySelector('video') as HTMLVideoElement

    expect(videoElem.muted).toBe(true)
    expect(videoElem.hasAttribute('loop')).toBe(true)
    expect(videoElem.hasAttribute('playsinline')).toBe(true)
    expect(videoElem.getAttribute('preload')).toBe('metadata')
    expect(videoElem.getAttribute('controlslist')).toBe('nodownload noplaybackrate')
    expect(videoElem.hasAttribute('disablepictureinpicture')).toBe(true)
    expect(videoElem.hasAttribute('autoplay')).toBe(false)
  })
})
