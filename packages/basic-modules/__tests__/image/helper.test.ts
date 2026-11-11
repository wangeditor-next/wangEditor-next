/**
 * @description image helper test
 * @author wangfupeng
 */

import { DomEditor } from '@wangeditor-next/core'
import { Editor, Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import {
  insertImageNode,
  isInsertImageMenuDisabled,
  updateImageNode,
} from '../../src/modules/image/helper'

describe('image helper', () => {
  let editor: any
  let startLocation: any

  const baseSrc = 'https://github.com/wangeditor-next/wangEditor-next'
  const emptySrc = ''
  const inValidSrc = 'wangeditor-next.github.io/docs/'
  const baseAlt = 'logo'
  const href = 'https://www.wangeditor.com/'

  // 自定义校验图片
  function customCheckImageFn(src: string, _alt: string, _url: string): boolean | undefined | string {
    if (!src) {
      return
    }
    if (src.indexOf('http') !== 0) {
      return '图片网址必须以 http/https 开头'
    }
    return true
  }

  const baseEditorConfig = { MENU_CONF: { insertImage: {} } }

  baseEditorConfig.MENU_CONF.insertImage = {
    checkImage: customCheckImageFn,
  }

  beforeEach(() => {
    editor = createEditor({
      config: baseEditorConfig,
    })
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('insert image node', async () => {
    editor.select(startLocation)
    await insertImageNode(editor, baseSrc, baseAlt, href)
    await insertImageNode(editor, baseSrc, baseAlt, href)
    await insertImageNode(editor, emptySrc, baseAlt, href)
    await insertImageNode(editor, inValidSrc, baseAlt, href)
    const images = editor.getElemsByTypePrefix('image')

    expect(images.length).toBe(2)
  })

  it('parse image src', async () => {
    const editorConfig = { MENU_CONF: { insertImage: {} } }

    editorConfig.MENU_CONF.insertImage = {
      parseImageSrc: false,
    }
    const imageEditor = createEditor({
      config: editorConfig,
    })

    imageEditor.select(startLocation)
    await insertImageNode(imageEditor, baseSrc, baseAlt, href)
    const images = imageEditor.getElemsByTypePrefix('image')

    expect(images.length).toBe(1)
  })

  it.each(['inline', 'class'] as const)('insert image preserves trailing text marks in %s mode', async textStyleMode => {
    editor = createEditor({
      config: { ...baseEditorConfig, textStyleMode },
      content: [
        {
          type: 'paragraph',
          children: [
            {
              text: '',
              fontFamily: '微软雅黑',
              fontSize: '14px',
            },
          ],
        },
      ],
    })

    editor.select({ path: [0, 0], offset: 0 })
    expect(editor.getMarks()?.fontFamily).toBe('微软雅黑')
    expect(editor.getMarks()?.fontSize).toBe('14px')

    await insertImageNode(editor, baseSrc, baseAlt, href)

    expect(editor.getMarks()?.fontFamily).toBe('微软雅黑')
    expect(editor.getMarks()?.fontSize).toBe('14px')
    editor.insertText('after image')
    const trailingText = editor.children[0].children.slice(-1)[0]

    expect(trailingText).toMatchObject({
      text: 'after image',
      fontFamily: '微软雅黑',
      fontSize: '14px',
    })
    const html = editor.getHtml()

    editor.setHtml(html)
    expect(editor.getHtml()).toBe(html)
    expect(editor.children[0].children.slice(-1)[0]).toMatchObject(trailingText)
  })

  it('update image node', async () => {
    editor.select(startLocation)

    const elem = {
      type: 'image',
      baseSrc,
      alt: baseAlt,
      href,
      style: { width: '100', height: '80' },
      children: [{ text: '' }], // void node 必须包含一个空 text
    }

    editor.insertNode(elem) // 插入图片
    editor.select({
      path: [0, 1, 0], // 选中图片
      offset: 0,
    })

    const newSrc = 'https://www.baidu.com/logo.png'
    const newAlt = 'baidu'
    const newHref = 'https://www.baidu.com/'

    await updateImageNode(editor, newSrc, newAlt, newHref, {}) // 更新图片信息

    const imageNode = DomEditor.getSelectedNodeByType(editor, 'image')

    expect(imageNode).not.toBeNull()
  })

  it('is menu disable', async () => {
    editor.deselect()
    expect(isInsertImageMenuDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    expect(isInsertImageMenuDisabled(editor)).toBeFalsy()

    editor.insertText('hello')
    editor.select([])
    expect(isInsertImageMenuDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    Transforms.setNodes(editor, { type: 'header1' })
    expect(isInsertImageMenuDisabled(editor)).toBeTruthy()

    editor.select(startLocation)
    Transforms.setNodes(editor, { type: 'list-item' })
    expect(isInsertImageMenuDisabled(editor)).toBeFalsy()
  })
})

describe('image helper - block insertion', () => {
  const src = 'https://example.com/a.png'

  function imageParagraphs(editor: any) {
    return editor.children.map((n: any) => ({
      type: n.type,
      images: n.children.filter((c: any) => c.type === 'image').length,
    }))
  }

  it('inserts inline by default, keeping images in the same paragraph', async () => {
    const editor: any = createEditor()

    editor.select(Editor.start(editor, []))
    await insertImageNode(editor, src)
    await insertImageNode(editor, src)

    expect(imageParagraphs(editor)).toEqual([{ type: 'paragraph', images: 2 }])
  })

  it('puts each image in its own paragraph when block is true', async () => {
    const editor: any = createEditor()

    editor.select(Editor.start(editor, []))
    await insertImageNode(editor, src, '', '', { block: true })
    await insertImageNode(editor, src, '', '', { block: true })
    await insertImageNode(editor, src, '', '', { block: true })

    expect(imageParagraphs(editor)).toEqual([
      { type: 'paragraph', images: 1 },
      { type: 'paragraph', images: 1 },
      { type: 'paragraph', images: 1 },
    ])
    // 光标停留在最后一张图片所在段落之后，可继续输入
    expect(editor.selection.anchor.path[0]).toBe(2)
  })

  it('starts a new paragraph after non-empty text', async () => {
    const editor: any = createEditor({ content: [{ type: 'paragraph', children: [{ text: 'hello' }] }] })

    editor.select(Editor.end(editor, []))
    await insertImageNode(editor, src, '', '', { block: true })

    expect(editor.children).toHaveLength(2)
    expect(editor.children[0].children[0].text).toBe('hello')
    expect(imageParagraphs(editor)[1]).toEqual({ type: 'paragraph', images: 1 })
  })

  it('falls back to inline insertion outside plain paragraphs (e.g. list items)', async () => {
    const editor: any = createEditor({ content: [{ type: 'list-item', children: [{ text: 'item' }] }] })

    editor.select(Editor.end(editor, []))
    await insertImageNode(editor, src, '', '', { block: true })

    expect(editor.children).toHaveLength(1)
    expect(imageParagraphs(editor)).toEqual([{ type: 'list-item', images: 1 }])
  })
})
