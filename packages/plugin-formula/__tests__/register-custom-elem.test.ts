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
})
