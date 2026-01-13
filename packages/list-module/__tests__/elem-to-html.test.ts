/**
 * @description list toHtml test
 * @author wangfupeng
 */

import createEditor from '../../../tests/utils/create-editor'
import listItemToHtmlConf from '../src/module/elem-to-html'
import $, { getTagName } from '../src/utils/dom'
import { ELEM_TO_EDITOR } from '../src/utils/maps'

describe('module elem-to-html', () => {
  const childrenHtml = '<span>hello</span>'

  const orderedElem1 = { type: 'list-item', ordered: true, children: [{ text: '' }] }
  const orderedElem2 = { type: 'list-item', ordered: true, children: [{ text: '' }] }
  const unOrderedItem1 = { type: 'list-item', children: [{ text: '' }] }
  const unOrderedItem2 = { type: 'list-item', children: [{ text: '' }] }
  const unOrderedItem21 = { type: 'list-item', level: 1, children: [{ text: '' }] }

  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor({
      content: [orderedElem1, orderedElem2, unOrderedItem1, unOrderedItem2, unOrderedItem21],
    })

    // elem 绑定 editor
    ELEM_TO_EDITOR.set(orderedElem1, editor)
    ELEM_TO_EDITOR.set(orderedElem2, editor)
    ELEM_TO_EDITOR.set(unOrderedItem1, editor)
    ELEM_TO_EDITOR.set(unOrderedItem2, editor)
    ELEM_TO_EDITOR.set(unOrderedItem21, editor)
  })

  test('toHtml conf type', () => {
    expect(listItemToHtmlConf.type).toBe('list-item')
  })

  test('ordered item toHtml', () => {
    const { elemToHtml } = listItemToHtmlConf

    // first item
    const firstHtml = elemToHtml(orderedElem1, childrenHtml)

    expect(firstHtml).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol>', // 第一个 item ，前面会有 <ol>
      suffix: '',
    })

    // last item
    const lastHtml = elemToHtml(orderedElem2, childrenHtml)

    expect(lastHtml).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '',
      suffix: '</ol>', // 最后一个 item ，后面会有 </ol>
    })
  })

  test('unOrdered item toHtml', () => {
    const { elemToHtml } = listItemToHtmlConf

    // first item
    const firstHtml = elemToHtml(unOrderedItem1, childrenHtml)

    expect(firstHtml).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ul>', // 第一个 item ，前面会有 <ul>
      suffix: '',
    })

    // second item
    const secondHtml = elemToHtml(unOrderedItem2, childrenHtml)

    expect(secondHtml).toEqual({
      html: '<li><span>hello</span></li>', // 第二个 item ，不应该有 <ul>
      prefix: '',
      suffix: '',
    })

    // last item - leveled
    const lastHtml = elemToHtml(unOrderedItem21, childrenHtml)

    expect(lastHtml).toEqual({
      html: '<li><span>hello</span></li>', // 最后一个 item ( leveled ) ，包裹 <ul>
      prefix: '<ul>',
      suffix: '</ul></ul>',
    })
  })

  // empty item
  test('should return empty string for empty Dom7Array', () => {
    // 创建一个空的 Dom7Array
    const $elem = $()
    const tagName = getTagName($elem)

    expect(tagName).toBe('')
  })
})

describe('module elem-to-html complex list', () => {
  const unOrderedElem1 = { type: 'list-item', ordered: false, children: [{ text: '' }] }
  const unOrderedElem2 = {
    type: 'list-item', ordered: false, level: 1, children: [{ text: '' }],
  }
  const unOrderedElem3 = { type: 'list-item', ordered: false, children: [{ text: '' }] }
  const orderedElem1 = {
    type: 'list-item', ordered: true, level: 1, children: [{ text: '' }],
  }
  const orderedElem2 = { type: 'list-item', ordered: true, children: [{ text: '' }] }
  const firstTextHtml = { type: 'paragraph', children: [{ text: 'hello' }] }
  const lastTextHtml = { type: 'paragraph', children: [{ text: 'world' }] }

  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor({
      content: [
        firstTextHtml,
        unOrderedElem1,
        unOrderedElem2,
        unOrderedElem3,
        orderedElem1,
        orderedElem2,
        lastTextHtml,
      ],
    })

    // elem 绑定 editor
    ELEM_TO_EDITOR.set(firstTextHtml, editor)
    ELEM_TO_EDITOR.set(unOrderedElem1, editor)
    ELEM_TO_EDITOR.set(unOrderedElem2, editor)
    ELEM_TO_EDITOR.set(orderedElem1, editor)
    ELEM_TO_EDITOR.set(orderedElem2, editor)
    ELEM_TO_EDITOR.set(lastTextHtml, editor)
  })

  test('get container tag mumber', () => {
    const childrenHtml = '<span>hello</span>'
    const { elemToHtml } = listItemToHtmlConf
    const unOrderedHtml1 = elemToHtml(unOrderedElem1, childrenHtml)

    expect(unOrderedHtml1).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '',
    })
    const unOrderedHtml2 = elemToHtml(unOrderedElem2, childrenHtml)

    expect(unOrderedHtml2).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
    const orderedHtml1 = elemToHtml(orderedElem1, childrenHtml)

    expect(orderedHtml1).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol>',
      suffix: '</ol></ul>',
    })
    const orderedHtml2 = elemToHtml(orderedElem2, childrenHtml)

    expect(orderedHtml2).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol>',
      suffix: '</ol>',
    })
  })
})
