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
