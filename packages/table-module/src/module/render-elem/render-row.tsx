/**
 * @description render row
 * @author wangfupeng
 */

import { IDomEditor } from '@wangeditor-next/core'
import { Element as SlateElement } from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { jsx, VNode } from 'snabbdom'

import { TableRowElement } from '../custom-types'

function renderTableRow(
  elemNode: SlateElement,
  children: VNode[] | null,
  _editor: IDomEditor,
): VNode {
  const { height } = elemNode as TableRowElement

  const vnode = (
    <tr style={height ? { height: `${height}px` } : {}}>
      {children}
    </tr>
  )

  return vnode
}

export default renderTableRow
