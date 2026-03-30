/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../../tests/utils/create-editor'
import { parseStyleHtml } from '../../src/modules/color/parse-style-html'
import { preParseHtmlConf } from '../../src/modules/color/pre-parse-html'
import { genStyleClassName } from '../../src/utils/style-class'

describe('color - pre parse html', () => {
  it('pre parse html', () => {
    const $font = $('<font color="rgb(204, 204, 204)">hello</font>')

    // match selector
    expect($font[0].matches(preParseHtmlConf.selector)).toBeTruthy()

    // pre parse
    const res = preParseHtmlConf.preParseHtml($font[0])

    expect(res.outerHTML).toBe('<font style="color: rgb(204, 204, 204);">hello</font>')
  })
})

describe('color - parse style html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('parse style html', () => {
    const $span = $(
      '<span style="color: rgb(235, 144, 58); background-color: rgb(231, 246, 213);"></span>',
    )
    const textNode = { text: 'hello' }

    // parse style
    const res = parseStyleHtml($span[0], textNode, editor)

    expect(res).toEqual({
      text: 'hello',
      color: 'rgb(235, 144, 58)',
      bgColor: 'rgb(231, 246, 213)',
    })
  })

  it('parse class html', () => {
    const color = 'rgb(235, 144, 58)'
    const bgColor = 'rgb(231, 246, 213)'
    const colorClass = genStyleClassName('color', color)
    const bgClass = genStyleClassName('bgColor', bgColor)
    const $span = $(
      `<span class="${colorClass} ${bgClass}" data-w-e-color="${color}" data-w-e-bg-color="${bgColor}"></span>`,
    )
    const textNode = { text: 'hello' }
    const res = parseStyleHtml($span[0], textNode, editor)

    expect(res).toEqual({
      text: 'hello',
      color: 'rgb(235, 144, 58)',
      bgColor: 'rgb(231, 246, 213)',
    })
  })

  it('editor exports class-based html in class mode', () => {
    const classModeEditor = createEditor({
      config: {
        textStyleMode: 'class',
      },
    })

    classModeEditor.setHtml(
      '<p style="text-align: center; line-height: 2.5; text-indent: 2em;"><span style="color: rgb(235, 144, 58); background-color: rgb(231, 246, 213); font-size: 20px; font-family: 黑体;">hello</span></p>',
    )

    const html = classModeEditor.getHtml()

    expect(html).toContain('data-w-e-color="rgb(235, 144, 58)"')
    expect(html).toContain('data-w-e-bg-color="rgb(231, 246, 213)"')
    expect(html).toContain('data-w-e-font-size="20px"')
    expect(html).toContain('data-w-e-font-family="黑体"')
    expect(html).toContain('data-w-e-text-align="center"')
    expect(html).toContain('data-w-e-line-height="2.5"')
    expect(html).toContain('data-w-e-indent="2em"')
    expect(html).not.toMatch(/style="[^"]*color:/)
    expect(html).not.toMatch(/style="[^"]*background-color:/)
    expect(html).not.toMatch(/style="[^"]*font-size:/)
    expect(html).not.toMatch(/style="[^"]*font-family:/)
    expect(html).not.toMatch(/style="[^"]*text-align:/)
    expect(html).not.toMatch(/style="[^"]*line-height:/)
    expect(html).not.toMatch(/style="[^"]*text-indent:/)
  })
})
