/**
 * @description node -> html
 * @author wangfupeng
 */

import { Descendant, Element } from 'slate'

import type { IDomEditor } from '../editor/interface'
import elemToHtml from './elem2html'
import textToHtml from './text2html'

export interface INodeToHtmlOptions {
  includeId?: boolean
  idKey?: string
}

function node2html(node: Descendant, editor: IDomEditor, options: INodeToHtmlOptions = {}): string {
  if (Element.isElement(node)) {
    // elem node
    return elemToHtml(node, editor, options)
  }

  // text node
  return textToHtml(node, editor, options)
}

export default node2html
