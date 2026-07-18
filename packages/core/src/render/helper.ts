/**
 * @description formats helper
 * @author wangfupeng
 */

export function genElemId(type: string, id: string) {
  return `w-e-element-${type}-${id}`
}

export function genTextId(id: string) {
  return `w-e-text-${id}`
}
