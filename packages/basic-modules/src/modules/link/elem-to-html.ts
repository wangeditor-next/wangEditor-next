/**
 * @description to html
 * @author wangfupeng
 */

import { Element } from 'slate'

import { replaceSymbols } from '../../utils/util'
import { LinkElement } from './custom-types'

function linkToHtml(elem: Element, childrenHtml: string): string {
  const { url, target = '_blank' } = elem as LinkElement

  // Escape literal ampersands before introducing HTML character references.
  const href = replaceSymbols(url.replace(/&/g, '&amp;')).replace(/"/g, '&quot;')

  return `<a href="${href}" target="${target}">${childrenHtml}</a>`
}

export const linkToHtmlConf = {
  type: 'link',
  elemToHtml: linkToHtml,
}
