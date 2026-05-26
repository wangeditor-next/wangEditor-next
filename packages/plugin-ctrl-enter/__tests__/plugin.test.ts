import createEditor from '../../../tests/utils/create-editor'
import withCtrlEnter from '../src/module/plugin'

describe('plugin-ctrl-enter', () => {
  afterEach(() => {
    delete (window as any).event
  })

  it('allows insertBreak only when ctrl/cmd is pressed', () => {
    const editor = createEditor()
    const originInsertBreak = vi.fn()

    editor.insertBreak = originInsertBreak as any

    const newEditor = withCtrlEnter(editor)

    Object.defineProperty(window, 'event', {
      configurable: true,
      value: {
        ctrlKey: false,
        metaKey: false,
      },
    })
    newEditor.insertBreak()

    expect(originInsertBreak).not.toHaveBeenCalled()

    Object.defineProperty(window, 'event', {
      configurable: true,
      value: {
        ctrlKey: true,
        metaKey: false,
      },
    })
    newEditor.insertBreak()

    expect(originInsertBreak).toHaveBeenCalledTimes(1)
  })
})
