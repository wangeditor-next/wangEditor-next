/**
 * @description outline numbering marker actions
 */

import { DomEditor, EditorEvents, IDomEditor, t } from '@wangeditor-next/core'
import { Transforms } from 'slate'

import { ListItemElement } from './custom-types'

type OutlineActionPanel = {
  elem: HTMLElement
  dispose: () => void
}

const PANEL_BY_EDITOR = new WeakMap<IDomEditor, OutlineActionPanel>()

function updateRestart(editor: IDomEditor, node: ListItemElement, restart?: number) {
  const index = editor.children.indexOf(node)

  if (index < 0) {
    return
  }

  Transforms.setNodes(editor, { listRestart: restart }, { at: [index] })
}

export function continueOutlineNumbering(editor: IDomEditor, node: ListItemElement) {
  updateRestart(editor, node)
}

export function restartOutlineNumbering(editor: IDomEditor, node: ListItemElement) {
  updateRestart(editor, node, 1)
}

export function hideOutlineActionPanel(editor: IDomEditor) {
  const panel = PANEL_BY_EDITOR.get(editor)

  if (panel == null) {
    return
  }
  panel.dispose()
  PANEL_BY_EDITOR.delete(editor)
}

function createActionButton(
  document: Document,
  label: string,
  onClick: () => void
): HTMLButtonElement {
  const button = document.createElement('button')

  button.type = 'button'
  button.className = 'w-e-list-outline-action'
  button.textContent = label
  button.addEventListener('mousedown', event => event.preventDefault())
  button.addEventListener('click', event => {
    event.preventDefault()
    event.stopPropagation()
    onClick()
  })

  return button
}

export function showOutlineActionPanel(editor: IDomEditor, node: ListItemElement, marker: HTMLElement) {
  if (editor.isDisabled()) {
    return
  }

  hideOutlineActionPanel(editor)

  const document = marker.ownerDocument
  const panel = document.createElement('div')

  panel.className = 'w-e-list-outline-actions'
  panel.setAttribute('role', 'menu')
  panel.addEventListener('mousedown', event => event.preventDefault())
  panel.append(
    createActionButton(document, t('listModule.continueNumbering'), () => {
      continueOutlineNumbering(editor, node)
      hideOutlineActionPanel(editor)
    }),
    createActionButton(document, t('listModule.restartNumbering'), () => {
      restartOutlineNumbering(editor, node)
      hideOutlineActionPanel(editor)
    })
  )

  const textarea = DomEditor.getTextarea(editor)
  const container = textarea.$textAreaContainer[0] as HTMLElement
  const scroll = textarea.$scroll[0] as HTMLElement
  const markerRect = marker.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  panel.style.top = `${markerRect.bottom - containerRect.top + scroll.scrollTop + 4}px`
  panel.style.left = `${markerRect.left - containerRect.left + scroll.scrollLeft}px`
  container.append(panel)

  const onDocumentMouseDown = (event: MouseEvent) => {
    const target = event.target

    if (!(target instanceof Node)) {
      return
    }
    if (panel.contains(target) || marker.contains(target)) {
      return
    }

    hideOutlineActionPanel(editor)
  }
  const onEditorChange = () => hideOutlineActionPanel(editor)
  const onEditorDestroyed = () => hideOutlineActionPanel(editor)

  document.addEventListener('mousedown', onDocumentMouseDown, true)
  editor.on(EditorEvents.CHANGE, onEditorChange)
  editor.on(EditorEvents.DESTROYED, onEditorDestroyed)

  PANEL_BY_EDITOR.set(editor, {
    elem: panel,
    dispose: () => {
      document.removeEventListener('mousedown', onDocumentMouseDown, true)
      editor.off(EditorEvents.CHANGE, onEditorChange)
      editor.off(EditorEvents.DESTROYED, onEditorDestroyed)
      panel.remove()
    },
  })
}
