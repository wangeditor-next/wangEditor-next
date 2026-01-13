import module from '../src'

describe('plugin-mention module', () => {
  it('exposes module config', () => {
    expect(module).toBeTruthy()
    expect(typeof module.editorPlugin).toBe('function')
    expect(module.renderElems?.length).toBeGreaterThan(0)
    expect(module.elemsToHtml?.length).toBeGreaterThan(0)
    expect(module.parseElemsHtml?.length).toBeGreaterThan(0)
  })
})
