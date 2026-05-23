/**
 * @description code-block render elem test
 * @author wangfupeng
 */

import createEditor from '../../../../tests/utils/create-editor'
import { renderCodeConf, renderPreConf } from '../../src/modules/code-block/render-elem'

describe('code-block render elem', () => {
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor()
  })

  it('render code elem', () => {
    expect(renderCodeConf.type).toBe('code')

    const elem = { type: 'code', children: [], language: '' }
    const vnode = renderCodeConf.renderElem(elem, null, editor)

    expect(vnode.sel).toBe('code')
  })

  it('render pre elem', () => {
    expect(renderPreConf.type).toBe('pre')

    const elem = { type: 'pre', children: [] }
    const vnode = renderPreConf.renderElem(elem, null, editor)

    expect(vnode.sel).toBe('pre')
  })

  it('render pre elem should include copy button when enabled by config', () => {
    const editorWithCopyButton = createEditor({
      config: {
        MENU_CONF: {
          codeBlock: {
            showCopyButton: true,
          },
        },
      },
    })

    const elem = {
      type: 'pre',
      children: [
        {
          type: 'code',
          language: '',
          children: [{ text: 'const a = 1' }],
        },
      ],
    }
    const vnode = renderPreConf.renderElem(elem, null, editorWithCopyButton) as any
    const buttonVNode = vnode.children?.[0]

    expect(vnode.sel).toBe('pre')
    expect(vnode.data?.className).toBe('w-e-code-block')
    expect(buttonVNode.sel).toBe('button')
    expect(buttonVNode.data?.className).toBe('w-e-code-block-copy-button')
  })
})
