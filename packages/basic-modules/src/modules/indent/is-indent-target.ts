/**
 * @description indent target matcher
 */

import { Element } from 'slate'

export function isIndentTargetElement(node: unknown): boolean {
  if (!Element.isElement(node)) { return false }

  const type = (node as any).type

  if (type === 'paragraph') { return true }
  if (typeof type === 'string' && type.startsWith('header')) { return true }

  return false
}
