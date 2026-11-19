/**
 * @description drag to resize video
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Element as SlateElement, Node, Transforms } from 'slate'

import { getVideoAlign } from './alignment'
import { VideoElement, videoStyle } from './custom-types'

/** 拖拽时视频的最小宽高（px） */
export const VIDEO_MIN_RESIZE_SIZE = 15

export const VIDEO_RESIZE_CONTAINER_CLASS = 'w-e-video-resize-container'
export const VIDEO_SELECTED_RESIZE_CONTAINER_CLASS = 'w-e-selected-video-resize-container'
export const VIDEO_RESIZING_CLASS = 'w-e-video-resizing'
export const VIDEO_DRAGGER_CLASS = 'w-e-video-dragger'
export const VIDEO_SIZE_TIP_CLASS = 'w-e-video-size-tip'

export const VIDEO_DRAGGER_POSITIONS = ['left-top', 'right-top', 'left-bottom', 'right-bottom'] as const

export interface IVideoSize {
  width: number
  height: number
}

/**
 * 尺寸是否由节点显式指定（'auto' 和空字符串表示未指定）
 */
export function isExplicitVideoSize(value?: string): boolean {
  return value != null && value.trim() !== '' && value.trim() !== 'auto'
}

/**
 * 编辑区内，视频尺寸设置在外层 resize 容器上，<video> / <iframe> 撑满容器
 */
export function genVideoResizeContainerStyle(style: videoStyle = {}): videoStyle {
  const { width, height } = style
  const containerStyle: videoStyle = {}

  if (isExplicitVideoSize(width)) { containerStyle.width = width }
  if (isExplicitVideoSize(height)) { containerStyle.height = height }

  return containerStyle
}

export function genVideoMediaStyle(style: videoStyle = {}): videoStyle {
  const { width, height } = style
  const mediaStyle: videoStyle = {}

  if (isExplicitVideoSize(width)) { mediaStyle.width = '100%' }
  if (isExplicitVideoSize(height)) { mediaStyle.height = '100%' }

  return mediaStyle
}

/**
 * 根据拖拽距离，按原始宽高比计算新的尺寸
 * @param originalSize 拖拽开始时的尺寸
 * @param gap 宽度变化量（px）
 * @param maxWidth 最大宽度（px），不大于 0 时不限制
 */
export function calcVideoResizeSize(
  originalSize: IVideoSize,
  gap: number,
  maxWidth: number,
): IVideoSize | null {
  const { width: originalWidth, height: originalHeight } = originalSize

  if (originalWidth <= 0 || originalHeight <= 0) { return null }

  const ratio = originalHeight / originalWidth
  // 宽、高都不能小于最小值
  const minWidth = Math.max(VIDEO_MIN_RESIZE_SIZE, VIDEO_MIN_RESIZE_SIZE / ratio)
  let width = originalWidth + gap

  // 最大宽度小于最小宽度时，无法同时满足两个限制，忽略本次拖拽
  if (maxWidth > 0 && maxWidth < minWidth) { return null }
  if (maxWidth > 0) { width = Math.min(width, maxWidth) }
  width = Math.max(width, minWidth)

  return {
    width: Math.round(width),
    height: Math.round(width * ratio),
  }
}

function getContentWidth(elem: HTMLElement): number {
  const { width } = elem.getBoundingClientRect()
  const style = window.getComputedStyle(elem)
  const sum = ['padding-left', 'padding-right', 'border-left-width', 'border-right-width'].reduce(
    (total, name) => total + (parseFloat(style.getPropertyValue(name)) || 0),
    0,
  )

  return width - sum
}

/**
 * 生成 resize 容器的 mousedown 事件，拖拽四个角的触手修改视频尺寸
 * 拖拽过程中只修改 DOM ，mouseup 时再统一修改 node
 */
export function genVideoResizeMousedownHandler(editor: IDomEditor, elemNode: SlateElement) {
  return (e: MouseEvent) => {
    const target = e.target as HTMLElement | null
    const container = e.currentTarget as HTMLElement | null

    if (target == null || container == null) { return }
    // target 不是拖拽触手，则忽略
    if (!target.classList || !target.classList.contains(VIDEO_DRAGGER_CLASS)) { return }
    e.preventDefault()

    const media = container.querySelector('video, iframe') as HTMLElement | null
    const sizeTip = container.querySelector(`.${VIDEO_SIZE_TIP_CLASS}`) as HTMLElement | null
    const figure = container.parentElement
    const { width: originalWidth, height: originalHeight } = container.getBoundingClientRect()

    if (media == null || figure == null || originalWidth <= 0 || originalHeight <= 0) { return }

    // 向右拖拽右侧触手增加宽度；向右拖拽左侧触手减少宽度（反转）
    const reverse = target.classList.contains('left-top') || target.classList.contains('left-bottom')
    // 居中时两侧同时伸缩，宽度变化量为鼠标移动距离的两倍，触手才能跟随鼠标
    const factor = getVideoAlign(elemNode) === 'center' ? 2 : 1
    const maxWidth = getContentWidth(figure)
    const originalX = e.clientX
    const originalPointerEvents = media.style.pointerEvents
    let newSize: IVideoSize | null = null

    const onMousemove = (event: MouseEvent) => {
      event.preventDefault()

      const gap = (reverse ? originalX - event.clientX : event.clientX - originalX) * factor
      const size = calcVideoResizeSize(
        { width: originalWidth, height: originalHeight },
        gap,
        maxWidth,
      )

      if (size == null) { return }
      newSize = size

      container.style.width = `${size.width}px`
      container.style.height = `${size.height}px`
      media.style.width = '100%'
      media.style.height = '100%'
      if (sizeTip) { sizeTip.textContent = `${size.width} × ${size.height}` }
    }

    const onMouseup = () => {
      document.removeEventListener('mousemove', onMousemove)
      document.removeEventListener('mouseup', onMouseup)
      container.classList.remove(VIDEO_RESIZING_CLASS)
      media.style.pointerEvents = originalPointerEvents

      // 没有拖动，不修改 node
      if (newSize == null) { return }

      let path

      try {
        path = DomEditor.findPath(editor, elemNode)
      } catch (_error) {
        return
      }

      // 拖拽期间节点可能已被删除，此时 path 上可能是其他节点，不能写入
      if (!Node.has(editor, path)) { return }
      const current = Node.get(editor, path) as SlateElement

      if (!SlateElement.isElement(current) || current.type !== elemNode.type) { return }

      const { style = {} } = elemNode as VideoElement
      const props: Partial<VideoElement> = {
        style: {
          ...style,
          width: `${newSize.width}px`,
          height: `${newSize.height}px`,
        },
      }

      Transforms.setNodes(editor, props, { at: path })
    }

    // 拖拽时 <iframe> 会吞掉鼠标事件，导致 mousemove / mouseup 无法触发
    media.style.pointerEvents = 'none'
    container.classList.add(VIDEO_RESIZING_CLASS)
    if (sizeTip) { sizeTip.textContent = `${Math.round(originalWidth)} × ${Math.round(originalHeight)}` }

    document.addEventListener('mousemove', onMousemove)
    document.addEventListener('mouseup', onMouseup)

    // 隐藏 hoverbar
    const hoverbar = DomEditor.getHoverbar(editor)

    if (hoverbar) { hoverbar.hideAndClean() }
  }
}
