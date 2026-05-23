/**
 * @description render elem
 * @author wangfupeng
 */

import { IDomEditor, t } from '@wangeditor-next/core'
import { Element as SlateElement } from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

import { CodeElement, PreElement } from './custom-types'

function getCodeText(elemNode: SlateElement): string {
  const { children = [] } = elemNode as PreElement

  return (children as CodeElement[])
    .map(codeElem => {
      const codeTextChildren = codeElem.children || []

      return codeTextChildren.map(textNode => textNode.text || '').join('')
    })
    .join('\n')
}

function copyWithExecCommand(text: string): boolean {
  const textarea = document.createElement('textarea')

  textarea.value = text
  textarea.setAttribute('readonly', 'readonly')
  textarea.style.position = 'fixed'
  textarea.style.top = '-9999px'
  textarea.style.left = '-9999px'
  document.body.appendChild(textarea)
  textarea.select()
  textarea.setSelectionRange(0, textarea.value.length)
  const copied = document.execCommand('copy')

  document.body.removeChild(textarea)
  return copied
}

async function copyCodeText(text: string): Promise<boolean> {
  if (text === '') { return true }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch (err) {
    // ignore
  }

  try {
    return copyWithExecCommand(text)
  } catch (err) {
    return false
  }
}

function setButtonText(buttonElem: HTMLButtonElement, text: string, defaultText: string) {
  const timerId = Number(buttonElem.dataset.copyResetTimer || 0)

  if (timerId) {
    window.clearTimeout(timerId)
  }

  buttonElem.textContent = text
  const resetTimerId = window.setTimeout(() => {
    buttonElem.textContent = defaultText
    delete buttonElem.dataset.copyResetTimer
  }, 1200)

  buttonElem.dataset.copyResetTimer = `${resetTimerId}`
}

function renderPre(elemNode: SlateElement, children: VNode[] | null, editor: IDomEditor): VNode {
  const { showCopyButton = false } = editor.getMenuConfig('codeBlock') || {}

  if (!showCopyButton) {
    return <pre>{children}</pre>
  }

  const codeText = getCodeText(elemNode)
  const copyText = t('codeBlock.copy')
  const copiedText = t('codeBlock.copied')
  const copyFailedText = t('codeBlock.copyFailed')
  const vnode = (
    <pre className="w-e-code-block">
      <button
        className="w-e-code-block-copy-button"
        contentEditable={false}
        on={{
          mousedown: (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
          },
          click: async (e: MouseEvent) => {
            e.preventDefault()
            e.stopPropagation()
            const buttonElem = (e.currentTarget || e.target) as HTMLButtonElement | null

            if (buttonElem == null) { return }
            const copied = await copyCodeText(codeText)

            setButtonText(buttonElem, copied ? copiedText : copyFailedText, copyText)
          },
        }}
      >
        {copyText}
      </button>
      {children}
    </pre>
  )

  return vnode
}

function renderCode(_elemNode: SlateElement, children: VNode[] | null, _editor: IDomEditor): VNode {
  // 和 basic/simple-style module 的“行内代码”并不冲突。一个是根据 mark 渲染，一个是根据 node.type 渲染
  const vnode = <code>{children}</code>

  return vnode
}

export const renderPreConf = {
  type: 'pre',
  renderElem: renderPre,
}

export const renderCodeConf = {
  type: 'code',
  renderElem: renderCode,
}
