/**
 * @description list render elem test
 * @author wangfupeng
 */

import createEditor from '../../../tests/utils/create-editor'
import renderListItemConf from '../src/module/render-elem'

describe('list module - render elem', () => {
  const unOrderedItem = { type: 'list-item', children: [{ text: '' }] }
  const leveleOneUndOrderedItem = { type: 'list-item', level: 1, children: [{ text: '' }] }
  const leveleTwoUndOrderedItem = { type: 'list-item', level: 2, children: [{ text: '' }] }
  const baseOrderedItem = { type: 'list-item', ordered: true, children: [{ text: '' }] }
  const leveledItem = { type: 'list-item', level: 3, children: [{ text: '' }] }
  let editor: ReturnType<typeof createEditor>

  beforeEach(() => {
    editor = createEditor({
      content: [
        unOrderedItem,
        leveleOneUndOrderedItem,
        leveleTwoUndOrderedItem,
        baseOrderedItem,
        leveledItem,
      ],
    })
  })

  it('render conf type', () => {
    expect(renderListItemConf.type).toBe('list-item')
  })

  it('render ordered list item elem', () => {
    const vnode: any = renderListItemConf.renderElem(baseOrderedItem, null, editor)

    expect(vnode.sel).toBe('div') // render-elem 使用 <div> 模拟 <li>

    const prefixVnode = vnode.children[0] || {}

    expect(prefixVnode.text).toBe('1.') // ordered list-item 有序号
  })

  it('render unOrdered list item elem', () => {
    const vnode: any = renderListItemConf.renderElem(unOrderedItem, null, editor)

    expect(vnode.sel).toBe('div') // render-elem 使用 <div> 模拟 <li>

    const prefixVnode = vnode.children[0] || {}

    expect(prefixVnode.text).toBe('•') // unOrdered list-item 点号
  })

  it('render leveled list item elem', () => {
    const vnode: any = renderListItemConf.renderElem(leveledItem, null, editor)
    const style = vnode.data.style

    expect(style).toEqual({
      margin: '5px 0 5px 60px',
      alignItems: 'flex-start',
      display: 'flex',
    }) // margin-left 60px
  })

  it('render one leveled orderd list item elem', () => {
    const vnode: any = renderListItemConf.renderElem(leveleOneUndOrderedItem, null, editor)

    expect(vnode.sel).toBe('div') // render-elem 使用 <div> 模拟 <li>

    const prefixVnode = vnode.children[0] || {}

    expect(prefixVnode.text).toBe('◦') // unOrdered list-item 点号
  })

  it('render two leveled orderd list item elem', () => {
    const vnode: any = renderListItemConf.renderElem(leveleTwoUndOrderedItem, null, editor)

    expect(vnode.sel).toBe('div') // render-elem 使用 <div> 模拟 <li>

    const prefixVnode = vnode.children[0] || {}

    expect(prefixVnode.text).toBe('▪') // unOrdered list-item 点号
  })

  it('render two same leveled orderd list item elem', () => {
    const orderedItem = { type: 'list-item', ordered: true, children: [{ text: '' }] }
    const localEditor = createEditor({
      content: [orderedItem, orderedItem],
    })
    const vnode: any = renderListItemConf.renderElem(orderedItem, null, localEditor)

    expect(vnode.sel).toBe('div') // render-elem 使用 <div> 模拟 <li>

    const prefixVnode = vnode.children[0] || {}

    expect(prefixVnode.text).toBe('2.') // ordered list-item 有序号
  })
})
