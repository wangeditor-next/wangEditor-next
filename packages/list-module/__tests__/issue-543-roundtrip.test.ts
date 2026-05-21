/**
 * @description issue #543 nested list round-trip
 */

import createEditor from '../../../tests/utils/create-editor'

describe('list issue #543 round-trip', () => {
  it('setHtml/getHtml should keep nested list structure', () => {
    const editor = createEditor()
    const html = '<ol><li>第一项<ul><li>子项1</li><li>子项2</li></ul></li><li>第二项</li></ol>'

    editor.setHtml(html)

    const output = editor.getHtml()
    const wrapper = document.createElement('div')

    wrapper.innerHTML = output
    const topOl = wrapper.querySelector('ol')
    const topLevelLi = topOl ? Array.from(topOl.children).filter(el => el.tagName === 'LI') : []
    const firstLi = topLevelLi[0] as HTMLLIElement | undefined
    const nestedUl = firstLi?.querySelector(':scope > ul')

    expect(topLevelLi.length).toBe(2)
    expect(!!nestedUl).toBe(true)
    expect(topOl?.querySelectorAll(':scope > ul').length || 0).toBe(0)
    expect(nestedUl?.querySelectorAll(':scope > li').length || 0).toBe(2)
  })
})
