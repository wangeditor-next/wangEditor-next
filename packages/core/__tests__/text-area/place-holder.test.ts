import {
  afterEach, describe, expect, test,
} from 'vitest'

import {
  handlePlaceholder,
  hidePlaceholder,
} from '../../src/text-area/place-holder'
import $ from '../../src/utils/dom'

afterEach(() => {
  document.body.innerHTML = ''
})

function createTextarea() {
  const container = $('<div></div>')

  $('body').append(container)

  return {
    $textAreaContainer: container,
    $placeholder: null,
    showPlaceholder: false,
    isComposing: false,
  } as any
}

describe('placeholder helpers', () => {
  test('shows and then hides placeholder based on empty state', () => {
    const textarea = createTextarea()
    const editor = {
      getConfig: () => ({ placeholder: '请输入内容' }),
      isEmpty: () => true,
    } as any

    handlePlaceholder(textarea, editor)

    expect(textarea.showPlaceholder).toBe(true)
    expect(textarea.$placeholder?.text()).toBe('请输入内容')

    editor.isEmpty = () => false
    handlePlaceholder(textarea, editor)

    expect(textarea.showPlaceholder).toBe(false)
    expect(textarea.$placeholder?.css('display')).toBe('none')
  })

  test('does not show placeholder while composing', () => {
    const textarea = createTextarea()
    const editor = {
      getConfig: () => ({ placeholder: '请输入内容' }),
      isEmpty: () => true,
    } as any

    textarea.isComposing = true
    handlePlaceholder(textarea, editor)

    expect(textarea.showPlaceholder).toBe(false)
    expect(textarea.$placeholder).toBeNull()
  })

  test('hidePlaceholder only hides when editor is empty and placeholder is visible', () => {
    const textarea = createTextarea()
    const editor = {
      getConfig: () => ({ placeholder: '请输入内容' }),
      isEmpty: () => true,
    } as any

    handlePlaceholder(textarea, editor)
    hidePlaceholder(textarea, editor)

    expect(textarea.showPlaceholder).toBe(false)

    editor.isEmpty = () => false
    textarea.showPlaceholder = true
    textarea.$placeholder?.show()

    hidePlaceholder(textarea, editor)

    expect(textarea.showPlaceholder).toBe(true)
    expect(textarea.$placeholder?.css('display')).not.toBe('none')
  })
})
