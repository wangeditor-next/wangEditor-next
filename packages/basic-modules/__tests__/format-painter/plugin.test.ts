import createEditor from '../../../../tests/utils/create-editor'
import FormatPainter from '../../src/modules/format-painter/menu/FormatPainter'
import withFormatPainter from '../../src/modules/format-painter/plugin'

describe('format painter plugin', () => {
  let editor: any

  beforeEach(() => {
    editor = withFormatPainter(createEditor(
      { content: [{ type: 'paragraph', children: [{ text: 'Hello World' }] }] },
    ))

    vi.spyOn(document, 'addEventListener')
    vi.spyOn(document, 'removeEventListener')

    editor.focus()
    editor.select({
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
    FormatPainter.attrs.isSelect = false
    FormatPainter.attrs.formatStyle = null
    FormatPainter.attrs.formatBlockStyle = null
  })

  it('format painter change', () => {
    // 模拟 FormatPainter 处于活动状态
    FormatPainter.attrs.isSelect = true

    // 监控静态方法 setFormatHtml
    const setFormatHtmlSpy = vi.spyOn(FormatPainter.prototype, 'setFormatHtml')

    // 模拟 onChange 的调用
    editor.onChange()

    // 检查是否绑定了 mouseup 事件
    expect(document.addEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))

    // 创建并触发 mouseup 事件
    const mouseUpEvent = new MouseEvent('mouseup', {
      bubbles: true,
      cancelable: true,
    })

    document.dispatchEvent(mouseUpEvent)

    // 验证 setFormatHtml 是否被调用
    expect(setFormatHtmlSpy).toHaveBeenCalledWith(editor)

    // 检查是否解绑了 mouseup 事件
    expect(document.removeEventListener).toHaveBeenCalledWith('mouseup', expect.any(Function))
  })
})
