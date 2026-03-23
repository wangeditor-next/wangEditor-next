import { Editor, Text } from 'slate'

import { DomEditor } from '../../src/editor/dom-editor'
import { i18nChangeLanguage } from '../../src/i18n'
import HoverBar from '../../src/menus/bar/HoverBar'
import DropPanelButton from '../../src/menus/bar-item/DropPanelButton'
import ModalButton from '../../src/menus/bar-item/ModalButton'
import * as positionHelpers from '../../src/menus/helpers/position'
import { MENU_ITEM_FACTORIES } from '../../src/menus/register'
import $ from '../../src/utils/dom'
import {
  BAR_ITEM_TO_EDITOR,
  HOVER_BAR_TO_EDITOR,
} from '../../src/utils/weak-maps'

function createEditorStub() {
  return {
    selection: {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
    emit: vi.fn(),
    on: vi.fn(),
    blur: vi.fn(),
    deselect: vi.fn(),
    hidePanelOrModal: vi.fn(),
    isDisabled: vi.fn(() => false),
    getConfig: vi.fn(() => ({ hoverbarKeys: {} })),
    getMenuConfig: vi.fn(() => ({})),
  } as any
}

async function flushMicrotasks() {
  await Promise.resolve()
  await Promise.resolve()
}

describe('bar item lifecycle', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  test('ModalButton appends to textarea container and toggles modal visibility', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T00:00:00.000Z'))
    const editor = createEditorStub()
    const textareaContainer = document.createElement('div')
    const menu = {
      title: 'Link',
      tag: 'button',
      showModal: true,
      modalWidth: 320,
      getValue: () => '',
      isActive: () => false,
      isDisabled: () => false,
      exec: vi.fn(),
      getModalContentElem: () => {
        const div = document.createElement('div')

        div.textContent = 'modal-body'
        return div
      },
      getModalPositionNode: () => null,
    }
    const button = new ModalButton('link', menu as any)

    textareaContainer.style.position = 'relative'
    textareaContainer.style.width = '400px'
    textareaContainer.style.height = '300px'
    document.body.appendChild(textareaContainer)

    BAR_ITEM_TO_EDITOR.set(button as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: $(textareaContainer),
    } as any)
    vi.spyOn(DomEditor, 'getToolbar').mockReturnValue({
      getConfig: () => ({ modalAppendToBody: true }),
    } as any)

    await flushMicrotasks();
    (button as any).$button[0].click()
    vi.runAllTimers()

    expect(menu.exec).toHaveBeenCalled()
    expect(editor.hidePanelOrModal).toHaveBeenCalled()
    expect(editor.blur).toHaveBeenCalled()
    expect(document.body.querySelector('.w-e-modal')).not.toBeNull()
    expect((button as any).modal.isShow).toBe(true)

    vi.setSystemTime(new Date('2026-03-23T00:00:00.250Z'));
    (button as any).$button[0].click()

    expect((button as any).modal.isShow).toBe(false)
  })

  test('DropPanelButton adds an arrow and positions the panel based on toolbar side', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-03-23T00:00:00.000Z'))
    const editor = createEditorStub()
    const menu = {
      title: 'More',
      tag: 'button',
      showDropPanel: true,
      getValue: () => '',
      isActive: () => false,
      isDisabled: () => false,
      exec: vi.fn(),
      getPanelContentElem: () => {
        const div = document.createElement('div')

        div.textContent = 'panel-body'
        return div
      },
    }
    const button = new DropPanelButton('more', menu as any)

    BAR_ITEM_TO_EDITOR.set(button as any, editor)
    await flushMicrotasks()

    Object.assign((button as any).$elem, {
      offset: () => ({ left: 280, top: 0 }),
      parents: () => ({
        offset: () => ({ left: 0, top: 0 }),
        width: () => 400,
      }),
    });
    (button as any).$button[0].click()

    expect(menu.exec).toHaveBeenCalled()
    expect((button as any).$button.find('svg').length).toBe(1)
    expect((button as any).dropPanel.isShow).toBe(true)
    expect((button as any).dropPanel.$elem.css('right')).toBe('0px')

    vi.setSystemTime(new Date('2026-03-23T00:00:00.250Z'));
    (button as any).$button[0].click()

    expect((button as any).dropPanel.isShow).toBe(false)
  })

  test('HoverBar updates state for new selections and skips re-render for the same inline path', async () => {
    vi.useFakeTimers()
    const editor = createEditorStub()
    const hoverBar = new HoverBar()
    const textAreaContainer = document.createElement('div')
    const inlineNode = {
      type: 'link',
      children: [{ text: 'hello' }],
    }
    const textNode = { text: 'hello' }

    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: (elem: HTMLElement) => textAreaContainer.append(elem),
      },
    } as any)
    await flushMicrotasks()

    const hideAndCleanSpy = vi.spyOn(hoverBar, 'hideAndClean')
    const registerItemsSpy = vi.spyOn(hoverBar as any, 'registerItems').mockImplementation(() => {})
    const setPositionSpy = vi.spyOn(hoverBar as any, 'setPosition').mockImplementation(() => {})
    const showSpy = vi.spyOn(hoverBar as any, 'show').mockImplementation(() => {})

    vi.spyOn(Editor, 'isBlock').mockReturnValue(false)
    vi.spyOn(DomEditor, 'findPath').mockReturnValue([0, 0])

    vi.spyOn(hoverBar as any, 'getSelectedNodeAndMenuKeys').mockReturnValue({
      node: textNode,
      menuKeys: ['bold'],
    })
    hoverBar.changeHoverbarState()
    vi.advanceTimersByTime(250)

    expect(hideAndCleanSpy).toHaveBeenCalled()
    expect(registerItemsSpy).toHaveBeenCalledWith(['bold'])
    expect(setPositionSpy).toHaveBeenCalledWith(textNode)
    expect(showSpy).toHaveBeenCalled();
    (hoverBar as any).isShow = true;
    (hoverBar as any).prevSelectedNode = inlineNode
    vi.spyOn(hoverBar as any, 'getSelectedNodeAndMenuKeys').mockReturnValue({
      node: inlineNode,
      menuKeys: ['italic'],
    })

    hoverBar.changeHoverbarState()
    vi.advanceTimersByTime(250)

    expect(registerItemsSpy).toHaveBeenCalledTimes(1)
    expect(showSpy).toHaveBeenCalledTimes(1)

    hoverBar.destroy()
    expect(textAreaContainer.querySelector('.w-e-hover-bar')).toBeNull()
  })

  test('HoverBar hides and deselects when the language listener fires', async () => {
    const editor = createEditorStub()
    const hoverBar = new HoverBar()

    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: vi.fn(),
      },
    } as any)
    await flushMicrotasks();
    (hoverBar as any).menus = { bold: {} };
    (hoverBar as any).hoverbarItems = [{ changeMenuState: vi.fn(), $elem: null, menu: null }]
    i18nChangeLanguage('en')

    expect((hoverBar as any).menus).toEqual({})
    expect(editor.deselect).toHaveBeenCalled()
  })

  test('HoverBar augments text hoverbar config and marks itself as bottom when space is limited', async () => {
    const editor = createEditorStub()

    editor.getConfig = vi.fn(() => ({
      hoverbarKeys: {
        text: { menuKeys: ['bold'] },
      },
    }))

    const hoverBar = new HoverBar()

    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: vi.fn(),
      },
    } as any)
    await flushMicrotasks()

    const hoverbarKeys = (hoverBar as any).getHoverbarKeysConf()
    const rectSpy = vi.spyOn((hoverBar as any).$elem[0], 'getBoundingClientRect').mockReturnValue({
      bottom: window.innerHeight - 10,
    } as DOMRect);

    (hoverBar as any).show()

    expect(typeof hoverbarKeys.text.match).toBe('function')
    expect((hoverBar as any).$elem.hasClass('w-e-bar-bottom')).toBe(true)

    rectSpy.mockRestore()
  })

  test('HoverBar returns null when no selection matches and throws for missing menu factories', async () => {
    const editor = createEditorStub()
    const hoverBar = new HoverBar()

    editor.selection = null
    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: vi.fn(),
      },
    } as any)
    await flushMicrotasks()

    expect((hoverBar as any).getSelectedNodeAndMenuKeys()).toBeNull()

    expect(() => (hoverBar as any).registerSingleItem('missing-menu')).toThrow(
      "Not found menu item factory by key 'missing-menu'",
    )
  })

  test('HoverBar caches created menus and updates icon svg from editor config', async () => {
    const editor = createEditorStub()
    const hoverBar = new HoverBar()
    const factory = vi.fn(() => ({
      title: 'Bold',
      tag: 'button',
      iconSvg: '<svg class="original"></svg>',
      getValue: () => '',
      isActive: () => false,
      isDisabled: () => false,
      exec: vi.fn(),
    }))

    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: vi.fn(),
      },
    } as any)
    editor.getMenuConfig = vi.fn(() => ({ iconSvg: '<svg class="override"></svg>' }))
    MENU_ITEM_FACTORIES.bold = factory as any

    await flushMicrotasks();
    (hoverBar as any).registerSingleItem('bold');
    (hoverBar as any).registerSingleItem('bold')

    expect(factory).toHaveBeenCalledTimes(1)
    expect((hoverBar as any).menus.bold.iconSvg).toContain('override')

    delete MENU_ITEM_FACTORIES.bold
  })

  test('HoverBar matches configured nodes, positions text selections, and cancels pending updates on destroy', async () => {
    vi.useFakeTimers()
    const editor = createEditorStub()
    const hoverBar = new HoverBar()
    const textNode = { text: 'hello' }

    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: vi.fn(),
      },
    } as any)
    await flushMicrotasks()

    editor.getConfig = vi.fn(() => ({
      hoverbarKeys: {
        custom: {
          menuKeys: ['bold'],
          match: (_editor: any, node: any) => Text.isText(node),
        },
      },
    }))
    vi.spyOn(Editor, 'nodes').mockImplementation(() => [[textNode as any, [0, 0]]] as any)

    expect((hoverBar as any).getSelectedNodeAndMenuKeys()).toEqual({
      node: textNode,
      menuKeys: ['bold'],
    })

    const getSelectionPositionSpy = vi.spyOn(positionHelpers, 'getPositionBySelection').mockReturnValue({
      top: '12px',
      left: '24px',
    } as any)
    const correctPositionSpy = vi.spyOn(positionHelpers, 'correctPosition').mockImplementation(() => {});

    (hoverBar as any).setPosition(textNode)

    expect(getSelectionPositionSpy).toHaveBeenCalledWith(editor)
    expect(correctPositionSpy).toHaveBeenCalled()
    expect((hoverBar as any).$elem.css('top')).toBe('12px')
    expect((hoverBar as any).$elem.css('left')).toBe('24px')

    const registerItemsSpy = vi.spyOn(hoverBar as any, 'registerItems').mockImplementation(() => {})
    const setPositionSpy = vi.spyOn(hoverBar as any, 'setPosition').mockImplementation(() => {})
    const showSpy = vi.spyOn(hoverBar as any, 'show').mockImplementation(() => {})

    vi.spyOn(hoverBar as any, 'getSelectedNodeAndMenuKeys').mockReturnValue({
      node: textNode,
      menuKeys: ['bold'],
    })

    hoverBar.changeHoverbarState()
    hoverBar.destroy()
    vi.advanceTimersByTime(250)

    expect(registerItemsSpy).not.toHaveBeenCalled()
    expect(setPositionSpy).not.toHaveBeenCalled()
    expect(showSpy).not.toHaveBeenCalled()
  })

  test('HoverBar uses element positioning and throws for unsupported node shapes', async () => {
    const editor = createEditorStub()
    const hoverBar = new HoverBar()
    const elementNode = { type: 'image', children: [{ text: '' }] }

    HOVER_BAR_TO_EDITOR.set(hoverBar as any, editor)
    vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
      $textAreaContainer: {
        append: vi.fn(),
      },
    } as any)
    await flushMicrotasks()

    const getNodePositionSpy = vi.spyOn(positionHelpers, 'getPositionByNode').mockReturnValue({
      top: '20px',
      left: '40px',
    } as any)

    vi.spyOn(positionHelpers, 'correctPosition').mockImplementation(() => {});
    (hoverBar as any).setPosition(elementNode)

    expect(getNodePositionSpy).toHaveBeenCalledWith(editor, elementNode, 'bar')
    expect((hoverBar as any).$elem.css('top')).toBe('20px')
    expect((hoverBar as any).$elem.css('left')).toBe('40px')

    expect(() => (hoverBar as any).setPosition({ foo: 'bar' })).toThrow(
      'hoverbar.setPosition error, current selected node is not elem nor text',
    )
  })
})
