/**
 * @description content API test
 * @author wangfupeng
 */

import {
  Editor, Node, Selection, Transforms,
} from 'slate'

import { parseHtmlConf } from '../../../../basic-modules/src/modules/link/parse-elem-html'
import { registerParseElemHtmlConf } from '../../../src'
import { IDomEditor } from '../../../src/editor/interface'
import { withContent } from '../../../src/editor/plugins/with-content'
import createCoreEditor from '../../create-core-editor' // packages/core 不依赖 packages/editor ，不能使用后者的 createEditor

function createEditor(...args) {
  return withContent(createCoreEditor(...args))
}

let baseEditor: IDomEditor

function setEditorSelection(
  editor: IDomEditor,
  selection: Selection = {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 0 },
  },
) {
  editor.selection = selection
}

const ignoreTag = [
  'doctype',
  '!doctype',
  'meta',
  'script',
  'style',
  'link',
  'frame',
  'iframe',
  'title',
  'svg',
]

describe('editor content API', () => {
  function getStartLocation(editor: IDomEditor) {
    return Editor.start(editor, [])
  }

  it('handleTab', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor))
    editor.handleTab()
    expect(editor.getText().length).toBe(4) // 默认 tab 键，输入 4 空格
  })

  it('getHtml', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })

    const html = editor.getHtml()

    expect(html).toBe('<div>hello</div>')
  })

  it('getHtml with void element', () => {
    const editor = createEditor({
      content: [
        { type: 'paragraph', children: [{ text: 'hello' }] },
        { type: 'image', children: [{ text: '' }], src: 'test.jpg' },
      ],
    })

    const html = editor.getHtml()

    expect(html).toBe('<div>hello</div><div></div>')
  })

  it('getText', () => {
    const editor = createEditor({
      content: [
        { type: 'paragraph', children: [{ text: 'hello' }] },
        { type: 'paragraph', children: [{ text: 'world' }] },
      ],
    })
    const text = editor.getText()

    expect(text).toBe('hello\nworld')
  })

  it('isEmpty', () => {
    const editor1 = createEditor()

    expect(editor1.isEmpty()).toBeTruthy()

    const editor2 = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })

    expect(editor2.isEmpty()).toBeFalsy()
  })

  it('getSelectionText', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })

    editor.select(getStartLocation(editor)) // 光标在开始位置
    expect(editor.getSelectionText()).toBe('')

    editor.select([]) // 全选
    expect(editor.getSelectionText()).toBe('hello')
  })

  it('getElemsByTypePrefix', () => {
    const editor = createEditor({
      content: [
        { type: 'header1', children: [{ text: 'a' }] },
        { type: 'header2', children: [{ text: 'b' }] },
        { type: 'paragraph', children: [{ text: 'c' }] },
      ],
    })
    const headers = editor.getElemsByTypePrefix('header')

    expect(headers.length).toBe(2)
    const pList = editor.getElemsByTypePrefix('paragraph')

    expect(pList.length).toBe(1)
    const images = editor.getElemsByTypePrefix('image')

    expect(images.length).toBe(0)
  })

  it('getElemsByType', () => {
    const editor = createEditor({
      content: [
        { type: 'header1', children: [{ text: 'a' }] },
        { type: 'header2', children: [{ text: 'b' }] },
        { type: 'paragraph', children: [{ text: 'c' }] },
      ],
    })
    const headers = editor.getElemsByType('header')

    expect(headers.length).toBe(0)
    const pList = editor.getElemsByType('paragraph')

    expect(pList.length).toBe(1)
    const images = editor.getElemsByType('image')

    expect(images.length).toBe(0)
  })

  it('deleteBackward with character', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })

    editor.select(getStartLocation(editor)) // 光标在开始位置
    Transforms.move(editor, { distance: 2, unit: 'character' }) // 光标移动 2 个字符

    editor.deleteBackward('character') // 向后删除
    expect(editor.getText()).toBe('hllo')
  })

  it('deleteBackward with word', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello world' }] }],
    })

    editor.select(getStartLocation(editor)) // 光标在开始位置
    Transforms.move(editor, { distance: 1, unit: 'word' }) // 光标移动 1 个单词

    editor.deleteBackward('word') // 向后删除
    expect(editor.getText()).toBe(' world')
  })

  it('deleteForward with character', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })

    editor.select(getStartLocation(editor)) // 光标在开始位置
    Transforms.move(editor, { distance: 1, unit: 'character' }) // 光标移动 1 个字符

    editor.deleteForward('character') // 向前删除
    expect(editor.getText()).toBe('hllo')
  })

  it('deleteForward with word', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello world' }] }],
    })

    editor.select(getStartLocation(editor)) // 光标在开始位置
    Transforms.move(editor, { distance: 1, unit: 'word' }) // 光标移动 1 个 word

    editor.deleteForward('word') // 向前删除
    expect(editor.getText()).toBe('hello')
  })

  it('deleteForward with line', () => {
    const editor = createEditor({
      content: [
        { type: 'paragraph', children: [{ text: 'hello' }] },
        { type: 'paragraph', children: [{ text: 'world' }] },
      ],
    })

    editor.select(getStartLocation(editor)) // 光标在开始位置

    editor.deleteForward('line') // 向前删除
    expect(editor.getText()).toBe('\nworld')
  })

  it('getFragment', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })
    // 选中 'hel'lo

    editor.select({
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 3,
      },
    })

    const fragment = editor.getFragment() // 获取选中内容

    expect(Node.string(fragment[0])).toBe('hel')
  })

  it('deleteFragment', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })
    // 选中 'hel'lo

    editor.select({
      anchor: {
        path: [0, 0],
        offset: 0,
      },
      focus: {
        path: [0, 0],
        offset: 3,
      },
    })

    editor.deleteFragment() // 删除选中内容
    expect(editor.getText()).toBe('lo')
  })

  it('deleteFragment resets a full-document selection to an empty paragraph', () => {
    const editor = createEditor({
      content: [
        {
          type: 'header1',
          textAlign: 'center',
          children: [{ text: 'hello' }],
        } as any,
      ],
    })

    editor.select([])
    editor.deleteFragment()

    expect(editor.children).toEqual([{ type: 'paragraph', children: [{ text: '' }] }])
    expect(editor.selection).toEqual({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    })
  })

  it('insertBreak', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor)) // 光标在开始位置

    editor.insertBreak()
    const pList = editor.getElemsByTypePrefix('paragraph')

    expect(pList.length).toBe(2)
  })

  it('insertText', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor)) // 光标在开始位置
    editor.insertText('xxx')
    expect(editor.getText()).toBe('xxx')
  })

  it('clear', () => {
    const editor = createEditor({
      content: [{ type: 'paragraph', children: [{ text: 'hello' }] }],
    })

    editor.clear()
    expect(editor.getText()).toBe('')
  })

  it('undo', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor)) // 光标在开始位置

    editor.insertText('hello')

    // @ts-ignore
    editor.undo()
    expect(editor.getText()).toBe('')
  })

  it('redo', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor)) // 光标在开始位置

    editor.insertText('hello')

    // @ts-ignore
    editor.undo()
    // @ts-ignore
    editor.redo()
    expect(editor.getText()).toBe('hello')
  })

  describe('dangerouslyInsertHtml API', () => {
    beforeEach(() => {
      baseEditor = createEditor()
    })

    // 现在使用的是 packages/core 的 createEditor ，创建的 editor 没有内置各种 module
    // 所以 dangerouslyInsertHtml 在此测试基本功能即可。其他 tag 在各自的 module 中测试

    test('dangerouslyInsertHtml should insert text with no blank to editor', () => {
      // insertText 必须要设置 selection 才能生效
      setEditorSelection(baseEditor)

      let htmlString = '<div>1</div>'

      baseEditor.dangerouslyInsertHtml(htmlString)

      expect(baseEditor.getText().indexOf('1')).toBeGreaterThan(-1)
      htmlString = '<br/>'
      expect(baseEditor.dangerouslyInsertHtml(htmlString)).toBeUndefined()
      htmlString = '<span>2</span>'
      expect(baseEditor.dangerouslyInsertHtml(htmlString)).toBeUndefined()
      htmlString = '<a>3</a>'
      registerParseElemHtmlConf(parseHtmlConf)
      expect(baseEditor.dangerouslyInsertHtml(htmlString)).toBeUndefined()
      expect(baseEditor.children).toStrictEqual([
        { children: [{ text: '1\n2' }], type: 'paragraph' },
        {
          children: [{ text: '3' }], url: '', target: '', type: 'link',
        },
      ])
    })

    ignoreTag.forEach(tag => {
      test(`insert html string with ${tag} element should to be ignore`, () => {
        setEditorSelection(baseEditor)
        const htmlString = `<${tag}></${tag}>`

        baseEditor.dangerouslyInsertHtml(htmlString)

        expect(baseEditor.getHtml().indexOf(tag)).toBe(-1)
      })
    })
  })

  it('getParentNode', () => {
    const textNode = { text: 'hello' }
    const p = { type: 'paragraph', children: [textNode] }
    const editor = createEditor({
      content: [p],
    })

    const parentNode = editor.getParentNode(textNode) as any

    expect(parentNode).not.toBeNull()
    expect(parentNode.type).toBe('paragraph')
  })

  it('insertNode', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor))

    const p = { type: 'paragraph', children: [{ text: 'hello' }] }

    editor.insertNode(p)

    const pList = editor.getElemsByTypePrefix('paragraph')

    expect(pList.length).toBe(2)
  })

  describe('setHtml', () => {
    it('setHtml normal', () => {
      const editor = createEditor({ html: '<div>hello</div>' })

      editor.select(getStartLocation(editor))

      const newHtml = '<div>world</div>'

      editor.setHtml(newHtml)

      expect(editor.getHtml()).toBe(newHtml)
    })

    it('setHtml blur', () => {
      const editor = createEditor({
        html: '<div>hello</div>',
        autoFocus: false,
      })

      expect(editor.isFocused()).toBe(false)

      const newHtml = '<div>world</div>'

      editor.setHtml(newHtml)

      expect(editor.getHtml()).toBe(newHtml)
      expect(editor.isFocused()).toBe(false)
    })

    it('setHtml disabled', () => {
      const editor = createEditor({ html: '<div>hello</div>' })

      editor.disable()
      expect(editor.isDisabled()).toBe(true)

      const newHtml = '<div>world</div>'

      editor.setHtml(newHtml)

      expect(editor.getHtml()).toBe(newHtml)
      expect(editor.isDisabled()).toBe(true)
    })

    it('setHtml uses sanitizeHtml config before parsing', () => {
      const sanitizeHtml = vi.fn().mockReturnValue('<div>safe</div>')
      const editor = createEditor({
        html: '<div>hello</div>',
        config: {
          sanitizeHtml,
        },
      })

      editor.setHtml('<a href="javascript:alert(1)">unsafe</a>')

      expect(sanitizeHtml).toHaveBeenCalledWith('<a href="javascript:alert(1)">unsafe</a>')
      expect(editor.getHtml()).toBe('<div>safe</div>')
    })
  })

  it('insertData sanitizes html before inserting', () => {
    const unsafeHref = ['java', 'script:alert(1)'].join('')
    const sanitizeHtml = vi.fn().mockReturnValue('<a href="https://example.com">safe</a>')
    const editor = createEditor({
      config: {
        sanitizeHtml,
      },
    })
    const insertHtmlSpy = vi.spyOn(editor, 'dangerouslyInsertHtml')

    editor.select(getStartLocation(editor))
    editor.insertData({
      getData(type: string) {
        if (type === 'text/html') { return `<a href="${unsafeHref}">unsafe</a>` }
        return ''
      },
    } as DataTransfer)

    expect(sanitizeHtml).toHaveBeenCalledWith(`<a href="${unsafeHref}">unsafe</a>`)
    expect(insertHtmlSpy).toHaveBeenCalledWith('<a href="https://example.com">safe</a>')
  })

  it('insertData truncates html paste when maxLength is exceeded', () => {
    const editor = createCoreEditor({
      config: {
        maxLength: 5,
      },
    })

    editor.select(getStartLocation(editor))
    editor.insertData({
      getData(type: string) {
        if (type === 'text/html') { return '<div><span>hello</span><span> world</span></div>' }
        if (type === 'text/plain') { return 'hello world' }
        return ''
      },
    } as DataTransfer)

    expect(editor.getText()).toBe('hello')
    expect(editor.getHtml()).toContain('hello')
  })

  it('insertData inserts multiline plain text as paragraphs', () => {
    const editor = createEditor()

    editor.select(getStartLocation(editor))
    editor.insertData({
      getData(type: string) {
        if (type === 'text/plain') { return 'hello\nworld\n' }
        return ''
      },
    } as DataTransfer)

    expect(editor.children).toEqual([
      {
        type: 'paragraph',
        children: [{ text: 'hello' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'world' }],
      },
      {
        type: 'paragraph',
        children: [{ text: '' }],
      },
    ])
  })
})
