/**
 * @description header helper test
 * @author wangfupeng
 */

import { Editor, Transforms } from 'slate'

import createEditor from '../../../../tests/utils/create-editor'
import { getHeaderType, isMenuDisabled, setHeaderType } from '../../src/modules/header/helper'

describe('header helper', () => {
  let editor: any
  let startLocation: any

  beforeEach(() => {
    editor = createEditor()
    startLocation = Editor.start(editor, [])
  })

  afterEach(() => {
    editor = null
    startLocation = null
  })

  it('get header type', () => {
    editor.select(startLocation)
    expect(getHeaderType(editor)).toBe('paragraph')

    Transforms.setNodes(editor, { type: 'header1' })
    expect(getHeaderType(editor)).toBe('header1')
  })

  it('is menu disabled', () => {
    editor.select(startLocation)
    expect(isMenuDisabled(editor)).toBeFalsy()

    Transforms.setNodes(editor, { type: 'header1' })
    expect(isMenuDisabled(editor)).toBeFalsy()

    editor.insertNode({ type: 'pre', children: [{ type: 'code', children: [{ text: 'var' }], language: '' }] })
    expect(isMenuDisabled(editor)).toBeTruthy() // 只能用于 p header
    // Transforms.removeNodes(editor, { mode: 'highest' }) // 移除 pre/code
  })

  it('set header type', () => {
    editor.select(startLocation)
    setHeaderType(editor, 'header1')

    const headers = editor.getElemsByTypePrefix('header1')

    expect(headers.length).toBe(1)
  })

  it('keeps the list-item shape when changing an outline heading level', () => {
    editor = createEditor({
      content: [
        {
          type: 'list-item',
          ordered: true,
          level: 0,
          headingType: 'header1',
          listMode: 'outline',
          children: [{ text: 'Overview' }],
        },
      ],
    })
    editor.select({ path: [0, 0], offset: 0 })

    expect(getHeaderType(editor)).toBe('header1')
    expect(isMenuDisabled(editor)).toBeFalsy()

    setHeaderType(editor, 'header3')
    expect(editor.children[0]).toEqual({
      type: 'list-item',
      ordered: true,
      level: 2,
      headingType: 'header3',
      listMode: 'outline',
      children: [{ text: 'Overview' }],
    })

    setHeaderType(editor, 'paragraph')
    expect(editor.children[0]).toEqual({
      type: 'list-item',
      ordered: true,
      level: 2,
      children: [{ text: 'Overview' }],
    })
  })
})
