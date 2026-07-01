/**
 * @description issue #877 nested list leading paragraph round-trip
 */

import { $ } from 'dom7'

import createEditor from '../../../tests/utils/create-editor'
import { parseItemHtmlConf } from '../src/module/parse-elem-html'

describe('list issue #877 round-trip', () => {
  it('parse li should keep leading paragraph text before nested list items', () => {
    const editor = createEditor()
    const $ol = $('<ol><li></li></ol>')
    const children: any[] = [
      {
        type: 'paragraph',
        children: [{ text: '需求材料收尾与评审', bold: true }],
      },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: '行动', bold: true }, { text: '：整合材料' }],
      },
    ]

    const elems = parseItemHtmlConf.parseElemHtml($ol.find('li')[0], children, editor) as any[]

    expect(elems).toEqual([
      {
        type: 'list-item',
        ordered: true,
        level: 0,
        children: [{ text: '需求材料收尾与评审', bold: true }],
      },
      {
        type: 'list-item',
        ordered: false,
        level: 1,
        children: [{ text: '行动', bold: true }, { text: '：整合材料' }],
      },
    ])
  })

  it('setHtml/getHtml should not drop li leading paragraph before nested list', () => {
    const editor = createEditor()
    const html = `
<ol>
  <li>
    <p><strong>需求材料收尾与评审（01月25日-26日，高优先级）</strong></p>
    <ul>
      <li><strong>行动</strong>：整合上周的需求分析与讨论成果，完成招标需求说明书/技术规格书的最终版本。</li>
      <li><strong>产出</strong>：组织一次内部评审会，确认需求材料。</li>
      <li><strong>目标</strong>：锁定需求基线。</li>
    </ul>
  </li>
</ol>`

    editor.setHtml(html)
    const output = editor.getHtml()
    const wrapper = document.createElement('div')

    wrapper.innerHTML = output

    expect(output).toContain('需求材料收尾与评审（01月25日-26日，高优先级）')
    expect(output).toContain('<strong>需求材料收尾与评审（01月25日-26日，高优先级）</strong>')
    expect(wrapper.querySelectorAll('ol > li')).toHaveLength(1)
    expect(wrapper.querySelectorAll('ol > li > ul > li')).toHaveLength(3)
    expect(wrapper.querySelector('ol > li')?.textContent).toContain('行动')
  })
})
