import '../src/register-custom-elem'

describe('plugin-formula custom element', () => {
  it('renders htmlAndMathml output and keeps stretchy absolute delimiters', () => {
    const elem = document.createElement('w-e-formula-card')
    const formula = String.raw`\left|-2\frac{4}{7}\right|`

    elem.setAttribute('data-value', formula)
    document.body.appendChild(elem)

    expect(elem.shadowRoot).toBeNull()
    expect(elem.querySelector('.katex')).not.toBeNull()
    expect(elem.querySelector('.katex-html')).not.toBeNull()
    expect(elem.querySelector('.katex-html .delimsizing.mult')).not.toBeNull()

    elem.remove()
  })

  it('wraps formula parse errors within the card width', () => {
    const elem = document.createElement('w-e-formula-card')

    elem.setAttribute('data-value', String.raw`\left`)
    document.body.appendChild(elem)

    const contentElem = elem.firstElementChild as HTMLElement
    const errorElem = elem.querySelector('.katex-error') as HTMLElement

    expect(elem.style.display).toBe('inline-block')
    expect(elem.style.maxWidth).toBe('100%')
    expect(contentElem.style.maxWidth).toBe('100%')
    expect(errorElem.style.whiteSpace).toBe('normal')
    expect(errorElem.style.overflowWrap).toBe('anywhere')
    expect(errorElem.style.wordBreak).toBe('break-word')

    elem.remove()
  })
})
