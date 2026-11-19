/**
 * @description video render elem test
 * @author luochao
 */

import { VNode } from 'snabbdom'

import createEditor from '../../../tests/utils/create-editor'
import { renderVideoConf } from '../src/module/render-elem'

function getResizeContainerVnode(figure: VNode) {
  return figure.children?.[0] as VNode
}

function getMediaVnode(figure: VNode) {
  return getResizeContainerVnode(figure).children?.[0] as VNode
}

function createEditorWithVideo(video: Record<string, unknown>) {
  const editor = createEditor({
    content: [
      { type: 'video', children: [{ text: '' }], ...video },
      { type: 'paragraph', children: [{ text: '' }] },
    ],
  })

  editor.select({ path: [0, 0], offset: 0 })

  return editor
}

describe('video module - render elem', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('render video elem', () => {
    expect(renderVideoConf.type).toBe('video')

    const elem = {
      type: 'video', src: 'test.mp4', poster: 'xxx.png', children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode

    expect(vnode.sel).toBe('div')
    expect(figure.sel).toBe('figure')
    expect(figure.data.className).toContain('w-e-video-align-center')
    expect(figure.data['data-w-e-align']).toBe('center')
  })

  it('render video playback attributes except autoplay', () => {
    const elem = {
      type: 'video',
      src: 'test.mp4',
      autoplay: true,
      loop: true,
      muted: true,
      playsInline: true,
      preload: 'metadata',
      controlsList: 'nodownload nofullscreen',
      disablePictureInPicture: true,
      children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode
    const video = getMediaVnode(figure)

    expect(video.sel).toBe('video')
    expect(video.data?.muted).toBe(true)
    expect(video.data?.attrs).toEqual({
      'data-w-e-video-autoplay': 'true',
      loop: true,
      'data-w-e-video-muted': 'true',
      playsinline: true,
      preload: 'metadata',
      controlslist: 'nodownload nofullscreen',
      disablepictureinpicture: true,
    })
    expect(video.data?.attrs).not.toHaveProperty('autoplay')
  })

  it('render video without playback attributes by default', () => {
    const elem = {
      type: 'video', src: 'test.mp4', children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode
    const video = getMediaVnode(figure)

    expect(video.data?.muted).toBe(false)
    expect(video.data?.attrs).toEqual({})
  })

  it('render video with iframe', () => {
    expect(renderVideoConf.type).toBe('video')

    const elem = {
      type: 'video', src: '<iframe src="test.mp4"></iframe>', align: 'right', children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode

    expect(vnode.sel).toBe('div')
    expect(figure.sel).toBe('figure')
    expect(figure.data.className).toContain('w-e-video-align-right')
    expect(figure.data['data-w-e-align']).toBe('right')
  })

  it('renders the same DOM structure when the video is not selected', () => {
    const elem = {
      type: 'video', src: 'test.mp4', children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode
    const resizeContainer = getResizeContainerVnode(figure)

    expect(figure.children).toHaveLength(1)
    expect(resizeContainer.sel).toBe('div')
    expect(resizeContainer.data?.className).toBe('w-e-video-resize-container')
    expect(resizeContainer.data?.on).toEqual({})
    expect(resizeContainer.children).toHaveLength(1)
    expect(getMediaVnode(figure).sel).toBe('video')
  })

  it('moves the video size to the resize container', () => {
    const elem = {
      type: 'video',
      src: 'test.mp4',
      width: '640',
      style: { width: '50%', height: '360px' },
      children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode
    const video = getMediaVnode(figure)

    expect(getResizeContainerVnode(figure).data?.style).toEqual({ width: '50%', height: '360px' })
    expect(video.data?.style).toEqual({ width: '100%', height: '100%' })
    expect(video.data?.width).toBe('640')
  })

  it('ignores auto sizes from the edit size menu', () => {
    const elem = {
      type: 'video',
      src: 'test.mp4',
      style: { width: 'auto', height: 'auto' },
      children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode

    expect(getResizeContainerVnode(figure).data?.style).toEqual({})
    expect(getMediaVnode(figure).data?.style).toEqual({})
  })

  it('renders iframe videos inside the resize container', () => {
    const elem = {
      type: 'video',
      src: '<iframe src="https://example.com/embed"></iframe>',
      style: { width: '480px', height: '270px' },
      children: [],
    }
    const vnode = renderVideoConf.renderElem(elem, null, editor)
    const figure = vnode.children?.[0] as VNode
    const resizeContainer = getResizeContainerVnode(figure)
    const iframeHolder = getMediaVnode(figure)

    expect(figure.data?.innerHTML).toBeUndefined()
    expect(resizeContainer.data?.style).toEqual({ width: '480px', height: '270px' })
    expect(iframeHolder.data?.className).toBe('w-e-video-iframe')
    expect(iframeHolder.data?.innerHTML).toContain('src="https://example.com/embed"')
    expect(iframeHolder.data?.innerHTML).toContain('width: 100%; height: 100%;')
  })

  it('renders resize draggers and size tip for the selected video', () => {
    const selectedEditor = createEditorWithVideo({ src: 'test.mp4' })
    const elem = selectedEditor.children[0]
    const vnode = renderVideoConf.renderElem(elem, null, selectedEditor)
    const figure = vnode.children?.[0] as VNode
    const resizeContainer = getResizeContainerVnode(figure)
    const children = resizeContainer.children as VNode[]

    expect(figure.data?.['data-selected']).toBe('true')
    expect(resizeContainer.data?.className).toBe(
      'w-e-video-resize-container w-e-selected-video-resize-container',
    )
    expect(typeof resizeContainer.data?.on?.mousedown).toBe('function')
    expect(children[0].sel).toBe('video')
    expect(children.slice(1, 5).map(child => child.data?.className)).toEqual([
      'w-e-video-dragger left-top',
      'w-e-video-dragger right-top',
      'w-e-video-dragger left-bottom',
      'w-e-video-dragger right-bottom',
    ])
    expect(children[5].data?.className).toBe('w-e-video-size-tip')
  })

  it('does not render resize draggers when the editor is disabled', () => {
    const selectedEditor = createEditorWithVideo({ src: 'test.mp4' })

    selectedEditor.disable()

    const elem = selectedEditor.children[0]
    const vnode = renderVideoConf.renderElem(elem, null, selectedEditor)
    const figure = vnode.children?.[0] as VNode
    const resizeContainer = getResizeContainerVnode(figure)

    expect(resizeContainer.data?.className).toBe('w-e-video-resize-container')
    expect(resizeContainer.data?.on).toEqual({})
    expect(resizeContainer.children).toHaveLength(1)
  })
})
