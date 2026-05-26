import module from '../src'

describe('plugin-ctrl-enter module', () => {
  it('exposes module config', () => {
    expect(module).toBeTruthy()
    expect(typeof module.editorPlugin).toBe('function')
  })
})
