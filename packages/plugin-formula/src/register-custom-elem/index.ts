/**
 * @description 注册自定义 elem
 * @author wangfupeng
 */

import './native-shim'

import katex from 'katex'

class WangEditorFormulaCard extends HTMLElement {
  private span: HTMLElement | null = null

  // 监听的 attr
  static get observedAttributes() {
    return ['data-value']
  }

  constructor() {
    super()
  }

  // connectedCallback() {
  //     // 当 custom element首次被插入文档DOM时，被调用
  //     console.log('connected')
  // }
  // disconnectedCallback() {
  //     // 当 custom element从文档DOM中删除时，被调用
  //     console.log('disconnected')
  // }
  // adoptedCallback() {
  //     // 当 custom element被移动到新的文档时，被调用
  //     console.log('adopted')
  // }
  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (name === 'data-value') {
      if (oldValue === newValue) { return }
      this.render(newValue || '')
    }
  }

  private ensureSpan() {
    if (this.span) { return this.span }

    const document = this.ownerDocument || window.document
    const span = document.createElement('span')

    span.style.display = 'inline-block'
    this.appendChild(span)
    this.span = span

    return span
  }

  private render(value: string) {
    const span = this.ensureSpan()

    katex.render(value, span, {
      throwOnError: false,
      output: 'htmlAndMathml',
    })
  }
}

if (!window.customElements.get('w-e-formula-card')) {
  window.customElements.define('w-e-formula-card', WangEditorFormulaCard)
}
