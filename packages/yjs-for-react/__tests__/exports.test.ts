import {
  getCursorRange,
  useEditorStatic,
  useRemoteCursorOverlayPositions,
  useRemoteCursorStates,
  useRemoteCursorStatesSelector,
} from '../src'

describe('yjs-for-react exports', () => {
  it('exports hooks and helpers', () => {
    expect(typeof getCursorRange).toBe('function')
    expect(typeof useEditorStatic).toBe('function')
    expect(typeof useRemoteCursorOverlayPositions).toBe('function')
    expect(typeof useRemoteCursorStates).toBe('function')
    expect(typeof useRemoteCursorStatesSelector).toBe('function')
  })
})
