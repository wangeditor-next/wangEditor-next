/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import videoModule from '../src'

const { parseElemsHtml, preParseHtml } = videoModule
const [parseHtmlConf] = parseElemsHtml!
const [preParseHtmlConf] = preParseHtml!

describe('video - pre parse html', () => {
  it('iframe', () => {
    const $iframe = $('<iframe></iframe>')

    // match selector
    expect($iframe[0].matches(preParseHtmlConf.selector)).toBeTruthy()

    // pre parse
    const res = preParseHtmlConf.preParseHtml($iframe[0])

    expect(res.outerHTML).toBe(
      '<figure data-w-e-type="video" data-w-e-is-void="" data-w-e-align="center" class="w-e-video w-e-video-align-center"><iframe></iframe></figure>',
    )
  })

  it('video', () => {
    const $video = $('<video></video>')

    // match selector
    expect($video[0].matches(preParseHtmlConf.selector)).toBeTruthy()

    // pre parse
    const res = preParseHtmlConf.preParseHtml($video[0])

    expect(res.outerHTML).toBe(
      '<figure data-w-e-type="video" data-w-e-is-void="" data-w-e-align="center" class="w-e-video w-e-video-align-center"><video></video></figure>',
    )
  })

  it('it should parse video element which is wrapped by p', () => {
    const $video = $('<p><video></video></p>')

    // match selector
    expect($video[0].matches(preParseHtmlConf.selector)).toBeTruthy()

    // pre parse
    const res = preParseHtmlConf.preParseHtml($video[0])

    expect(res.outerHTML).toBe(
      '<figure data-w-e-type="video" data-w-e-is-void="" data-w-e-align="center" class="w-e-video w-e-video-align-center"><video></video></figure>',
    )
  })
})

describe('video - parse html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('iframe', () => {
    const iframeHtml = '<iframe src="xxx" width="500" height="300"></iframe>'
    const $container = $(
      `<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="left" style="display: flex; justify-content: flex-start;">${iframeHtml}</figure>`,
    )

    // match selector
    expect($container[0].matches(parseHtmlConf.selector)).toBeTruthy()

    // parse
    expect(parseHtmlConf.parseElemHtml($container[0], [], editor)).toEqual({
      type: 'video',
      src: iframeHtml,
      poster: '',
      width: '500',
      height: '300',
      style: {},
      align: 'left',
      children: [{ text: '' }], // void 元素有一个空 text
    })
  })

  it('video', () => {
    const src = 'xxx.mp4'
    const poster = 'xxx.png'
    const videoHtml = `<video poster="${poster}" style="display: block; max-width: 100%;"><source src="${src}"/></video>`
    const $container = $(
      `<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="center">${videoHtml}</figure>`,
    )

    // match selector
    expect($container[0].matches(parseHtmlConf.selector)).toBeTruthy()

    // parse
    expect(parseHtmlConf.parseElemHtml($container[0], [], editor)).toEqual({
      type: 'video',
      src,
      poster,
      width: 'auto',
      height: 'auto',
      style: {},
      align: 'center',
      children: [{ text: '' }], // void 元素有一个空 text
    })
  })

  it('class attrs', () => {
    const src = 'xxx.mp4'
    const poster = 'xxx.png'
    const videoHtml = `<video poster="${poster}" width="640" height="360" data-w-e-style-width="640px" data-w-e-style-height="360px"><source src="${src}"/></video>`
    const $container = $(
      `<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="right" class="w-e-video w-e-video-align-right">${videoHtml}</figure>`,
    )

    expect($container[0].matches(parseHtmlConf.selector)).toBeTruthy()

    expect(parseHtmlConf.parseElemHtml($container[0], [], editor)).toEqual({
      type: 'video',
      src,
      poster,
      width: '640',
      height: '360',
      style: {
        width: '640px',
        height: '360px',
      },
      align: 'right',
      children: [{ text: '' }],
    })
  })

  it.each([
    ['style', 'style="text-align: right;"'],
    ['data', 'data-w-e-text-align="right"'],
    ['class', 'class="w-e-video-align-right"'],
  ])('migrates legacy %s alignment', (_source, attrs) => {
    const $container = $(
      `<div data-w-e-type="video" data-w-e-is-void ${attrs}><video src="legacy.mp4"></video></div>`,
    )

    expect(parseHtmlConf.parseElemHtml($container[0], [], editor)).toEqual(
      expect.objectContaining({ align: 'right' }),
    )
  })

  it('maps unsupported legacy justify alignment to the media default', () => {
    const $container = $(
      '<div data-w-e-type="video" data-w-e-is-void style="text-align: justify;"><video src="legacy.mp4"></video></div>',
    )

    expect(parseHtmlConf.parseElemHtml($container[0], [], editor)).toEqual(
      expect.objectContaining({ align: 'center' }),
    )
  })
})
