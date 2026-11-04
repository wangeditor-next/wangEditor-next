import {
  Boot,
  createEditor,
  IDomEditor,
  ISelectMenu,
  SlateTransforms,
} from '@wangeditor-next/editor'

import stylePresetModule, {
  applyStylePreset,
  getActiveStylePreset,
  removeStylePreset,
} from '../src'
import { IStylePreset } from '../src/module/types'

const presets: IStylePreset[] = [
  {
    key: 'muted-text',
    title: 'Muted text',
    scope: 'text',
    className: 'article-muted',
  },
  {
    key: 'lead-paragraph',
    title: 'Lead paragraph',
    scope: 'block',
    className: 'article-lead',
  },
]

Boot.registerModule(stylePresetModule)

function createPresetEditor(
  content?: unknown[],
  textStyleMode: 'inline' | 'class' = 'inline'
): IDomEditor {
  const selector = document.createElement('div')

  document.body.appendChild(selector)
  const editor = createEditor({
    selector,
    content: content as never,
    config: {
      textStyleMode,
      MENU_CONF: {
        stylePreset: { presets },
      },
    },
  })
  const globalScope = globalThis as typeof globalThis & { testEditors?: Set<IDomEditor> }

  globalScope.testEditors ||= new Set()
  globalScope.testEditors.add(editor)
  return editor
}

describe('style preset pipeline', () => {
  it.each(['inline', 'class'] as const)(
    'round-trips rendered text and block presets in %s mode',
    textStyleMode => {
      const editor = createPresetEditor(
        [
          {
            type: 'paragraph',
            stylePreset: 'lead-paragraph',
            children: [{ text: 'Lead ' }, { text: 'note', stylePreset: 'muted-text' }],
          },
        ],
        textStyleMode
      )
      const blockNode = editor.children[0]
      const textNode = blockNode.children[1]
      const renderedBlock = stylePresetModule.renderStyle!(blockNode, { data: {} } as never, editor)
      const renderedText = stylePresetModule.renderStyle!(textNode, { data: {} } as never, editor)
      const html = editor.getHtml()

      expect(renderedBlock).toMatchObject({
        data: {
          class: {
            'article-lead': true,
            'w-e-style-preset-lead-paragraph': true,
          },
          dataset: { wEStylePreset: 'lead-paragraph' },
        },
      })
      expect(renderedText).toMatchObject({
        data: {
          class: {
            'article-muted': true,
            'w-e-style-preset-muted-text': true,
          },
          dataset: { wEStylePreset: 'muted-text' },
        },
      })
      expect(html).toContain('data-w-e-style-preset="lead-paragraph"')
      expect(html).toContain('class="w-e-style-preset-lead-paragraph article-lead"')
      expect(html).toContain('data-w-e-style-preset="muted-text"')
      expect(html).toContain('w-e-style-preset-muted-text article-muted')

      editor.setHtml(html)
      expect(editor.children).toEqual([
        {
          type: 'paragraph',
          stylePreset: 'lead-paragraph',
          children: [{ text: 'Lead ' }, { text: 'note', stylePreset: 'muted-text' }],
        },
      ])
      expect(editor.getHtml()).toBe(html)
    }
  )

  it.each(['inline', 'class'] as const)(
    'parses configured business classes and exports stable data in %s mode',
    textStyleMode => {
      const editor = createPresetEditor(undefined, textStyleMode)

      editor.setHtml('<p class="article-lead">Lead <span class="article-muted">note</span></p>')
      expect(editor.children).toEqual([
        {
          type: 'paragraph',
          stylePreset: 'lead-paragraph',
          children: [{ text: 'Lead ' }, { text: 'note', stylePreset: 'muted-text' }],
        },
      ])

      const html = editor.getHtml()

      expect(html).toContain('data-w-e-style-preset="lead-paragraph"')
      expect(html).toContain('data-w-e-style-preset="muted-text"')

      editor.setHtml(html)
      expect(editor.getHtml()).toBe(html)
    }
  )

  it('preserves unknown data keys for future configuration', () => {
    const editor = createPresetEditor()

    editor.setHtml(
      '<p data-w-e-style-preset="future-block">Future <span data-w-e-style-preset="future-text">text</span></p>'
    )
    expect(editor.children).toEqual([
      {
        type: 'paragraph',
        stylePreset: 'future-block',
        children: [{ text: 'Future ' }, { text: 'text', stylePreset: 'future-text' }],
      },
    ])
    const html = editor.getHtml()

    expect(html).toContain('data-w-e-style-preset="future-block"')
    expect(html).toContain('data-w-e-style-preset="future-text"')
    editor.setHtml(html)
    expect(editor.getHtml()).toBe(html)
  })

  it('applies and removes text and block presets with commands', () => {
    const editor = createPresetEditor([{ type: 'paragraph', children: [{ text: 'hello' }] }])

    SlateTransforms.select(editor, {
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 5 },
    })

    applyStylePreset(editor, 'muted-text')
    expect(getActiveStylePreset(editor)).toBe('muted-text')
    expect(editor.children[0]).toMatchObject({
      children: [{ text: 'hello', stylePreset: 'muted-text' }],
    })

    removeStylePreset(editor, 'text')
    expect(editor.children[0]).toMatchObject({ children: [{ text: 'hello' }] })

    applyStylePreset(editor, 'lead-paragraph')
    expect(editor.children[0]).toMatchObject({ stylePreset: 'lead-paragraph' })
    expect(getActiveStylePreset(editor)).toBe('lead-paragraph')

    removeStylePreset(editor, 'block')
    expect(editor.children[0]).not.toHaveProperty('stylePreset')
  })

  it('rejects applying an unknown preset', () => {
    const editor = createPresetEditor([{ type: 'paragraph', children: [{ text: 'hello' }] }])

    SlateTransforms.select(editor, { path: [0, 0], offset: 0 })
    expect(() => applyStylePreset(editor, 'missing')).toThrow('Unknown style preset')
  })

  it('exposes configured presets through the opt-in toolbar menu', () => {
    const editor = createPresetEditor([{ type: 'paragraph', children: [{ text: 'hello' }] }])
    const menu = stylePresetModule.menus![0].factory() as ISelectMenu

    SlateTransforms.select(editor, { path: [0, 0], offset: 0 })

    expect(menu.isDisabled(editor)).toBe(false)
    expect(menu.getOptions(editor).map(option => option.value)).toEqual([
      '',
      'muted-text',
      'lead-paragraph',
    ])

    menu.exec(editor, 'lead-paragraph')
    expect(editor.children[0]).toMatchObject({ stylePreset: 'lead-paragraph' })

    menu.exec(editor, '')
    expect(editor.children[0]).not.toHaveProperty('stylePreset')
  })
})
