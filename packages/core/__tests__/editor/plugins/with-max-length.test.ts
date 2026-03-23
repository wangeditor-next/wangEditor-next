import { DomEditor } from '../../../src'
import { withMaxLength } from '../../../src/editor/plugins/with-max-length'

describe('withMaxLength', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('insertNode stops when the node text exceeds the remaining length', () => {
    const baseInsertNode = vi.fn()
    const editor = withMaxLength({
      insertText: vi.fn(),
      insertNode: baseInsertNode,
      insertFragment: vi.fn(),
      dangerouslyInsertHtml: vi.fn(),
      getConfig: () => ({ maxLength: 5 }),
    } as any)

    vi.spyOn(DomEditor, 'getLeftLengthOfMaxLength').mockReturnValue(2)

    editor.insertNode({
      type: 'paragraph',
      children: [{ text: 'toolong' }],
    })

    expect(baseInsertNode).not.toHaveBeenCalled()
  })

  test('insertFragment inserts the first node and delegates the rest through insertNode', () => {
    const baseInsertNode = vi.fn()
    const baseInsertFragment = vi.fn()
    const editor = withMaxLength({
      insertText: vi.fn(),
      insertNode: baseInsertNode,
      insertFragment: baseInsertFragment,
      dangerouslyInsertHtml: vi.fn(),
      getConfig: () => ({ maxLength: 10 }),
    } as any)
    const fragment = [
      { type: 'paragraph', children: [{ text: 'ab' }] },
      { type: 'paragraph', children: [{ text: 'cd' }] },
    ]
    const leftLengthSpy = vi.spyOn(DomEditor, 'getLeftLengthOfMaxLength')

    leftLengthSpy.mockReturnValueOnce(10).mockReturnValueOnce(8)

    editor.insertFragment(fragment)

    expect(baseInsertFragment).toHaveBeenCalledWith([fragment[0]])
    expect(baseInsertNode).toHaveBeenCalledWith(fragment[1])
  })

  test('insertFragment ignores the first node when it already exceeds maxLength', () => {
    const baseInsertNode = vi.fn()
    const baseInsertFragment = vi.fn()
    const editor = withMaxLength({
      insertText: vi.fn(),
      insertNode: baseInsertNode,
      insertFragment: baseInsertFragment,
      dangerouslyInsertHtml: vi.fn(),
      getConfig: () => ({ maxLength: 3 }),
    } as any)

    vi.spyOn(DomEditor, 'getLeftLengthOfMaxLength').mockReturnValue(2)

    editor.insertFragment([
      { type: 'paragraph', children: [{ text: 'abcd' }] },
      { type: 'paragraph', children: [{ text: 'ef' }] },
    ])

    expect(baseInsertFragment).not.toHaveBeenCalled()
    expect(baseInsertNode).not.toHaveBeenCalled()
  })

  test('dangerouslyInsertHtml truncates nested html and removes ignored tags', () => {
    const baseInsertHtml = vi.fn()
    const editor = withMaxLength({
      insertText: vi.fn(),
      insertNode: vi.fn(),
      insertFragment: vi.fn(),
      dangerouslyInsertHtml: baseInsertHtml,
      getConfig: () => ({ maxLength: 3 }),
    } as any)

    vi.spyOn(DomEditor, 'getLeftLengthOfMaxLength').mockReturnValue(3)

    editor.dangerouslyInsertHtml('<p>ab</p><script>alert(1)</script><p><span>cd</span></p>')

    expect(baseInsertHtml).toHaveBeenCalledWith('<p>ab</p><p><span>c</span></p>', false)
  })
})
