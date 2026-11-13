/**
 * @description image - elem to html test
 * @author wangfupeng
 */

import { imageToHtmlConf } from '../../src/modules/image/elem-to-html'

describe('image to html', () => {
  it('to html', () => {
    expect(imageToHtmlConf.type).toBe('image')

    const src = 'https://www.wangeditor.com/imgs/logo.png'
    const href = 'https://www.wangeditor.com/'
    const elem = {
      type: 'image',
      src,
      alt: 'logo',
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }
    const html = imageToHtmlConf.elemToHtml(elem, '')

    expect(html).toBe(
      `<a href="${href}" target="_blank"><img src="${src}" alt="logo" data-href="${href}" width="" height="" style="width: 100;height: 80;"/></a>`
    )
  })

  it('to html - class mode should not output inline style', () => {
    const src = 'https://www.wangeditor.com/imgs/logo.png'
    const href = 'https://www.wangeditor.com/'
    const elem = {
      type: 'image',
      src,
      alt: 'logo',
      href,
      style: { width: '100px', height: '80px' },
      children: [{ text: '' }],
    }
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any
    const html = imageToHtmlConf.elemToHtml(elem, '', mockEditor)

    expect(html).toBe(
      `<a href="${href}" target="_blank"><img src="${src}" alt="logo" data-href="${href}" width="100px" height="80px" data-w-e-style-width="100px" data-w-e-style-height="80px"/></a>`
    )
    expect(html).not.toContain('style=')
  })

  it('to html - outputs loading attribute when set', () => {
    const src = 'https://www.wangeditor.com/imgs/logo.png'
    const elem = {
      type: 'image',
      src,
      alt: 'logo',
      loading: 'lazy',
      style: { width: '100px' },
      children: [{ text: '' }],
    }

    expect(imageToHtmlConf.elemToHtml(elem, '')).toBe(
      `<img src="${src}" alt="logo" data-href="" width="" height="" style="width: 100px;" loading="lazy"/>`
    )

    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any

    expect(imageToHtmlConf.elemToHtml(elem, '', mockEditor)).toBe(
      `<img src="${src}" alt="logo" data-href="" width="100px" height="" data-w-e-style-width="100px" loading="lazy"/>`
    )
  })

  it('to html - ignores unsupported loading values', () => {
    const elem = {
      type: 'image',
      src: 'https://www.wangeditor.com/imgs/logo.png',
      loading: 'lazy" onerror="alert(1)',
      children: [{ text: '' }],
    }

    expect(imageToHtmlConf.elemToHtml(elem, '')).not.toContain('loading=')
  })
})
