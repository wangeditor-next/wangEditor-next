import { IDomEditor } from '@wangeditor-next/editor'

import { getStylePresetConfig } from '../src/module/config'

function createEditorWithConfig(config: unknown): IDomEditor {
  return {
    getMenuConfig: () => config,
  } as unknown as IDomEditor
}

describe('style preset config', () => {
  it('defaults to an empty preset list', () => {
    expect(getStylePresetConfig(createEditorWithConfig({}))).toEqual({ presets: [] })
  })

  it('accepts valid text and block presets', () => {
    const presets = [
      { key: 'muted-text', title: 'Muted text', scope: 'text' as const },
      {
        key: 'lead-paragraph',
        title: 'Lead paragraph',
        scope: 'block' as const,
        className: 'article-lead theme-readable',
      },
    ]

    expect(getStylePresetConfig(createEditorWithConfig({ presets }))).toEqual({ presets })
  })

  it('treats a whitespace-only class name as an omitted class mapping', () => {
    const presets = [
      {
        key: 'generated-class',
        title: 'Generated class',
        scope: 'text' as const,
        className: '   ',
      },
      {
        key: 'business-class',
        title: 'Business class',
        scope: 'text' as const,
        className: 'article-text',
      },
    ]

    expect(getStylePresetConfig(createEditorWithConfig({ presets }))).toEqual({ presets })
  })

  it('caches validated config for the same preset array', () => {
    const presets = [{ key: 'muted-text', title: 'Muted text', scope: 'text' as const }]
    const editor = createEditorWithConfig({ presets })
    const firstConfig = getStylePresetConfig(editor)

    expect(getStylePresetConfig(editor)).toBe(firstConfig)
  })

  it.each([
    [{ key: 'Invalid Key', title: 'Bad', scope: 'text' }],
    [{ key: 'valid', title: '', scope: 'text' }],
    [{ key: 'valid', title: '   ', scope: 'text' }],
    [{ key: 'valid', title: 'Bad', scope: 'other' }],
    [
      { key: 'valid', title: 'One', scope: 'text' },
      { key: 'valid', title: 'Two', scope: 'block' },
    ],
    [{ key: 'valid', title: 'Bad class', scope: 'text', className: 'bad.class' }],
    [
      { key: 'one', title: 'One', scope: 'text', className: 'same-class' },
      { key: 'two', title: 'Two', scope: 'text', className: 'same-class' },
    ],
    [
      { key: 'one', title: 'One', scope: 'block', className: 'article-style' },
      { key: 'two', title: 'Two', scope: 'block', className: 'article-style article-lead' },
    ],
  ])('rejects invalid presets %#', presets => {
    expect(() => getStylePresetConfig(createEditorWithConfig({ presets }))).toThrow()
  })

  it('rejects a non-array preset value', () => {
    expect(() => getStylePresetConfig(createEditorWithConfig({ presets: 'invalid' }))).toThrow(
      'must be an array'
    )
  })
})
