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
        '<div data-w-e-type="video" data-w-e-is-void style="text-align: center;">\n<video poster="xxx.png" controls="true" width="auto" height="auto" style=""><source src="test.mp4" type="video/mp4"/></video>\n</div>',
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
        '<div data-w-e-type="video" data-w-e-is-void style="text-align: center;">\n<iframe src="test.mp4" width="500" height="300" style=""></iframe>\n</div>',
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
        textAlign: 'right',
        children: [],
      }
      const mockEditor = {
        getConfig() {
          return { textStyleMode: 'class' }
        },
      } as any
      const res = videoToHtmlConf.elemToHtml(element, '', mockEditor)

      expect(res).toEqual(
        '<div data-w-e-type="video" data-w-e-is-void class="w-e-video-align-right" data-w-e-text-align="right">\n<video poster="xxx.png" controls="true" width="640" height="360" data-w-e-style-width="640px" data-w-e-style-height="360px"><source src="test.mp4" type="video/mp4"/></video>\n</div>',
      )
      expect(res).not.toContain('style=')
    })
  })
})
