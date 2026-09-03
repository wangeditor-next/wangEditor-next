import { Descendant } from 'slate'

import { initializeContent } from '../../src/create/helper'
import { IDomEditor } from '../../src/editor/interface'

describe('initializeContent', () => {
  test('applies a module transform before assigning initial content', () => {
    const content: Descendant[] = [{ type: 'paragraph', children: [{ text: 'before' }] }]
    const transformed: Descendant[] = [{ type: 'paragraph', children: [{ text: 'after' }] }]
    const transformInitialContent = vi.fn(() => transformed)
    const editor = {
      children: [],
      transformInitialContent,
    } as unknown as IDomEditor

    initializeContent(editor, { content })

    expect(transformInitialContent).toHaveBeenCalledWith(content)
    expect(editor.children).toBe(transformed)
  })
})
