import { Editor, Toolbar } from '../src'

describe('editor-for-react exports', () => {
  it('exports components', () => {
    expect(typeof Editor).toBe('function')
    expect(typeof Toolbar).toBe('function')
  })
})
