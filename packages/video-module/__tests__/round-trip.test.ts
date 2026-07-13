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
})
