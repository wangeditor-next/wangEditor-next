import module from '../src'

describe('plugin-html-source module', () => {
  it('exposes the edit html source menu', () => {
    expect(module.menus).toHaveLength(1)
    expect(module.menus?.[0].key).toBe('editHtmlSource')
    expect(typeof module.menus?.[0].factory).toBe('function')
  })
})
