/**
 * @description video resize test
 */

import { DomEditor } from '@wangeditor-next/core'

import createEditor from '../../../tests/utils/create-editor'
import {
  calcVideoResizeSize,
  genVideoMediaStyle,
  genVideoResizeContainerStyle,
  genVideoResizeMousedownHandler,
  isExplicitVideoSize,
  VIDEO_DRAGGER_CLASS,
  VIDEO_RESIZING_CLASS,
  VIDEO_SIZE_TIP_CLASS,
} from '../src/module/resize'

function mockRect(elem: HTMLElement, width: number, height: number) {
  vi.spyOn(elem, 'getBoundingClientRect').mockReturnValue({
    width,
    height,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect)
}

function createResizeDom(mediaHtml = '<video></video>') {
  const figure = document.createElement('figure')
  const container = document.createElement('div')

  container.innerHTML = [
    mediaHtml,
    `<div class="${VIDEO_DRAGGER_CLASS} left-top"></div>`,
    `<div class="${VIDEO_DRAGGER_CLASS} right-bottom"></div>`,
    `<div class="${VIDEO_SIZE_TIP_CLASS}"></div>`,
  ].join('')
  figure.appendChild(container)
  document.body.appendChild(figure)
  mockRect(figure, 800, 500)
  mockRect(container, 400, 200)

  return {
    figure,
    container,
    media: container.querySelector('video, iframe') as HTMLElement,
    sizeTip: container.querySelector(`.${VIDEO_SIZE_TIP_CLASS}`) as HTMLElement,
    leftDragger: container.querySelector('.left-top') as HTMLElement,
    rightDragger: container.querySelector('.right-bottom') as HTMLElement,
  }
}

function createMousedownEvent(target: HTMLElement, container: HTMLElement, clientX: number) {
  return {
    target,
    currentTarget: container,
    clientX,
    preventDefault: vi.fn(),
  } as unknown as MouseEvent
}

function moveMouse(clientX: number) {
  document.dispatchEvent(new MouseEvent('mousemove', { clientX, bubbles: true }))
}

function releaseMouse() {
  document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }))
}

function createEditorWithVideo(video: Record<string, unknown> = {}) {
  return createEditor({
    content: [
      {
        type: 'video',
        src: 'test.mp4',
        align: 'left',
        style: { width: '400px', height: '200px' },
        children: [{ text: '' }],
        ...video,
      },
      { type: 'paragraph', children: [{ text: '' }] },
    ],
  })
}

describe('video resize helpers', () => {
  it('checks whether a size is explicit', () => {
    expect(isExplicitVideoSize('100px')).toBe(true)
    expect(isExplicitVideoSize('50%')).toBe(true)
    expect(isExplicitVideoSize('auto')).toBe(false)
    expect(isExplicitVideoSize(' ')).toBe(false)
    expect(isExplicitVideoSize(undefined)).toBe(false)
  })

  it('generates container and media styles', () => {
    expect(genVideoResizeContainerStyle({ width: '50%', height: 'auto' })).toEqual({ width: '50%' })
    expect(genVideoMediaStyle({ width: '50%', height: 'auto' })).toEqual({ width: '100%' })
    expect(genVideoResizeContainerStyle()).toEqual({})
    expect(genVideoMediaStyle()).toEqual({})
  })

  it('keeps the aspect ratio while resizing', () => {
    expect(calcVideoResizeSize({ width: 400, height: 200 }, 100, 800)).toEqual({
      width: 500,
      height: 250,
    })
    expect(calcVideoResizeSize({ width: 400, height: 200 }, -100, 800)).toEqual({
      width: 300,
      height: 150,
    })
  })

  it('limits the size to the max width and the min size', () => {
    expect(calcVideoResizeSize({ width: 400, height: 200 }, 1000, 600)).toEqual({
      width: 600,
      height: 300,
    })
    // height reaches the min size first
    expect(calcVideoResizeSize({ width: 400, height: 200 }, -1000, 600)).toEqual({
      width: 30,
      height: 15,
    })
    expect(calcVideoResizeSize({ width: 400, height: 200 }, 1000, 0)).toEqual({
      width: 1400,
      height: 700,
    })
    expect(calcVideoResizeSize({ width: 0, height: 200 }, 10, 600)).toBeNull()
  })
})

describe('video resize mousedown handler', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
  })

  it('ignores mousedown events outside the draggers', () => {
    const editor = createEditorWithVideo()
    const { container, media } = createResizeDom()
    const event = createMousedownEvent(media, container, 100)

    genVideoResizeMousedownHandler(editor, editor.children[0])(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
    expect(container.classList.contains(VIDEO_RESIZING_CLASS)).toBe(false)
  })

  it('resizes the DOM while dragging and updates the node on mouseup', () => {
    const editor = createEditorWithVideo()
    const elemNode = editor.children[0]
    const {
      container, media, sizeTip, rightDragger,
    } = createResizeDom()
    const event = createMousedownEvent(rightDragger, container, 100)

    genVideoResizeMousedownHandler(editor, elemNode)(event)

    expect(event.preventDefault).toHaveBeenCalled()
    expect(container.classList.contains(VIDEO_RESIZING_CLASS)).toBe(true)
    expect(media.style.pointerEvents).toBe('none')
    expect(sizeTip.textContent).toBe('400 × 200')

    moveMouse(200)

    expect(container.style.width).toBe('500px')
    expect(container.style.height).toBe('250px')
    expect(media.style.width).toBe('100%')
    expect(media.style.height).toBe('100%')
    expect(sizeTip.textContent).toBe('500 × 250')
    // node is not changed while dragging
    expect((editor.children[0] as any).style).toEqual({ width: '400px', height: '200px' })

    releaseMouse()

    expect(container.classList.contains(VIDEO_RESIZING_CLASS)).toBe(false)
    expect(media.style.pointerEvents).toBe('')
    expect((editor.children[0] as any).style).toEqual({ width: '500px', height: '250px' })

    // listeners are removed after mouseup
    moveMouse(400)
    expect(container.style.width).toBe('500px')
  })

  it('reverses the gap when dragging the left draggers', () => {
    const editor = createEditorWithVideo()
    const { container, leftDragger } = createResizeDom()

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(leftDragger, container, 100),
    )
    moveMouse(150)
    releaseMouse()

    expect((editor.children[0] as any).style).toEqual({ width: '350px', height: '175px' })
  })

  it('doubles the gap for centered videos', () => {
    const editor = createEditorWithVideo({ align: 'center' })
    const { container, rightDragger } = createResizeDom()

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(rightDragger, container, 100),
    )
    moveMouse(150)
    releaseMouse()

    expect((editor.children[0] as any).style).toEqual({ width: '500px', height: '250px' })
  })

  it('limits the width to the video container', () => {
    const editor = createEditorWithVideo()
    const { container, rightDragger } = createResizeDom()

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(rightDragger, container, 100),
    )
    moveMouse(2000)
    releaseMouse()

    expect((editor.children[0] as any).style).toEqual({ width: '800px', height: '400px' })
  })

  it('replaces percentage sizes with the dragged px size', () => {
    const editor = createEditorWithVideo({ style: { width: '50%' } })
    const { container, rightDragger } = createResizeDom()

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(rightDragger, container, 100),
    )
    moveMouse(120)
    releaseMouse()

    expect((editor.children[0] as any).style).toEqual({ width: '420px', height: '210px' })
  })

  it('does not change the node when the mouse is not moved', () => {
    const editor = createEditorWithVideo({ style: {} })
    const { container, rightDragger } = createResizeDom()

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(rightDragger, container, 100),
    )
    releaseMouse()

    expect((editor.children[0] as any).style).toEqual({})
    expect(container.style.width).toBe('')
  })

  it('disables iframe pointer events while dragging', () => {
    const editor = createEditorWithVideo({
      src: '<iframe src="https://example.com/embed"></iframe>',
    })
    const { container, media, rightDragger } = createResizeDom(
      '<div class="w-e-video-iframe"><iframe src="https://example.com/embed" style="pointer-events: auto;"></iframe></div>',
    )

    expect(media.tagName).toBe('IFRAME')

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(rightDragger, container, 100),
    )

    expect(media.style.pointerEvents).toBe('none')

    moveMouse(110)
    releaseMouse()

    expect(media.style.pointerEvents).toBe('auto')
    expect((editor.children[0] as any).style).toEqual({ width: '410px', height: '205px' })
  })

  it('hides the hoverbar when dragging starts', () => {
    const editor = createEditorWithVideo()
    const hideAndClean = vi.fn()
    const { container, rightDragger } = createResizeDom()

    vi.spyOn(DomEditor, 'getHoverbar').mockReturnValue({ hideAndClean } as any)

    genVideoResizeMousedownHandler(editor, editor.children[0])(
      createMousedownEvent(rightDragger, container, 100),
    )
    releaseMouse()

    expect(hideAndClean).toHaveBeenCalled()
  })

  it('does not update the node when it is no longer in the editor', () => {
    const editor = createEditorWithVideo()
    const elemNode = editor.children[0]
    const { container, rightDragger } = createResizeDom()

    genVideoResizeMousedownHandler(editor, elemNode)(
      createMousedownEvent(rightDragger, container, 100),
    )
    moveMouse(150)
    editor.removeNodes({ at: [0] })

    expect(() => releaseMouse()).not.toThrow()
    expect(editor.getElemsByTypePrefix('video')).toHaveLength(0)
  })
})
