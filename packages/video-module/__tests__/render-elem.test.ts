/**
 * @description video render elem test
 * @author luochao
 */

import { VNode } from 'snabbdom'

import createEditor from '../../../tests/utils/create-editor'
import { renderVideoConf } from '../src/module/render-elem'

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
    const video = figure.children?.[0] as VNode

    expect(video.sel).toBe('video')
    expect(video.data?.muted).toBe(true)
    expect(video.data?.attrs).toEqual({
      loop: true,
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
    const video = figure.children?.[0] as VNode

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
})
