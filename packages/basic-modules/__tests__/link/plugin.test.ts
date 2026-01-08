/**
 * @description link plugin test
 * @author wangfupeng
 */

import { Editor } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import * as linkHelper from '../../src/modules/link/helper'
import withLink from '../../src/modules/link/plugin'

// 模拟 DataTransfer
class MyDataTransfer {
  private values: object = {}

  setData(type: string, value: string) {
    this.values[type] = value
  }

  getData(type: string): string {
    return this.values[type]
  }
}

describe('link plugin', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = withLink(createEditor())
  })

  afterEach(async () => {
    await Promise.resolve()
    editor.destroy()
  })

  it('link is inline elem', () => {
    const elem = { type: 'link', children: [] }

    expect(editor.isInline(elem)).toBeTruthy()
  })

  it('link insert data', async () => {
    const url = 'https://wangeditor-next.github.io/docs/'
    const insertLinkSpy = vi.spyOn(linkHelper, 'insertLink')

    const data = new MyDataTransfer()

    data.setData('text/plain', url)

    editor.select(Editor.start(editor, []))
    // @ts-ignore
    editor.insertData(data)

    expect(insertLinkSpy).toHaveBeenCalled()
    await insertLinkSpy.mock.results[0].value
    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0] as any

    expect(linkElem.url).toBe(url)
  })
  it('should insert an image correctly when dragging and dropping an image', () => {
    const imgHtml = '<img src="https://www.wangeditor.com/img.jpg" />'
    const imgUrl = 'https://wangeditor-next.github.io/docs/image/logo.png'

    const data = new MyDataTransfer()

    data.setData('text/html', imgHtml)
    data.setData('text/plain', imgUrl)

    editor.select(Editor.start(editor, []))
    // @ts-ignore
    editor.insertData(data)

    const images = editor.getElemsByTypePrefix('image')

    expect(images.length).toBe(1)
    const imgElem = images[0] as any

    expect(imgElem.src).toBe('https://www.wangeditor.com/img.jpg')
  })

  it('should insert non-link data correctly', () => {
    const text = 'This is a test text.'

    const data = new MyDataTransfer()

    data.setData('text/plain', text)

    editor.select(Editor.start(editor, []))
    // @ts-ignore
    editor.insertData(data)

    const content = Editor.string(editor, [])

    expect(content).toContain(text)
  })
})
