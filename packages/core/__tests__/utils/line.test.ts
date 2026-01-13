/**
 * @description line utils test
 */

import { Range } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../src/editor/dom-editor'
import { findCurrentLineRange } from '../../src/utils/line'
import createCoreEditor from '../create-core-editor'

const createRange = (
  anchorPath: number[],
  anchorOffset: number,
  focusPath: number[],
  focusOffset: number,
): Range => ({
  anchor: { path: anchorPath, offset: anchorOffset },
  focus: { path: focusPath, offset: focusOffset },
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('line utils', () => {
  it('finds the range within a single line', () => {
    const editor = createCoreEditor({
      content: [
        { type: 'paragraph', children: [{ text: 'hello' }] },
      ],
    })

    const parentRange = createRange([0, 0], 0, [0, 0], 3)

    vi.spyOn(DomEditor, 'toDOMRange').mockImplementation((domEditor, range) => {
      const line = Range.start(range).path[0]
      const top = line * 20

      return {
        getBoundingClientRect: () => ({
          top,
          bottom: top + 20,
        }),
      } as any
    })

    const result = findCurrentLineRange(editor, parentRange)

    expect(Range.start(result).path[0]).toBe(0)
    expect(Range.end(result)).toEqual(Range.end(parentRange))
  })

  it('finds the end line range for multi-line selection', () => {
    const editor = createCoreEditor({
      content: [
        { type: 'paragraph', children: [{ text: 'hello' }] },
        { type: 'paragraph', children: [{ text: 'world' }] },
      ],
    })

    const parentRange = createRange([0, 0], 0, [1, 0], 5)

    vi.spyOn(DomEditor, 'toDOMRange').mockImplementation((domEditor, range) => {
      const line = Range.start(range).path[0]
      const top = line * 20

      return {
        getBoundingClientRect: () => ({
          top,
          bottom: top + 20,
        }),
      } as any
    })

    const result = findCurrentLineRange(editor, parentRange)

    expect(Range.start(result).path[0]).toBe(1)
    expect(Range.end(result)).toEqual(Range.end(parentRange))
  })
})
