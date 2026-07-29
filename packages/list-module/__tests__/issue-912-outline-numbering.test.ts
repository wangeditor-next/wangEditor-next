/**
 * @description issue #912 heading and ordered-list composition
 */

import createEditor from '../../../tests/utils/create-editor'
import HeaderSelectMenu from '../../basic-modules/src/modules/header/menu/HeaderSelectMenu'
import NumberedListMenu from '../src/module/menu/NumberedListMenu'

function createOutlineContent() {
  return [
    {
      type: 'list-item',
      ordered: true,
      level: 0,
      headingType: 'header1',
      listMode: 'outline',
      children: [{ text: 'Overview' }],
    },
    {
      type: 'list-item',
      ordered: true,
      level: 1,
      headingType: 'header2',
      listMode: 'outline',
      children: [{ text: 'Scope' }],
    },
    {
      type: 'list-item',
      ordered: true,
      level: 2,
      headingType: 'header3',
      listMode: 'outline',
      children: [{ text: 'Details' }],
    },
    {
      type: 'list-item',
      ordered: true,
      level: 1,
      headingType: 'header2',
      listMode: 'outline',
      children: [{ text: 'Delivery' }],
    },
    {
      type: 'list-item',
      ordered: true,
      level: 0,
      headingType: 'header1',
      listMode: 'outline',
      listRestart: 1,
      children: [{ text: 'Appendix' }],
    },
  ]
}

function getMarkers(editor: ReturnType<typeof createEditor>): string[] {
  editor.updateView()

  return Array.from(editor.getEditableContainer().querySelectorAll('.w-e-list-marker')).map(
    marker => marker.textContent || ''
  )
}

describe('list issue #912 outline numbering', () => {
  it('keeps the legacy list-item shape while both heading and ordered-list menus are active', () => {
    const editor = createEditor({
      content: [
        { type: 'header1', children: [{ text: 'Overview' }] },
        { type: 'header2', children: [{ text: 'Scope' }] },
        { type: 'header3', children: [{ text: 'Details' }] },
        { type: 'header2', children: [{ text: 'Delivery' }] },
        { type: 'header1', children: [{ text: 'Summary' }] },
      ],
    })
    const numberedListMenu = new NumberedListMenu()
    const headerMenu = new HeaderSelectMenu()

    editor.children.forEach((_node, index) => {
      editor.select({ path: [index, 0], offset: 0 })
      numberedListMenu.exec(editor, '')
    })

    expect(editor.children).toEqual([
      {
        type: 'list-item',
        ordered: true,
        level: 0,
        headingType: 'header1',
        listMode: 'outline',
        children: [{ text: 'Overview' }],
      },
      {
        type: 'list-item',
        ordered: true,
        level: 1,
        headingType: 'header2',
        listMode: 'outline',
        children: [{ text: 'Scope' }],
      },
      {
        type: 'list-item',
        ordered: true,
        level: 2,
        headingType: 'header3',
        listMode: 'outline',
        children: [{ text: 'Details' }],
      },
      {
        type: 'list-item',
        ordered: true,
        level: 1,
        headingType: 'header2',
        listMode: 'outline',
        children: [{ text: 'Delivery' }],
      },
      {
        type: 'list-item',
        ordered: true,
        level: 0,
        headingType: 'header1',
        listMode: 'outline',
        children: [{ text: 'Summary' }],
      },
    ])

    editor.select({ path: [2, 0], offset: 0 })
    expect(numberedListMenu.isActive(editor)).toBe(true)
    expect(headerMenu.getValue(editor)).toBe('header3')
    expect(getMarkers(editor)).toEqual(['1.', '1.1', '1.1.1', '1.2', '2.'])

    numberedListMenu.exec(editor, '')
    expect(editor.children[2]).toEqual({ type: 'header3', children: [{ text: 'Details' }] })
  })

  it('exports semantic heading lists and preserves every HTML/Slate round trip', () => {
    const source = createEditor({ content: createOutlineContent() })
    const html = source.getHtml()
    const wrapper = document.createElement('div')

    wrapper.innerHTML = html
    expect(wrapper.querySelector('ol[data-w-e-list-mode="outline"] > li > h1')?.textContent).toBe(
      'Overview'
    )
    expect(wrapper.querySelector('ol > li > ol > li > h2')?.textContent).toBe('Scope')
    expect(wrapper.querySelector('ol > li > ol > li > ol > li > h3')?.textContent).toBe('Details')
    expect(html).not.toContain('>1.1 Scope<')

    const slateToHtmlToSlate = createEditor({ html })
    const htmlWithId = source.getHtmlWithId?.('data-node-id') || ''

    expect(slateToHtmlToSlate.children).toEqual(source.children)
    expect(slateToHtmlToSlate.getHtml()).toBe(html)
    expect(htmlWithId).toContain('<ol data-w-e-list-mode="outline">')
    expect(htmlWithId).toMatch(/<h1 data-node-id="w-e-element-list-item-/)

    source.setHtml(html)
    expect(source.getHtml()).toBe(html)
    expect(createEditor({ html }).getHtml()).toBe(html)
  })

  it('keeps top-level blocks after an outline outside the preceding list item', () => {
    const source = createEditor({
      content: [
        {
          type: 'list-item',
          ordered: true,
          level: 0,
          headingType: 'header1',
          listMode: 'outline',
          children: [{ text: 'Chapter' }],
        },
        { type: 'paragraph', children: [{ text: 'Following paragraph' }] },
      ],
    })
    const html = source.getHtml()
    const parsed = createEditor({ html })

    expect(html).toBe(
      '<ol data-w-e-list-mode="outline"><li data-w-e-list-indent="0" data-w-e-outline-number="1."><h1>Chapter</h1></li></ol><p>Following paragraph</p>'
    )
    expect(parsed.children).toEqual(source.children)
    expect(parsed.getHtml()).toBe(html)

    source.setHtml(html)
    expect(source.children).toEqual(parsed.children)
    expect(source.getHtml()).toBe(html)
  })

  it('uses a container start value only for the first imported outline item', () => {
    const editor = createEditor({
      html: '<ol start="3" data-w-e-list-mode="outline"><li><h1>One</h1></li><li><h1>Two</h1></li></ol>',
    })

    expect(editor.children).toEqual([
      {
        type: 'list-item',
        ordered: true,
        level: 0,
        headingType: 'header1',
        listMode: 'outline',
        listRestart: 3,
        children: [{ text: 'One' }],
      },
      {
        type: 'list-item',
        ordered: true,
        level: 0,
        headingType: 'header1',
        listMode: 'outline',
        children: [{ text: 'Two' }],
      },
    ])
    expect(getMarkers(editor)).toEqual(['3.', '4.'])
    expect(editor.getHtml()).toContain('<ol start="3" data-w-e-list-mode="outline">')
  })

  it('keeps a standard heading list as standard after every HTML round trip', () => {
    const source = createEditor({
      content: [
        {
          type: 'list-item',
          ordered: true,
          level: 0,
          orderType: 'a',
          headingType: 'header2',
          children: [{ text: 'Appendix item' }],
        },
      ],
    })
    const html = source.getHtml()
    const parsed = createEditor({ html })

    expect(html).toBe(
      '<ol type="a" data-w-e-list-mode="standard"><li><h2>Appendix item</h2></li></ol>'
    )
    expect(parsed.children).toEqual(source.children)
    expect(parsed.getHtml()).toBe(html)

    source.setHtml(html)
    expect(source.children).toEqual(parsed.children)
  })

  it.each([
    {
      mode: 'inline',
      color: 'rgb(235, 144, 58)',
      config: {},
      expectedListColor: 'style="color:rgb(235, 144, 58)"',
    },
    {
      mode: 'class',
      color: 'rgb(1, 2, 3)',
      config: {
        textStyleMode: 'class',
        styleClassTokens: { color: ['rgb(1, 2, 3)'] },
      },
      expectedListColor: 'data-w-e-color="rgb(1, 2, 3)"',
    },
  ])(
    'keeps standard list colors through render and HTML round-trip in $mode mode',
    ({ color, config, expectedListColor }) => {
      const source = createEditor({
        config,
        content: [
          {
            type: 'list-item',
            ordered: true,
            level: 0,
            children: [{ text: 'Parent', color }],
          },
          {
            type: 'list-item',
            ordered: true,
            level: 1,
            children: [{ text: 'Child', color }],
          },
        ],
      })
      const html = source.getHtml()
      const parsed = createEditor({ html, config })

      expect(html).toContain(expectedListColor)
      expect(parsed.children).toEqual(source.children)
      expect(parsed.getHtml()).toBe(html)
      expect(getMarkers(parsed)).toEqual(['1.', '1.'])
      expect(
        parsed.getEditableContainer().querySelector<HTMLElement>('.w-e-list-marker')?.style.color
      ).toBe(color)
    }
  )

  it.each([
    {
      mode: 'inline',
      color: 'rgb(235, 144, 58)',
      config: {},
      expectedListColor: 'style="color:rgb(235, 144, 58)"',
    },
    {
      mode: 'class',
      color: 'rgb(1, 2, 3)',
      config: {
        textStyleMode: 'class',
        styleClassTokens: { color: ['rgb(1, 2, 3)'] },
      },
      expectedListColor: 'data-w-e-color="rgb(1, 2, 3)"',
    },
  ])(
    'keeps outline list colors through render and HTML round-trip in $mode mode',
    ({ color, config, expectedListColor }) => {
      const source = createEditor({
        config,
        content: [
          {
            type: 'list-item',
            ordered: true,
            level: 0,
            headingType: 'header1',
            listMode: 'outline',
            children: [{ text: 'Overview', color }],
          },
          {
            type: 'list-item',
            ordered: true,
            level: 1,
            headingType: 'header2',
            listMode: 'outline',
            children: [{ text: 'Scope', color }],
          },
        ],
      })
      const html = source.getHtml()
      const parsed = createEditor({ html, config })

      expect(html).toContain('data-w-e-list-mode="outline"')
      expect(html).toContain(expectedListColor)
      expect(parsed.children).toEqual(source.children)
      expect(parsed.getHtml()).toBe(html)
      expect(getMarkers(parsed)).toEqual(['1.', '1.1'])
      expect(
        parsed.getEditableContainer().querySelector<HTMLElement>('.w-e-list-marker')?.style.color
      ).toBe(color)
    }
  )

  it('uses an HTML start value when an outline continues after a heading boundary', () => {
    const source = createEditor({
      content: [
        {
          type: 'list-item',
          ordered: true,
          level: 0,
          headingType: 'header1',
          listMode: 'outline',
          children: [{ text: 'First chapter' }],
        },
        { type: 'header1', children: [{ text: 'Unnumbered boundary' }] },
        {
          type: 'list-item',
          ordered: true,
          level: 0,
          headingType: 'header1',
          listMode: 'outline',
          children: [{ text: 'Continued chapter' }],
        },
      ],
    })
    const html = source.getHtml()
    const parsed = createEditor({ html })

    expect(getMarkers(source)).toEqual(['1.', '2.'])
    expect(html).toContain('<ol start="2" data-w-e-list-mode="outline">')
    expect(parsed.children).toEqual(source.children)
    expect(parsed.getHtml()).toBe(html)
  })

  it('continues and restarts numbering through the marker action panel', () => {
    const editor = createEditor({ content: createOutlineContent() })
    const getSecondRootMarker = () => {
      const markers = editor
        .getEditableContainer()
        .querySelectorAll<HTMLButtonElement>('.w-e-list-marker')

      return markers[4]
    }

    editor.updateView()
    getSecondRootMarker().click()

    let panel = editor.getEditableContainer().querySelector('.w-e-list-outline-actions')

    expect(panel?.querySelectorAll('button')).toHaveLength(2)
    panel?.querySelectorAll<HTMLButtonElement>('button')[0].click()
    expect((editor.children[4] as any).listRestart).toBeUndefined()
    expect(getMarkers(editor)).toEqual(['1.', '1.1', '1.1.1', '1.2', '2.'])

    getSecondRootMarker().click()
    panel = editor.getEditableContainer().querySelector('.w-e-list-outline-actions')
    panel?.querySelectorAll<HTMLButtonElement>('button')[1].click()
    expect((editor.children[4] as any).listRestart).toBe(1)
    expect(getMarkers(editor)).toEqual(['1.', '1.1', '1.1.1', '1.2', '1.'])
  })

  it('continues to read and export historical list-item content', () => {
    const editor = createEditor({ html: '<ol><li>One</li><li>Two</li></ol>' })

    expect(editor.children).toEqual([
      { type: 'list-item', ordered: true, level: 0, children: [{ text: 'One' }] },
      { type: 'list-item', ordered: true, level: 0, children: [{ text: 'Two' }] },
    ])
    expect(editor.getHtml()).toBe('<ol><li>One</li><li>Two</li></ol>')
  })
})
