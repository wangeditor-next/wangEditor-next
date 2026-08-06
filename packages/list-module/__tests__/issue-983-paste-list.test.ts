/**
 * @description issue #983 pasted lists should not truncate following content
 */

import { Editor } from 'slate'

import createEditor from '../../../tests/utils/create-editor'

const PASTED_HTML = '<p>before</p><ul><li>one</li><li>two</li></ul><p>after</p>'

describe('list issue #983 pasted list', () => {
  it('dangerouslyInsertHtml should preserve a list and the content after it', () => {
    const editor = createEditor()
    const hiddenContainerCount = document.body.querySelectorAll(
      ':scope > div[hidden="true"]'
    ).length

    editor.select(Editor.start(editor, []))

    expect(() => editor.dangerouslyInsertHtml(PASTED_HTML)).not.toThrow()

    const output = editor.getHtml()
    const wrapper = document.createElement('div')

    wrapper.innerHTML = output

    expect(wrapper.querySelector('p')?.textContent).toBe('before')
    expect(wrapper.querySelectorAll('ul > li')).toHaveLength(2)
    expect(wrapper.querySelector('ul > li')?.textContent).toBe('one')
    expect(wrapper.querySelector('p:last-child')?.textContent).toBe('after')
    expect(document.body.querySelectorAll(':scope > div[hidden="true"]')).toHaveLength(
      hiddenContainerCount
    )

    const roundTripEditor = createEditor({ html: output })

    expect(roundTripEditor.getHtml()).toBe(output)
    expect(roundTripEditor.children).toEqual(editor.children)
  })

  it('insertData should preserve ordered lists from external HTML', () => {
    const editor = createEditor()
    const data = {
      getData(type: string) {
        if (type === 'text/html') {
          return '<p>before</p><ol><li>one</li><li>two</li></ol><p>after</p>'
        }
        if (type === 'text/plain') {
          return 'before\none\ntwo\nafter'
        }
        return ''
      },
    } as DataTransfer

    editor.select(Editor.start(editor, []))

    expect(() => editor.insertData(data)).not.toThrow()

    const output = editor.getHtml()
    const wrapper = document.createElement('div')

    wrapper.innerHTML = output

    expect(wrapper.querySelectorAll('ol > li')).toHaveLength(2)
    expect(wrapper.querySelector('p:last-child')?.textContent).toBe('after')
  })

  it('should preserve nested list levels while parsing mounted HTML', () => {
    const editor = createEditor()
    const html = '<p>before</p><ul><li>parent<ol><li>child</li></ol></li></ul><p>after</p>'

    editor.select(Editor.start(editor, []))
    editor.dangerouslyInsertHtml(html)

    const output = editor.getHtml()
    const wrapper = document.createElement('div')

    wrapper.innerHTML = output

    expect(wrapper.querySelectorAll('ul > li')).toHaveLength(1)
    expect(wrapper.querySelectorAll('ul > li > ol > li')).toHaveLength(1)
    expect(wrapper.querySelector('ul > li > ol > li')?.textContent).toBe('child')
    expect(wrapper.querySelector('p:last-child')?.textContent).toBe('after')

    const roundTripEditor = createEditor({ html: output })

    expect(roundTripEditor.getHtml()).toBe(output)
    expect(roundTripEditor.children).toEqual(editor.children)
  })
})
