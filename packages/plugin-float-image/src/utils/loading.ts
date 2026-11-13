/**
 * @description image loading attribute
 */

import { ImageLoading } from '../module/custom-types'

/**
 * 规范化 <img> 的 loading 属性值，仅保留浏览器支持的 lazy / eager
 * @param value loading 属性值
 * @returns 合法的 loading 值，否则返回 undefined
 */
export function normalizeImageLoading(value: unknown): ImageLoading | undefined {
  if (typeof value !== 'string') { return undefined }

  const loading = value.trim().toLowerCase()

  if (loading === 'lazy' || loading === 'eager') { return loading }
  return undefined
}
