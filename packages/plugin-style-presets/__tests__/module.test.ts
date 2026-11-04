import module from '../src'

describe('plugin-style-presets module', () => {
  it('exposes the complete style pipeline', () => {
    expect(module.menus?.length).toBe(1)
    expect(typeof module.renderStyle).toBe('function')
    expect(typeof module.styleToHtml).toBe('function')
    expect(typeof module.parseStyleHtml).toBe('function')
  })
})
