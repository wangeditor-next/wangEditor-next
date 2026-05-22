/**
 * @description list toHtml test
 * @author wangfupeng
 */

import createEditor from '../../../tests/utils/create-editor'
import listItemToHtmlConf from '../src/module/elem-to-html'
import $, { getTagName } from '../src/utils/dom'
import { ELEM_TO_EDITOR } from '../src/utils/maps'

type TestListItem = {
  type: 'list-item'
  ordered?: boolean
  level?: number
  start?: number
  orderType?: '1' | 'a' | 'A' | 'i' | 'I'
  children: Array<{ text: string; color?: string }>
}

function serializeListItems(items: TestListItem[], styleEditor?: any) {
  const editor = createEditor({ content: items as any })
  const { elemToHtml } = listItemToHtmlConf
  const chunks: Array<{ html: string; prefix?: string; suffix?: string }> = []
  let html = ''

  items.forEach(item => ELEM_TO_EDITOR.set(item as any, editor))

  items.forEach(item => {
    const text = item.children[0]?.text || ''
    const res = elemToHtml(item as any, `<span>${text}</span>`, styleEditor)

    chunks.push(res)
    html += `${res.prefix || ''}${res.html}${res.suffix || ''}`
  })

  return { html, chunks }
}

describe('module elem-to-html', () => {
  test('toHtml conf type', () => {
    expect(listItemToHtmlConf.type).toBe('list-item')
  })

  test('ordered list serialization', () => {
    const orderedElem1: TestListItem = { type: 'list-item', ordered: true, children: [{ text: 'hello' }] }
    const orderedElem2: TestListItem = { type: 'list-item', ordered: true, children: [{ text: 'world' }] }
    const { html, chunks } = serializeListItems([orderedElem1, orderedElem2])

    expect(chunks[0]).toEqual({
      html: '<li><span>hello</span></li>',
      prefix: '<ol>',
      suffix: '',
    })
    expect(chunks[1]).toEqual({
      html: '<li><span>world</span></li>',
      prefix: '',
      suffix: '</ol>',
    })
    expect(html).toBe('<ol><li><span>hello</span></li><li><span>world</span></li></ol>')
  })

  test('ordered list preserves start/type', () => {
    const orderedWithType1: TestListItem = {
      type: 'list-item',
      ordered: true,
      orderType: 'A',
      start: 3,
      children: [{ text: 'hello' }],
    }
    const orderedWithType2: TestListItem = {
      type: 'list-item',
      ordered: true,
      orderType: 'A',
      start: 3,
      children: [{ text: 'world' }],
    }
    const { html } = serializeListItems([orderedWithType1, orderedWithType2])

    expect(html).toBe('<ol type="A" start="3"><li><span>hello</span></li><li><span>world</span></li></ol>')
  })

  test('mixed list boundaries stay valid', () => {
    const ordered1: TestListItem = { type: 'list-item', ordered: true, children: [{ text: 'o1' }] }
    const ordered2: TestListItem = { type: 'list-item', ordered: true, children: [{ text: 'o2' }] }
    const unOrdered1: TestListItem = { type: 'list-item', ordered: false, children: [{ text: 'u1' }] }
    const unOrdered2: TestListItem = {
      type: 'list-item',
      ordered: false,
      level: 1,
      children: [{ text: 'u2' }],
    }
    const { html } = serializeListItems([ordered1, ordered2, unOrdered1, unOrdered2])

    expect(html).toBe(
      '<ol><li><span>o1</span></li><li><span>o2</span></li></ol><ul><li><span>u1</span><ul><li><span>u2</span></li></ul></li></ul>',
    )
  })

  test('should return empty string for empty Dom7Array', () => {
    const $elem = $()
    const tagName = getTagName($elem)

    expect(tagName).toBe('')
  })

  test('prefix color in class mode', () => {
    const colorElem: TestListItem = {
      type: 'list-item',
      children: [{ text: 'hello', color: 'rgb(235, 144, 58)' }],
    }
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any
    const { chunks } = serializeListItems([colorElem], mockEditor)

    expect(chunks[0]).toEqual({
      html: '<li class="w-e-list-color-xx8cx7" data-w-e-color="rgb(235, 144, 58)"><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
  })

  test('unknown color in class mode keeps data by default', () => {
    const colorElem: TestListItem = {
      type: 'list-item',
      children: [{ text: 'hello', color: 'rgb(1, 2, 3)' }],
    }
    const mockEditor = {
      getConfig() {
        return { textStyleMode: 'class' }
      },
    } as any
    const { chunks } = serializeListItems([colorElem], mockEditor)

    expect(chunks[0]).toEqual({
      html: '<li data-w-e-color="rgb(1, 2, 3)"><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
  })

  test('unknown color in class mode falls back to inline when policy is fallback-inline', () => {
    const colorElem: TestListItem = {
      type: 'list-item',
      children: [{ text: 'hello', color: 'rgb(1, 2, 3)' }],
    }
    const mockEditor = {
      getConfig() {
        return {
          textStyleMode: 'class',
          classStylePolicy: 'fallback-inline',
        }
      },
    } as any
    const { chunks } = serializeListItems([colorElem], mockEditor)

    expect(chunks[0]).toEqual({
      html: '<li data-w-e-color="rgb(1, 2, 3)" style="color:rgb(1, 2, 3)"><span>hello</span></li>',
      prefix: '<ul>',
      suffix: '</ul>',
    })
  })

  test('unknown color in class mode throws when policy is strict', () => {
    const colorElem: TestListItem = {
      type: 'list-item',
      children: [{ text: 'hello', color: 'rgb(1, 2, 3)' }],
    }
    const mockEditor = {
      getConfig() {
        return {
          textStyleMode: 'class',
          classStylePolicy: 'strict',
        }
      },
    } as any

    expect(() => serializeListItems([colorElem], mockEditor)).toThrow(
      '[wangeditor] Unsupported list color class token color=rgb(1, 2, 3). policy=strict',
    )
  })
})

describe('module elem-to-html complex list', () => {
  test('outputs standard nested html for mixed nested list items', () => {
    const content: TestListItem[] = [
      { type: 'list-item', ordered: false, children: [{ text: 'a' }] },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: 'b' }],
      },
      { type: 'list-item', ordered: false, children: [{ text: 'c' }] },
      {
        type: 'list-item',
        ordered: true,
        level: 1,
        children: [{ text: 'd' }],
      },
      { type: 'list-item', ordered: true, children: [{ text: 'e' }] },
    ]
    const { html } = serializeListItems(content)

    expect(html).toBe(
      '<ul><li><span>a</span><ul><li><span>b</span></li></ul></li><li><span>c</span><ol><li><span>d</span></li></ol></li></ul><ol><li><span>e</span></li></ol>',
    )
  })
})

describe('module elem-to-html ordered list boundaries', () => {
  test('split consecutive ordered lists by type/start config', () => {
    const orderedDecimal: TestListItem = {
      type: 'list-item',
      ordered: true,
      children: [{ text: 'hello' }],
    }
    const orderedUpperAlpha: TestListItem = {
      type: 'list-item',
      ordered: true,
      orderType: 'A',
      children: [{ text: 'world' }],
    }
    const orderedUpperRomanFrom2: TestListItem = {
      type: 'list-item',
      ordered: true,
      orderType: 'I',
      start: 2,
      children: [{ text: 'tail' }],
    }
    const { html } = serializeListItems([orderedDecimal, orderedUpperAlpha, orderedUpperRomanFrom2])

    expect(html).toBe(
      '<ol><li><span>hello</span></li></ol><ol type="A"><li><span>world</span></li></ol><ol type="I" start="2"><li><span>tail</span></li></ol>',
    )
  })
})

describe('module elem-to-html regression #543', () => {
  test('should export nested list inside parent li', () => {
    const content: TestListItem[] = [
      { type: 'list-item', ordered: true, children: [{ text: '第一项' }] },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: '子项1' }],
      },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: '子项2' }],
      },
      { type: 'list-item', ordered: true, children: [{ text: '第二项' }] },
    ]
    const { html } = serializeListItems(content)

    expect(html).toBe(
      '<ol><li><span>第一项</span><ul><li><span>子项1</span></li><li><span>子项2</span></li></ul></li><li><span>第二项</span></li></ol>',
    )
  })
})
