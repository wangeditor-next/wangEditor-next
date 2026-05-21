/**
 * @description issue #612 parse/toHtml round-trip test
 */

import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import listItemToHtmlConf from '../src/module/elem-to-html'
import { parseItemHtmlConf } from '../src/module/parse-elem-html'
import { ELEM_TO_EDITOR } from '../src/utils/maps'

describe('list issue #612 round-trip', () => {
  it('should preserve ordered list start/type in parse <-> toHtml', () => {
    const html = [
      '<ol><li><p><strong>用信对象</strong></p></li></ol>',
      '<ol type="A"><li><p>基本情况</p></li></ol>',
      '<ol start="2" type="I"><li><p>管理水平</p></li></ol>',
    ].join('')

    const $wrapper = $(`<div>${html}</div>`)
    const parseEditor = createEditor()

    const parsedItems = Array.from($wrapper.find('li')).map(li => {
      const $li = $(li)
      const text = $li.text().trim()

      return parseItemHtmlConf.parseElemHtml(li, [{ text }], parseEditor)
    })

    expect(parsedItems).toHaveLength(3)
    expect(parsedItems[0]).toMatchObject({
      type: 'list-item',
      ordered: true,
      level: 0,
    })
    expect(parsedItems[1]).toMatchObject({
      type: 'list-item',
      ordered: true,
      level: 0,
      orderType: 'A',
    })
    expect(parsedItems[2]).toMatchObject({
      type: 'list-item',
      ordered: true,
      level: 0,
      start: 2,
      orderType: 'I',
    })

    const exportEditor = createEditor({
      content: parsedItems as any,
    })

    const { elemToHtml } = listItemToHtmlConf
    let exportedHtml = ''

    parsedItems.forEach(item => {
      ELEM_TO_EDITOR.set(item as any, exportEditor)
      const text = item.children?.[0]?.text ?? ''
      const res = elemToHtml(item as any, `<span>${text}</span>`)

      exportedHtml += `${res.prefix || ''}${res.html}${res.suffix || ''}`
    })

    expect((exportedHtml.match(/<ol/g) || []).length).toBe(3)
    expect(exportedHtml).toContain('<ol type="A">')
    expect(exportedHtml).toContain('<ol type="I" start="2">')

    const $roundTripWrapper = $(`<div>${exportedHtml}</div>`)
    const roundTripItems = Array.from($roundTripWrapper.find('li')).map(li => {
      const $li = $(li)
      const text = $li.text().trim()

      return parseItemHtmlConf.parseElemHtml(li, [{ text }], parseEditor)
    })

    expect(roundTripItems).toHaveLength(3)
    expect(roundTripItems[1]).toMatchObject({
      ordered: true,
      level: 0,
      orderType: 'A',
    })
    expect(roundTripItems[2]).toMatchObject({
      ordered: true,
      level: 0,
      start: 2,
      orderType: 'I',
    })
  })
})
