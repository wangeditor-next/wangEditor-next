/**
 * @description link module helper test
 * @author wangfupeng
 */

import { Editor, Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { insertLink, isMenuDisabled, updateLink } from '../../src/modules/link/helper'

describe('link module helper', () => {
  let editor: any
  let startLocation: any

  // 自定义校验链接
  function customCheckLinkFn(text: string, url: string): string | boolean | undefined {
    if (text === 'test null') {
      return
    }
    if (url.indexOf('http') !== 0) {
      return '链接必须以 http/https 开头'
    }
    return true
  }

  // 自定义转换链接 url
  function customParseLinkUrl(url: string): string {
    if (url.indexOf('http') !== 0) {
      return `http://${url}`
    }
    return url
  }

  const editorConfig = { MENU_CONF: { insertLink: {} }, maxLength: 20 }

  editorConfig.MENU_CONF.insertLink = {
    checkLink: customCheckLinkFn,
    parseLinkUrl: customParseLinkUrl,
  }

  beforeEach(() => {
    editor = createEditor({
      config: editorConfig,
    })
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('menu disable', () => {
    editor.deselect()
    expect(isMenuDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    expect(isMenuDisabled(editor)).toBeFalsy()

    editor.insertNode({
      type: 'link',
      url: 'https://www.wangeditor.com/',
      children: [{ text: 'xxx' }],
    })
    expect(isMenuDisabled(editor)).toBeTruthy() // 选中 link ，则禁用

    editor.clear()
    editor.insertNode({
      type: 'pre',
      children: [
        {
          type: 'code',
          children: [{ text: 'var' }],
          language: 'javascript',
        },
      ],
    })
    expect(isMenuDisabled(editor)).toBeTruthy() // 选中 code-block ，则禁用
  })

  it('insert link with collapsed selection', async () => {
    editor.select(startLocation)

    const url = 'https://wangeditor-next.github.io/docs/'
    const inValidUrl = 'wangeditor-next.github.io/docs'

    await insertLink(editor, 'hello', url)
    await insertLink(editor, 'test null', url)
    await insertLink(editor, 'hello', inValidUrl)

    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe(url)
  })

  it('insert link should normalize whitespace in url', async () => {
    editor.select(startLocation)

    await insertLink(editor, 'hello', ' \nhttps://wangeditor-next.github.io/docs/a b\t ')

    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe('https://wangeditor-next.github.io/docs/a%20b')
  })

  it('insert link with collapsed max length', async () => {
    editor.select(startLocation)
    editor.insertText('1234456789012')

    editor.select(startLocation)
    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'https://wangeditor-next.github.io/docs/', url)
    await insertLink(editor, 'hello', url)
    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe(url)
  })

  it('insert link with collapsed max length left length = 0', async () => {
    editor.select(startLocation)
    editor.insertText('123445678901234567890')

    editor.select(startLocation)
    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)
    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(0)
  })

  it('insert link with expand selection', async () => {
    editor.select(startLocation)
    editor.insertText('hello')
    Transforms.move(editor, {
      distance: 3, // 选中 3 个字母
      unit: 'character',
    })
    editor.select([]) // 全选

    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)

    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe(url)
  })

  it('insert link with expand selection not same text', async () => {
    editor.select(startLocation)
    editor.insertText('test')
    Transforms.move(editor, {
      distance: 3, // 选中 3 个字母
      unit: 'character',
    })
    editor.select([]) // 全选

    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)

    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe(url)
  })

  it('insert link with expand max length', async () => {
    editor.select(startLocation)
    editor.insertText('1234456789012')
    Transforms.move(editor, {
      distance: 3, // 选中 3 个字母
      unit: 'character',
    })
    editor.select([])
    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)
    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe(url)
  })

  it('insert link with expand max length uninput', async () => {
    editor.select(startLocation)
    editor.insertText('123445678901234567890')
    editor.select([])
    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)
    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(0)
  })

  it('parse link', async () => {
    const url = 'https://wangeditor-next.github.io/docs/'
    const linkEditorConfig = { MENU_CONF: { insertLink: {} } }

    linkEditorConfig.MENU_CONF.insertLink = {
      parseLinkUrl: false,
    }
    const linkEditor = createEditor({
      config: linkEditorConfig,
    })

    linkEditor.select(startLocation)
    await insertLink(linkEditor, 'hello', url)
    const images = linkEditor.getElemsByTypePrefix('image')

    expect(images.length).toBe(0)
  })

  it('update link', async () => {
    editor.select(startLocation)

    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)

    // 选区移动到 link 内部
    editor.select({
      path: [0, 1, 0],
      offset: 3,
    })

    // 更新链接
    const newUrl = 'https://wangeditor-next.github.io/docs/index.html'

    await updateLink(editor, '', newUrl)

    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe(newUrl)
  })

  it('update link should normalize whitespace in url', async () => {
    editor.select(startLocation)

    const url = 'https://wangeditor-next.github.io/docs/'

    await insertLink(editor, 'hello', url)

    editor.select({
      path: [0, 1, 0],
      offset: 3,
    })

    await updateLink(editor, '', ' \nhttps://wangeditor-next.github.io/docs/a b\t ')

    const links = editor.getElemsByTypePrefix('link')

    expect(links.length).toBe(1)
    const linkElem = links[0]

    expect(linkElem.url).toBe('https://wangeditor-next.github.io/docs/a%20b')
  })
})
