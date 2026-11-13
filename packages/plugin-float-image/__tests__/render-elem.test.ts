import createEditor from '../../../tests/utils/create-editor'
import { renderImageConf } from '../src/module/render-elem'

describe('plugin-float-image render elem', () => {
  it('passes loading attribute to img', () => {
    const editor = createEditor()
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      loading: 'lazy',
      style: { float: 'left' },
      children: [{ text: '' }],
    } as any

    const containerVnode = renderImageConf.renderElem(elem, null, editor) as any
    const imageVnode = containerVnode.children[0]

    expect(imageVnode.sel).toBe('img')
    expect(imageVnode.data.loading).toBe('lazy')
  })

  it('omits loading attribute when not set or unsupported', () => {
    const editor = createEditor()
    const elem = {
      type: 'image',
      src: 'https://example.com/a.png',
      alt: 'a',
      style: {},
      children: [{ text: '' }],
    } as any

    const containerVnode = renderImageConf.renderElem(elem, null, editor) as any
    const invalidContainerVnode = renderImageConf.renderElem({ ...elem, loading: 'auto' }, null, editor) as any

    expect(containerVnode.children[0].data).not.toHaveProperty('loading')
    expect(invalidContainerVnode.children[0].data).not.toHaveProperty('loading')
  })
})
