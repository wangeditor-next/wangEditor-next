/**
 * @description video menu test
 * @author luochao
 */

import videoModule from '../src'

const videoToHtmlConf = videoModule.elemsToHtml![0]

describe('videoModule module', () => {
  describe('module elem-to-html', () => {
    test('videoToHtmlConf should return object that include "type" and "elemToHtml" property', () => {
      expect(videoToHtmlConf.type).toBe('video')
      expect(typeof videoToHtmlConf.elemToHtml).toBe('function')
    })

    test('videoToHtmlConf elemToHtml fn should return html video string', () => {
      const element = {
        type: 'video',
        src: 'test.mp4',
        poster: 'xxx.png',
        children: [],
      }
      const res = videoToHtmlConf.elemToHtml(element, '')

      expect(res).toEqual(
        '<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="center" style="display: flex; justify-content: center; margin: 0; max-width: 100%; width: 100%;">\n<video poster="xxx.png" controls="true" width="auto" height="auto" style="display: block; max-width: 100%;"><source src="test.mp4" type="video/mp4"/></video>\n</figure>',
      )
    })

    test('videoToHtmlConf elemToHtml should return original string if src is a iframe html string', () => {
      const element = {
        type: 'video',
        src: '<iframe src="test.mp4"></iframe>',
        poster: 'xxx.png',
        width: '500',
        height: '300',
        children: [],
      }
      const res = videoToHtmlConf.elemToHtml(element, '')

      expect(res).toEqual(
        '<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="center" style="display: flex; justify-content: center; margin: 0; max-width: 100%; width: 100%;">\n<iframe src="test.mp4" width="500" height="300" style="display: block; max-width: 100%;"></iframe>\n</figure>',
      )
    })

    test('videoToHtmlConf elemToHtml - class mode should not output inline style', () => {
      const element = {
        type: 'video',
        src: 'test.mp4',
        poster: 'xxx.png',
        width: '640',
        height: '360',
        style: {
          width: '640px',
          height: '360px',
        },
        align: 'right',
        children: [],
      }
      const mockEditor = {
        getConfig() {
          return { textStyleMode: 'class' }
        },
      } as any
      const res = videoToHtmlConf.elemToHtml(element, '', mockEditor)

      expect(res).toEqual(
        '<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="right" class="w-e-video w-e-video-align-right">\n<video poster="xxx.png" controls="true" width="640" height="360" data-w-e-style-width="640px" data-w-e-style-height="360px"><source src="test.mp4" type="video/mp4"/></video>\n</figure>',
      )
      expect(res).not.toContain('style=')
    })

    test('videoToHtmlConf elemToHtml outputs video playback attributes', () => {
      const element = {
        type: 'video',
        src: 'test.mp4',
        poster: 'xxx.png',
        autoplay: true,
        loop: true,
        muted: true,
        playsInline: true,
        preload: 'none',
        controlsList: 'nodownload',
        disablePictureInPicture: true,
        children: [],
      }
      const attrs = ' autoplay loop muted playsinline preload="none" controlslist="nodownload" disablepictureinpicture'

      expect(videoToHtmlConf.elemToHtml(element, '')).toContain(
        `<video poster="xxx.png" controls="true" width="auto" height="auto" style="display: block; max-width: 100%;"${attrs}><source src="test.mp4" type="video/mp4"/></video>`,
      )

      const mockEditor = {
        getConfig() {
          return { textStyleMode: 'class' }
        },
      } as any

      expect(videoToHtmlConf.elemToHtml(element, '', mockEditor)).toContain(
        `<video poster="xxx.png" controls="true" width="auto" height="auto"${attrs}><source src="test.mp4" type="video/mp4"/></video>`,
      )
    })

    test('videoToHtmlConf elemToHtml skips invalid playback attributes and iframe videos', () => {
      const res = videoToHtmlConf.elemToHtml({
        type: 'video',
        src: 'test.mp4',
        autoplay: 'yes',
        preload: '" onerror="alert(1)',
        controlsList: 'foo',
        children: [],
      }, '')

      expect(res).toContain('<video poster="" controls="true" width="auto" height="auto" style="display: block; max-width: 100%;"><source')

      const iframeRes = videoToHtmlConf.elemToHtml({
        type: 'video',
        src: '<iframe src="test.mp4"></iframe>',
        autoplay: true,
        controlsList: 'nodownload',
        children: [],
      }, '')

      expect(iframeRes).not.toContain('autoplay')
      expect(iframeRes).not.toContain('controlslist')
    })

    test('videoToHtmlConf migrates legacy textAlign to media alignment', () => {
      const element = {
        type: 'video',
        src: 'test.mp4',
        textAlign: 'left',
        children: [],
      }

      const res = videoToHtmlConf.elemToHtml(element, '')

      expect(res).toContain('data-w-e-align="left"')
      expect(res).toContain('justify-content: flex-start')
      expect(res).not.toContain('text-align')
    })
  })
})
