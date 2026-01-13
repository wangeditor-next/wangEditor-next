/**
 * @description click handler test
 */

import {
  Editor, Node, Path, Transforms,
} from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../../src/editor/dom-editor'
import handleOnClick from '../../../src/text-area/event-handlers/click'
import * as helpers from '../../../src/text-area/helpers'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('handleOnClick', () => {
  it('selects void node range', () => {
    const editor = {
      getConfig: () => ({ readOnly: false }),
    } as any
    const target = document.createElement('div')
    const event = { target } as any

    const node = { type: 'void', children: [{ text: '' }] }
    const path = [0, 0]
    const point = { path: [0, 0], offset: 0 }
    const voidEntry = [node, path] as any

    vi.spyOn(helpers, 'hasTarget').mockReturnValue(true)
    vi.spyOn(DomEditor, 'toSlateNode').mockReturnValue(node as any)
    vi.spyOn(DomEditor, 'findPath').mockReturnValue(path as any)
    vi.spyOn(Editor, 'hasPath').mockReturnValue(true)
    vi.spyOn(Node, 'get').mockReturnValue(node as any)
    vi.spyOn(Editor, 'start').mockReturnValue(point as any)
    vi.spyOn(Editor, 'end').mockReturnValue(point as any)
    vi.spyOn(Editor, 'void').mockReturnValue(voidEntry)
    vi.spyOn(Path, 'equals').mockReturnValue(true)
    vi.spyOn(Transforms, 'select').mockImplementation(() => {})

    handleOnClick(event, {} as any, editor)

    expect(Transforms.select).toHaveBeenCalled()
  })
})
