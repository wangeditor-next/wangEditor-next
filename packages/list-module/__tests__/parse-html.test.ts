/**
 * @description parse html test
 * @author wangfupeng
 */

import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import { parseItemHtmlConf, parseListHtmlConf } from '../src/module/parse-elem-html'

describe('list - parse html', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('parse unOrdered list item', () => {
    const $ul = $('<ul></ul>')
    const $li = $('<li></li>')

    $ul.append($li)
    const children = [{ text: 'hello' }]

    const elem = parseItemHtmlConf.parseElemHtml($li[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: false,
      level: 0,
      children,
    })
  })

  it('parse ordered list item', () => {
    const $ol = $('<ol></ol>')
    const $li = $('<li></li>')

    $ol.append($li)
    const children = [{ text: 'hello' }]

    const elem = parseItemHtmlConf.parseElemHtml($li[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: true,
      level: 0,
      children,
    })
  })

  it('parse ordered list item with start and type', () => {
    const $ol = $('<ol start="2" type="I"></ol>')
    const $li = $('<li></li>')

    $ol.append($li)
    const children = [{ text: 'hello' }]

    const elem = parseItemHtmlConf.parseElemHtml($li[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: true,
      level: 0,
      start: 2,
      orderType: 'I',
      children,
    })
  })

  it('parse leveled list item', () => {
    const $ul = $('<ul></ul>')
    const $ol = $('<ol></ol>')
    const $li = $('<li></li>')

    $ul.append($ol)
    $ol.append($li)
    const children = [{ text: 'hello' }]

    const elem = parseItemHtmlConf.parseElemHtml($li[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: true,
      level: 1,
      children,
    })
  })

  it('parse leveled list item from standard nested html', () => {
    const $ol = $('<ol></ol>')
    const $liParent = $('<li></li>')
    const $ul = $('<ul></ul>')
    const $liChild = $('<li></li>')

    $ol.append($liParent)
    $liParent.append($ul)
    $ul.append($liChild)

    const children = [{ text: 'child' }]
    const elem = parseItemHtmlConf.parseElemHtml($liChild[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: false,
      level: 1,
      children,
    })
  })

  it('parse list', () => {
    const $ol = $('<ol></ol>')
    const children = [
      {
        type: 'list-item',
        ordered: true,
        children: [{ text: 'a' }],
      },
      {
        type: 'list-item',
        ordered: true,
        children: [{ text: 'b' }],
      },
      // 嵌套列表
      [
        {
          type: 'list-item',
          level: 1,
          children: [{ text: 'x' }],
        },
        {
          type: 'list-item',
          level: 1,
          children: [{ text: 'y' }],
        },
      ],
    ]
    // @ts-ignore
    const listElems = parseListHtmlConf.parseElemHtml($ol[0], children, editor)

    expect(listElems.length).toBe(4) // parse list 时，会把输出的结果（数组）flatten ，把嵌套的平铺开
  })

  it('parse parent li with nested list children should keep parent and flatten nested list items', () => {
    const $ol = $('<ol><li></li></ol>')
    const children: any[] = [
      { text: 'parent' },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: 'child1' }],
      },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: 'child2' }],
      },
    ]

    const elems = parseItemHtmlConf.parseElemHtml($ol.find('li')[0], children, editor) as any[]

    expect(elems).toEqual([
      {
        type: 'list-item',
        ordered: true,
        level: 0,
        children: [{ text: 'parent' }],
      },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: 'child1' }],
      },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: 'child2' }],
      },
    ])
  })

  it('parse isBlock chidren', () => {
    const $ul = $('<ul></ul>')
    const $ol = $('<ol></ol>')
    const $li = $('<li></li>')

    $ul.append($ol)
    $ol.append($li)
    const children = [
      {
        type: 'image',
        src: 'https://www.wangeditor.com/imgs/logo.png',
        children: [{ text: '' }],
      },
    ]

    const elem = parseItemHtmlConf.parseElemHtml($li[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: true,
      level: 1,
      children,
    })
  })

  it('parse invalid chidren', () => {
    const $ul = $('<ul></ul>')
    const $ol = $('<ol></ol>')
    const $li = $('<li></li>')

    $ul.append($ol)
    $ol.append($li)
    const children = [
      {
        type: 'div',
        children: [{ text: '' }],
      },
    ]

    const elem = parseItemHtmlConf.parseElemHtml($li[0], children, editor)

    expect(elem).toEqual({
      type: 'list-item',
      ordered: true,
      level: 1,
      children: [
        {
          text: '',
        },
      ],
    })
  })
})
