import Select from '../../src/menus/bar-item/Select'
import { BAR_ITEM_TO_EDITOR } from '../../src/utils/weak-maps'

function createEditorStub() {
  return {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    emit: vi.fn(),
    hidePanelOrModal: vi.fn(),
    isDisabled: vi.fn(() => false),
  } as any
}

describe('Select bar item', () => {
  async function flushMicrotasks() {
    await Promise.resolve()
    await Promise.resolve()
  }

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('renders selected option text and updates disabled state', async () => {
    const editor = createEditorStub()
    const menu = {
      title: 'Header',
      tag: 'select',
      getValue: () => 'h2',
      getOptions: () => [
        { value: 'p', text: 'Paragraph' },
        { value: 'h2', text: 'Heading 2' },
      ],
      isActive: () => false,
      isDisabled: () => true,
      exec: vi.fn(),
    }
    const select = new Select('headerSelect', menu as any)

    BAR_ITEM_TO_EDITOR.set(select as any, editor)
    await flushMicrotasks()

    select.changeMenuState()

    expect((select as any).$button.text()).toContain('Heading 2')
    expect((select as any).$button.hasClass('disabled')).toBe(true)
  })

  test('toggles the select list and executes the menu on option click', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T00:00:00.000Z'))
    const editor = createEditorStub()
    const menu = {
      title: 'Header',
      tag: 'select',
      selectPanelWidth: 240,
      getValue: () => 'p',
      getOptions: () => [
        { value: 'p', text: 'Paragraph' },
        { value: 'h1', text: 'Heading 1' },
      ],
      isActive: () => false,
      isDisabled: () => false,
      exec: vi.fn(),
    }
    const select = new Select('headerSelect', menu as any)

    BAR_ITEM_TO_EDITOR.set(select as any, editor)
    await flushMicrotasks();
    (select as any).$button[0].click()

    expect(editor.hidePanelOrModal).toHaveBeenCalled()
    expect((select as any).selectList.isShow).toBe(true)
    expect((select as any).selectList.$elem.css('width')).toBe('240px')

    const option = (select as any).selectList.$elem.find('li[data-value="h1"]')[0] as HTMLElement

    option.click()

    expect(menu.exec).toHaveBeenCalledWith(editor, 'h1')

    vi.setSystemTime(new Date('2026-03-23T00:00:00.250Z'));
    (select as any).$button[0].click()

    expect((select as any).selectList.isShow).toBe(false)
  })
})
