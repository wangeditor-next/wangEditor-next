import {
  getCursorRange,
  provideEditor,
  useEditorStatic,
  useRemoteCursorOverlayPositions,
  useRemoteCursorStates,
} from '../src'

describe('yjs-for-vue exports', () => {
  it('exports hooks and helpers', () => {
    expect(typeof getCursorRange).toBe('function')
    expect(typeof provideEditor).toBe('function')
    expect(typeof useEditorStatic).toBe('function')
    expect(typeof useRemoteCursorOverlayPositions).toBe('function')
    expect(typeof useRemoteCursorStates).toBe('function')
  })
})
