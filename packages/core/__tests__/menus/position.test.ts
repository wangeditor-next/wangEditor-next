/**
 * @description menu position helpers test
 */

import { Range } from 'slate'
import {
  afterEach, describe, expect, it, vi,
} from 'vitest'

import { DomEditor } from '../../src/editor/dom-editor'
import { IDomEditor } from '../../src/editor/interface'
import { correctPosition, getPositionByNode, getPositionBySelection } from '../../src/menus/helpers/position'
import { NODE_TO_ELEMENT } from '../../src/utils/weak-maps'

const createSelection = (): Range => ({
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 0 },
})

const createRect = (options: {
  top: number
  left: number
  height?: number
  width?: number
}): DOMRect => {
  const height = options.height ?? 10
  const width = options.width ?? 10

  return {
    top: options.top,
    left: options.left,
    height,
    width,
    bottom: options.top + height,
    right: options.left + width,
  } as DOMRect
}

const mockTextContainer = (rect: { top: number; left: number; width: number; height: number }) => {
  vi.spyOn(DomEditor, 'getTextarea').mockReturnValue({
    $textAreaContainer: {
      width: () => rect.width,
      height: () => rect.height,
      offset: () => ({ top: rect.top, left: rect.left }),
    },
  } as any)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('menu position helpers', () => {
  it('getPositionBySelection returns default when selection is null', () => {
    const editor = { selection: null } as IDomEditor

    expect(getPositionBySelection(editor)).toEqual({ top: '0', left: '0' })
  })

  it('getPositionBySelection returns left/top when selection is in top-left', () => {
    const editor = { selection: createSelection() } as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 200,
      height: 100,
    })

    const rects = [createRect({ top: 30, left: 40, height: 10 })]

    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue({
      getClientRects: () => rects,
    } as any)

    expect(getPositionBySelection(editor)).toEqual({
      left: '25px',
      top: '35px',
    })
  })

  it('getPositionBySelection returns right/bottom when selection is in bottom-right', () => {
    const editor = { selection: createSelection() } as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 200,
      height: 100,
    })

    const rects = [createRect({ top: 80, left: 180, height: 10 })]

    vi.spyOn(DomEditor, 'toDOMRange').mockReturnValue({
      getClientRects: () => rects,
    } as any)

    expect(getPositionBySelection(editor)).toEqual({
      right: '45px',
      bottom: '35px',
    })
  })

  it('getPositionByNode returns bar position', () => {
    const editor = {
      selection: createSelection(),
      isVoid: () => false,
      isInline: () => false,
    } as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 200,
      height: 100,
    })

    const node = { type: 'paragraph', children: [{ text: 'hello' }] }
    const elem = {
      getBoundingClientRect: () => ({
        top: 80,
        left: 30,
        height: 20,
        width: 50,
      }),
    }

    NODE_TO_ELEMENT.set(node as any, elem as any)

    const res = getPositionByNode(editor, node as any, 'bar')

    expect(res).toEqual({
      left: '10px',
      bottom: '35px',
    })

    NODE_TO_ELEMENT.delete(node as any)
  })

  it('getPositionByNode returns modal position for inline void node', () => {
    const editor = {
      selection: createSelection(),
      isVoid: () => true,
      isInline: () => true,
    } as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 200,
      height: 100,
    })

    const node = { type: 'void', children: [{ text: '' }] }
    const elem = {
      getBoundingClientRect: () => ({
        top: 25,
        left: 160,
        height: 10,
        width: 30,
      }),
    }

    NODE_TO_ELEMENT.set(node as any, elem as any)

    const res = getPositionByNode(editor, node as any, 'modal')

    expect(res).toEqual({
      right: '65px',
      top: '15px',
    })

    NODE_TO_ELEMENT.delete(node as any)
  })

  it('getPositionByNode returns modal position for non-void node in lower half', () => {
    const editor = {
      selection: createSelection(),
      isVoid: () => false,
      isInline: () => false,
    } as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 200,
      height: 100,
    })

    const node = { type: 'paragraph', children: [{ text: 'hello' }] }
    const elem = {
      getBoundingClientRect: () => ({
        top: 90,
        left: 40,
        height: 20,
        width: 30,
      }),
    }

    NODE_TO_ELEMENT.set(node as any, elem as any)

    const res = getPositionByNode(editor, node as any, 'modal')

    expect(res).toEqual({
      left: '20px',
      bottom: '25px',
    })

    NODE_TO_ELEMENT.delete(node as any)
  })

  it('correctPosition adjusts top and left to stay in container', async () => {
    const editor = {} as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 100,
      height: 100,
    })

    const styleStore: Record<string, string> = {
      top: '90px',
      left: '90px',
    }

    const positionElem = {
      offset: () => ({ top: 100, left: 120 }),
      width: () => 30,
      height: () => 20,
      attr: () => 'top: 90px; left: 90px;',
      css: (prop: string, value?: string) => {
        if (value !== undefined) {
          styleStore[prop] = value
          return undefined
        }
        return styleStore[prop]
      },
    } as any

    correctPosition(editor, positionElem)
    await Promise.resolve()

    expect(styleStore.top).toBe('80px')
    expect(styleStore.left).toBe('60px')
  })

  it('correctPosition adjusts bottom and right when element is out of bounds', async () => {
    const editor = {} as IDomEditor

    mockTextContainer({
      top: 10,
      left: 20,
      width: 100,
      height: 100,
    })

    const styleStore: Record<string, string> = {
      bottom: '10px',
      right: '10px',
    }

    const positionElem = {
      offset: () => ({ top: -10, left: -5 }),
      width: () => 30,
      height: () => 20,
      attr: () => 'bottom: 10px; right: 10px;',
      css: (prop: string, value?: string) => {
        if (value !== undefined) {
          styleStore[prop] = value
          return undefined
        }
        return styleStore[prop]
      },
    } as any

    correctPosition(editor, positionElem)
    await Promise.resolve()

    expect(styleStore.bottom).toBe('0px')
    expect(styleStore.right).toBe('5px')
  })
})
