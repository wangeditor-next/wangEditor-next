import DropPanel from '../../src/menus/panel-and-modal/DropPanel'
import Modal, {
  genModalButtonElems,
  genModalInputElems,
  genModalTextareaElems,
} from '../../src/menus/panel-and-modal/Modal'
import SelectList from '../../src/menus/panel-and-modal/SelectList'
import {
  EDITOR_TO_PANEL_AND_MODAL,
  PANEL_OR_MODAL_TO_EDITOR,
} from '../../src/utils/weak-maps'

describe('panel and modal classes', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  test('SelectList renders options and selected state', () => {
    const editor = { emit: vi.fn() } as any
    const list = new SelectList(editor, 240)

    list.renderList([
      { value: 'a', text: 'Alpha', selected: true },
      {
        value: 'b',
        text: 'Beta',
        selected: false,
        styleForRenderMenuList: { color: 'red' },
      },
    ])

    const items = list.$elem.find('li')

    expect(list.$elem.css('width')).toBe('240px')
    expect(items.length).toBe(2)
    expect(items[0].className).toContain('selected')
    expect(items[1].getAttribute('title')).toBe('Beta')
    expect(items[1].getAttribute('style')).toContain('color: red')
  })

  test('panel show and hide emit lifecycle events and guard against immediate hide', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T00:00:00Z'))
    const editor = { emit: vi.fn() } as any
    const panel = new DropPanel(editor)

    panel.show()
    expect(panel.isShow).toBe(true)
    expect(editor.emit).toHaveBeenCalledWith('modalOrPanelShow', panel)

    vi.setSystemTime(new Date('2026-03-23T00:00:00.100Z'))
    panel.hide()
    expect(panel.isShow).toBe(true)

    vi.setSystemTime(new Date('2026-03-23T00:00:00.250Z'))
    panel.hide()
    expect(panel.isShow).toBe(false)
    expect(editor.emit).toHaveBeenCalledWith('modalOrPanelHide')
    expect(EDITOR_TO_PANEL_AND_MODAL.get(editor)?.has(panel)).toBe(true)
    expect(PANEL_OR_MODAL_TO_EDITOR.get(panel)).toBe(editor)
  })

  test('Modal closes via close button and escape, restoring selection', () => {
    const editor = {
      emit: vi.fn(),
      restoreSelection: vi.fn(),
    } as any
    const modal = new Modal(editor, 320)

    modal.renderContent(document.createElement('div'))
    modal.setStyle({ left: '10px', top: '20px' })

    const closeButton = modal.genSelfElem()?.[0] as HTMLElement

    expect(modal.$elem.css('width')).toBe('320px')
    expect(modal.$elem.css('left')).toBe('10px')
    expect(modal.$elem.css('top')).toBe('20px')

    closeButton.click()
    expect(editor.restoreSelection).toHaveBeenCalledTimes(1)

    modal.$elem[0].dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', bubbles: true }))
    expect(editor.restoreSelection).toHaveBeenCalledTimes(2)
  })

  test('modal helper element generators return labeled DOM nodes', () => {
    const [inputContainer, input] = genModalInputElems('Link', 'link-id', 'https://')
    const [textareaContainer, textarea] = genModalTextareaElems('Desc', 'desc-id', 'text')
    const [buttonContainer, button] = genModalButtonElems('ok-id', 'OK')

    expect(inputContainer.tagName).toBe('LABEL')
    expect((input as HTMLInputElement).id).toBe('link-id')
    expect((input as HTMLInputElement).placeholder).toBe('https://')

    expect(textareaContainer.tagName).toBe('LABEL')
    expect((textarea as HTMLTextAreaElement).id).toBe('desc-id')
    expect((textarea as HTMLTextAreaElement).placeholder).toBe('text')

    expect(buttonContainer.className).toBe('button-container')
    expect((button as HTMLButtonElement).id).toBe('ok-id')
    expect((button as HTMLButtonElement).textContent).toBe('OK')
  })
})
