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

  test('ordered item toHtml with start/type', () => {
    const orderedWithType1 = {
      type: 'list-item',
      ordered: true,
      orderType: 'A',
      start: 3,
      children: [{ text: '' }],
    }
    const orderedWithType2 = {
      type: 'list-item',
      ordered: true,
      orderType: 'A',
      start: 3,
      children: [{ text: '' }],
    }
    const localEditor = createEditor({
      content: [orderedWithType1, orderedWithType2],
    })

    ELEM_TO_EDITOR.set(orderedWithType1, localEditor)
    ELEM_TO_EDITOR.set(orderedWithType2, localEditor)

    const { elemToHtml } = listItemToHtmlConf
    const firstHtml = elemToHtml(orderedWithType1, childrenHtml)
    const secondHtml = elemToHtml(orderedWithType2, childrenHtml)

    expect(firstHtml).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol type="A" start="3">',
      suffix: '',
    })
    expect(secondHtml).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '',
      suffix: '</ol>',
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

  test('prefix color in class mode', () => {
    const color = 'rgb(235, 144, 58)'
    const colorElem = {
      type: 'list-item',
      children: [{ text: 'hello', color }],
    }
    const colorEditor = createEditor({
      content: [colorElem],
    })

    ELEM_TO_EDITOR.set(colorElem, colorEditor)

    const { elemToHtml } = listItemToHtmlConf
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any

    const res = elemToHtml(colorElem, childrenHtml, mockEditor)

    expect(res).toEqual({
      html: '<li class="w-e-list-color-xx8cx7" data-w-e-color="rgb(235, 144, 58)"><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
  })

  test('unknown color in class mode keeps data by default', () => {
    const color = 'rgb(1, 2, 3)'
    const colorElem = {
      type: 'list-item',
      children: [{ text: 'hello', color }],
    }
    const colorEditor = createEditor({
      content: [colorElem],
    })

    ELEM_TO_EDITOR.set(colorElem, colorEditor)

    const { elemToHtml } = listItemToHtmlConf
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any

    const res = elemToHtml(colorElem, childrenHtml, mockEditor)

    expect(res).toEqual({
      html: '<li data-w-e-color="rgb(1, 2, 3)"><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
  })

  test('unknown color in class mode falls back to inline when policy is fallback-inline', () => {
    const color = 'rgb(1, 2, 3)'
    const colorElem = {
      type: 'list-item',
      children: [{ text: 'hello', color }],
    }
    const colorEditor = createEditor({
      content: [colorElem],
    })

    ELEM_TO_EDITOR.set(colorElem, colorEditor)

    const { elemToHtml } = listItemToHtmlConf
    const mockEditor = {
      getConfig() {
        return {
          textStyleMode: 'class',
          classStylePolicy: 'fallback-inline',
        }
      },
    } as any

    const res = elemToHtml(colorElem, childrenHtml, mockEditor)

    expect(res).toEqual({
      html: '<li data-w-e-color="rgb(1, 2, 3)" style="color:rgb(1, 2, 3)"><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
  })

  test('unknown color in class mode throws when policy is strict', () => {
    const color = 'rgb(1, 2, 3)'
    const colorElem = {
      type: 'list-item',
      children: [{ text: 'hello', color }],
    }
    const colorEditor = createEditor({
      content: [colorElem],
    })

    ELEM_TO_EDITOR.set(colorElem, colorEditor)

    const { elemToHtml } = listItemToHtmlConf
    const mockEditor = {
      getConfig() {
        return {
          textStyleMode: 'class',
          classStylePolicy: 'strict',
        }
      },
    } as any

    expect(() => elemToHtml(colorElem, childrenHtml, mockEditor)).toThrow(
      '[wangeditor] Unsupported list color class token color=rgb(1, 2, 3). policy=strict',
    )
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

describe('module elem-to-html ordered list boundaries', () => {
  const orderedDecimal = {
    type: 'list-item',
    ordered: true,
    children: [{ text: '' }],
  }
  const orderedUpperAlpha = {
    type: 'list-item',
    ordered: true,
    orderType: 'A',
    children: [{ text: '' }],
  }
  const orderedUpperRomanFrom2 = {
    type: 'list-item',
    ordered: true,
    orderType: 'I',
    start: 2,
    children: [{ text: '' }],
  }

  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor({
      content: [orderedDecimal, orderedUpperAlpha, orderedUpperRomanFrom2],
    })

    ELEM_TO_EDITOR.set(orderedDecimal, editor)
    ELEM_TO_EDITOR.set(orderedUpperAlpha, editor)
    ELEM_TO_EDITOR.set(orderedUpperRomanFrom2, editor)
  })

  test('split consecutive ordered lists by type/start config', () => {
    const childrenHtml = '<span>hello</span>'
    const { elemToHtml } = listItemToHtmlConf

    expect(elemToHtml(orderedDecimal, childrenHtml)).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol>',
      suffix: '</ol>',
    })

    expect(elemToHtml(orderedUpperAlpha, childrenHtml)).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol type="A">',
      suffix: '</ol>',
    })

    expect(elemToHtml(orderedUpperRomanFrom2, childrenHtml)).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol type="I" start="2">',
      suffix: '</ol>',
    })
  })
})
