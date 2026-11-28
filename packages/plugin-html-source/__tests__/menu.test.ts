import createEditor from '../../../tests/utils/create-editor'
import EditHtmlSourceMenu from '../src/module/menu/EditHtmlSource'

function openModal(menu: EditHtmlSourceMenu, editor: ReturnType<typeof createEditor>) {
  const content = menu.getModalContentElem(editor)
  const textarea = content.querySelector('textarea') as HTMLTextAreaElement
  const button = content.querySelector('button') as HTMLButtonElement

  return { textarea, button }
}

describe('plugin-html-source edit html source menu', () => {
  it('has a static menu state', () => {
    const editor = createEditor()
    const menu = new EditHtmlSourceMenu()

    expect(menu.tag).toBe('button')
    expect(menu.showModal).toBe(true)
    expect(menu.getValue(editor)).toBe('')
    expect(menu.isActive(editor)).toBe(false)
    expect(menu.isDisabled(editor)).toBe(false)
    expect(menu.getModalPositionNode(editor)).toBeNull()
  })

  it('shows the formatted editor html in the textarea', () => {
    const editor = createEditor({ html: '<h1>Title</h1><p>Hello <strong>world</strong></p>' })
    const menu = new EditHtmlSourceMenu()

    const { textarea } = openModal(menu, editor)

    expect(textarea.value).toBe('<h1>Title</h1>\n<p>Hello <strong>world</strong></p>')
  })

  it('replaces the editor content with the edited html', () => {
    const editor = createEditor({ html: '<p>Hello</p>' })
    const menu = new EditHtmlSourceMenu()
    const hideSpy = vi.spyOn(editor, 'hidePanelOrModal')

    const { textarea, button } = openModal(menu, editor)

    textarea.value = '<h2>New title</h2>\n<p>New <em>content</em></p>'
    button.click()

    expect(editor.getHtml()).toBe('<h2>New title</h2><p>New <em>content</em></p>')
    expect(editor.isFocused()).toBe(true)
    expect(hideSpy).toHaveBeenCalled()
  })

  it('parses edited html that starts with whitespace as html', () => {
    const editor = createEditor({ html: '<p>Hello</p>' })
    const menu = new EditHtmlSourceMenu()

    const { textarea, button } = openModal(menu, editor)

    textarea.value = '\n  <p><strong>bold</strong></p>\n'
    button.click()

    expect(editor.getHtml()).toBe('<p><strong>bold</strong></p>')
  })

  it('reloads the current html every time the modal opens', () => {
    const editor = createEditor({ html: '<p>first</p>' })
    const menu = new EditHtmlSourceMenu()

    openModal(menu, editor)
    editor.setHtml('<p>second</p>')

    const { textarea } = openModal(menu, editor)

    expect(textarea.value).toBe('<p>second</p>')
  })

  it('does not reset the content when the html is unchanged', () => {
    const editor = createEditor({ html: '<p>Hello</p><p>World</p>' })
    const menu = new EditHtmlSourceMenu()
    const setHtmlSpy = vi.spyOn(editor, 'setHtml')

    const { button } = openModal(menu, editor)

    button.click()

    expect(setHtmlSpy).not.toHaveBeenCalled()
    expect(editor.getHtml()).toBe('<p>Hello</p><p>World</p>')
  })

  it('does not change a disabled editor', () => {
    const editor = createEditor({ html: '<p>Hello</p>' })
    const menu = new EditHtmlSourceMenu()

    const { textarea, button } = openModal(menu, editor)

    editor.disable()
    textarea.value = '<p>Changed</p>'
    button.click()

    expect(editor.getHtml()).toBe('<p>Hello</p>')
  })
})
