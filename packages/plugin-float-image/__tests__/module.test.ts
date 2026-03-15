import module from '../src'

describe('plugin-float-image module', () => {
  it('exposes module config', () => {
    expect(module).toBeTruthy()
    expect(module.renderElems?.length).toBeGreaterThan(0)
    expect(module.elemsToHtml?.length).toBeGreaterThan(0)
    expect(module.parseElemsHtml?.length).toBeGreaterThan(0)
    expect(module.menus?.length).toBeGreaterThan(0)
  })
})
