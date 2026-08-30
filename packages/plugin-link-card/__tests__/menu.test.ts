import { Node, Transforms } from 'slate'

import createEditor from '../../../tests/utils/create-editor'
import ConvertToLink from '../src/module/menu/ConvertToLink'
import ConvertToLinkCard from '../src/module/menu/ConvertToLinkCard'
import withLinkCard from '../src/module/plugin'

describe('plugin-link-card menus', () => {
  it('converts a link into a link card without losing target', async () => {
    const editor = withLinkCard(
      createEditor({
        config: {
          MENU_CONF: {
            convertToLinkCard: {
              async getLinkCardInfo() {
                return { title: 'wangEditor', iconImgSrc: '' }
              },
            },
          },
        },
      })
    )

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      getLinkCardInfo: async () => ({ title: 'wangEditor', iconImgSrc: '' }),
    } as any)

    editor.children = [
      {
        type: 'paragraph',
        children: [
          {
            type: 'link',
            url: 'https://www.wangeditor.com/',
            target: '_self',
            children: [{ text: 'wangEditor' }],
          },
        ],
      },
    ]
    editor.select({ path: [0, 0, 0], offset: 1 })

    const menu = new ConvertToLinkCard()

    await menu.exec(editor, '')

    const linkCard = editor.getElemsByTypePrefix('link-card')[0] as any

    expect(linkCard).toMatchObject({
      type: 'link-card',
      title: 'wangEditor',
      link: 'https://www.wangeditor.com/',
      target: '_self',
    })
  })

  it('converts a selected link card into a paragraph containing a link', () => {
    const editor = withLinkCard(createEditor())
    const linkCard = {
      type: 'link-card',
      title: 'wangEditor',
      link: 'https://www.wangeditor.com/',
      target: '_self',
      children: [{ text: '' }],
    }

    Transforms.insertNodes(editor, linkCard, { at: [0] })
    Transforms.select(editor, [0])

    const menu = new ConvertToLink()

    expect(menu.isDisabled(editor)).toBe(false)
    menu.exec(editor, '')

    const paragraph = editor.children[0] as any
    const link = editor.getElemsByTypePrefix('link')[0]

    expect(paragraph.type).toBe('paragraph')
    expect(link).toMatchObject({
      type: 'link',
      url: 'https://www.wangeditor.com/',
      target: '_self',
      children: [{ text: 'wangEditor' }],
    })
    expect(Node.string(link)).toBe('wangEditor')
  })
})
