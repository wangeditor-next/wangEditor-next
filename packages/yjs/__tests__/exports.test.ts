import {
  slateNodesToInsertDelta,
  withCursors,
  withYHistory,
  withYjs,
  yTextToSlateElement,
} from '../src'

describe('yjs exports', () => {
  it('exports core helpers', () => {
    expect(typeof withCursors).toBe('function')
    expect(typeof withYHistory).toBe('function')
    expect(typeof withYjs).toBe('function')
    expect(typeof slateNodesToInsertDelta).toBe('function')
    expect(typeof yTextToSlateElement).toBe('function')
  })
})
