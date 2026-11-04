/**
 * @description serialize style presets
 */

import { IDomEditor, SlateDescendant, SlateText } from '@wangeditor-next/editor'

import { addPresetToElement, getNodeStylePreset } from './helpers'

function createTextRoot(html: string): HTMLElement {
  const container = document.createElement('div')

  container.innerHTML = html

  if (container.childNodes.length === 1) {
    const child = container.firstElementChild

    if (child?.tagName === 'SPAN') {
      return child as HTMLElement
    }
  }

  const span = document.createElement('span')

  span.innerHTML = html
  return span
}

function createElementRoot(html: string): HTMLElement | null {
  const container = document.createElement('div')

  container.innerHTML = html
  return container.firstElementChild as HTMLElement | null
}

export function styleToHtml(node: SlateDescendant, html: string, editor?: IDomEditor): string {
  const key = getNodeStylePreset(node)

  if (!key || !editor || !html) {
    return html
  }

  const root = SlateText.isText(node) ? createTextRoot(html) : createElementRoot(html)

  if (!root) {
    return html
  }

  addPresetToElement(root, editor, key)
  return root.outerHTML
}
