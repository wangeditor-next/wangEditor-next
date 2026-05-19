/**
 * @description vdom util fns test
 * @author wangfupeng
 */

import { h, VNode } from 'snabbdom'

import {
  DOMPoint,
  isDataTransfer,
  isDOMComment,
  isDOMSelection,
  isDOMText,
  isHTMLElememt,
  isPlainTextOnlyPaste,
  normalizeDOMPoint,
} from '../../src/utils/dom'
import {
  addVnodeDataset,
  addVnodeProp,
  addVnodeStyle,
  normalizeVnodeData,
} from '../../src/utils/vdom'

describe('vdom util fns', () => {
  it('normalize vnode data', () => {
    const vnode = h(
      'div',
      {
        key: 'someKey',
        id: 'div1',
        className: 'someClassName',
        'data-custom-name': 'someCustomName',
      },
      [
        h(
          'p',
          {
            id: 'p1',
          },
          ['hello'],
        ),
      ],
    )

    normalizeVnodeData(vnode)

    // 转换 div 自身
    const { data = {}, children = [] } = vnode

    expect(data.key).toBe('someKey')
    const { props = {}, dataset = {} } = data

    expect(props.id).toBe('div1')
    expect(props.className).toBe('someClassName')
    expect(dataset.customName).toBe('someCustomName')

    // 转换 div 子节点 p
    const pVNode = (children[0] || {}) as VNode
    const { props: pProps = {} } = pVNode.data || {}

    expect(pProps.id).toBe('p1')
  })

  it('preserves svg namespace when normalizing vnode data', () => {
    const vnode = h(
      'div',
      {},
      [
        h(
          'svg',
          {
            attrs: {
              viewBox: '0 0 16 16',
              width: '16',
              height: '16',
            },
          },
          [
            h('path', {
              attrs: {
                d: 'M0 0L1 1',
                fill: 'red',
              },
            }),
          ],
        ),
      ],
    )

    const svgVNode = (vnode.children?.[0] || {}) as VNode
    const pathVNode = (svgVNode.children?.[0] || {}) as VNode

    expect(svgVNode.data?.ns).toBe('http://www.w3.org/2000/svg')
    expect(pathVNode.data?.ns).toBe('http://www.w3.org/2000/svg')

    normalizeVnodeData(vnode)

    expect(svgVNode.data?.ns).toBe('http://www.w3.org/2000/svg')
    expect(pathVNode.data?.ns).toBe('http://www.w3.org/2000/svg')
  })

  it('add vnode props', () => {
    const vnode = h('div', {})

    addVnodeProp(vnode, { k1: 'v1' })

    const { props = {} } = vnode.data || {}

    expect(props.k1).toBe('v1')
  })

  it('add vnode dataset', () => {
    const vnode = h('div', {})

    addVnodeDataset(vnode, { k1: 'v1' })

    const { dataset = {} } = vnode.data || {}

    expect(dataset.k1).toBe('v1')
  })

  it('add vnode style', () => {
    const vnode = h('div', {})

    addVnodeStyle(vnode, { k1: 'v1' })

    const { style = {} } = vnode.data || {}

    expect(style.k1).toBe('v1')
  })

  it('is dataTransfer', () => {
    // node 环境 无法获取 DataTransfer 的类型
    expect(isDataTransfer(new DataTransfer())).toBeFalsy()
  })

  it('is HTMLElememt', () => {
    expect(isHTMLElememt(document.createElement('div'))).toBeTruthy()
  })

  it('is DOMElement', () => {
    const mockDOMNode = {
      nodeType: 8, // Element 类型的 nodeType
    }

    expect(isDOMComment(mockDOMNode)).toBeTruthy()
  })

  it('is Selection', () => {
    // node 环境 无法获取 Range 的类型
    expect(isDOMSelection(new Range())).toBeFalsy()
  })

  it('is DomText', () => {
    const mockDOMNode = {
      nodeType: 3, // Element 类型的 nodeType
    }

    expect(isDOMText(mockDOMNode)).toBeTruthy()
  })

  it('is PlainTextOnlyPaste', () => {
    const clipboardData = {
      getData: (type: string) => (type === 'text/plain' ? 'test' : ''),
      types: ['text/plain'],
    }

    const event = {
      clipboardData,
    } as unknown as ClipboardEvent

    expect(isPlainTextOnlyPaste(event)).toBeTruthy()
  })

  it('should handle the case where offset is at the end and adjust accordingly', () => {
    let mockDOMNode = {
      nodeType: 1, // Element 类型的 nodeType
      childNodes: [],
    } as unknown as Node

    let domPoint = [mockDOMNode, 1] as DOMPoint

    let result = normalizeDOMPoint(domPoint)

    expect(result).toEqual(domPoint)
    mockDOMNode = {
      nodeType: 1, // Element 类型的 nodeType
      childNodes: [{ nodeType: 8 }],
    } as unknown as Node
    domPoint = [mockDOMNode, 1] as DOMPoint
    result = normalizeDOMPoint(domPoint)
    expect(result).toEqual([{ nodeType: 8 }, 0])
  })
})
