/**
 * @description render elem
 * @author wangfupeng
 */

import { DomEditor, IDomEditor, SlateElement } from '@wangeditor-next/editor'
import { h, VNode } from 'snabbdom'

import { AttachmentElement } from './custom-types'

function renderAttachment(elem: SlateElement, _children: VNode[] | null, editor: IDomEditor): VNode {
  const isDisabled = editor.isDisabled()
  const selected = DomEditor.isNodeSelected(editor, elem)
  const { fileName = '', link = '' } = elem as AttachmentElement

  const vnode = h(
    'span',
    {
      props: {
        contentEditable: false,
      },
      style: {
        display: 'inline-block',
        marginLeft: '3px',
        marginRight: '3px',
        border: selected && !isDisabled
          ? '2px solid var(--w-e-textarea-selected-border-color)'
          : '2px solid transparent',
        borderRadius: '3px',
        padding: '0 3px',
        backgroundColor: 'var(--w-e-textarea-slight-bg-color)',
        cursor: isDisabled ? 'pointer' : 'inherit',
      },
      on: {
        // disable 时，点击下载附件
        click() {
          if (!isDisabled) { return }
          if (link) {
            window.open(link, '_blank')
          }
        },
      },
    },
    [
      h('span', {
        style: {
          marginRight: '0.2em',
          opacity: '0.7',
        },
      }, 'file'),
      fileName,
    ],
  )

  return vnode
}

const conf = {
  type: 'attachment',
  renderElem: renderAttachment,
}

export default conf
