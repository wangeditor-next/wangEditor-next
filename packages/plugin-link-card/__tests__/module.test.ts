import module from '../src'

describe('plugin-link-card module', () => {
  it('exposes module config', () => {
    expect(module).toBeTruthy()
    expect(typeof module.editorPlugin).toBe('function')
    expect(module.renderElems?.length).toBeGreaterThan(0)
    expect(module.elemsToHtml?.length).toBeGreaterThan(0)
    expect(module.parseElemsHtml?.length).toBeGreaterThan(0)
    expect(module.menus?.length).toBeGreaterThan(0)
  })
})
