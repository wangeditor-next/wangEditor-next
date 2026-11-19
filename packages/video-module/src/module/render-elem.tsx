/**
 * @description video render elem
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Element } from 'slate'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h, jsx, VNode } from 'snabbdom'

import { genSizeStyledIframeHtml } from '../utils/dom'
import { getVideoAlign, getVideoAlignClass } from './alignment'
import { genEditorVideoAttrs } from './attributes'
import { VideoElement } from './custom-types'
import {
  genVideoMediaStyle,
  genVideoResizeContainerStyle,
  genVideoResizeMousedownHandler,
  VIDEO_DRAGGER_CLASS,
  VIDEO_DRAGGER_POSITIONS,
  VIDEO_RESIZE_CONTAINER_CLASS,
  VIDEO_SELECTED_RESIZE_CONTAINER_CLASS,
  VIDEO_SIZE_TIP_CLASS,
} from './resize'

function renderVideo(elemNode: Element, children: VNode[] | null, editor: IDomEditor): VNode {
  const {
    src = '',
    poster = '',
    key = '',
    width = 'auto',
    height = 'auto',
    style = {},
    muted,
  } = elemNode as VideoElement
  const align = getVideoAlign(elemNode)
  const containerClassName = [
    'w-e-video',
    'w-e-textarea-video-container',
    getVideoAlignClass(align),
  ].join(' ')

  // 是否选中
  const selected = DomEditor.isNodeSelected(editor, elemNode)
  // 选中且未禁用时，渲染拖拽触手，可修改视频尺寸
  const resizable = selected && !editor.isDisabled()

  // 视频尺寸设置在 resize 容器上，<video> / <iframe> 撑满容器
  const mediaStyle = genVideoMediaStyle(style)

  let mediaVnode: VNode

  if (src.trim().indexOf('<iframe ') === 0) {
    // 增加尺寸样式
    const iframeHtml = genSizeStyledIframeHtml(src, width, height, mediaStyle)

    // iframe 形式，第三方视频
    mediaVnode = (
      <div className="w-e-video-iframe" innerHTML={iframeHtml}></div> // 内嵌第三方 iframe 视频
    )
  } else {
    // 其他，mp4 格式
    // 编辑区内不自动播放（不渲染 autoplay），其他属性与导出的 HTML 保持一致
    // muted 需要通过 DOM property 设置才会生效
    mediaVnode = (
      <video
        key={key}
        poster={poster}
        controls
        muted={muted === true}
        attrs={genEditorVideoAttrs(elemNode)}
        style={mediaStyle}
      >
        <source src={src} type="video/mp4" />
        {'Sorry, your browser doesn\'t support embedded videos.\n 抱歉，浏览器不支持 video 视频'}
      </video>
    )
    // @ts-ignore 添加尺寸

    if (width !== 'auto') { mediaVnode.data.width = width }
    // @ts-ignore
    if (height !== 'auto') { mediaVnode.data.height = height }
  }

  // 无论是否选中，都保持相同的 DOM 结构，避免选中时重新创建 <video> / <iframe> 打断播放
  const resizeContainerClassName = resizable
    ? `${VIDEO_RESIZE_CONTAINER_CLASS} ${VIDEO_SELECTED_RESIZE_CONTAINER_CLASS}`
    : VIDEO_RESIZE_CONTAINER_CLASS
  const resizeContainerVnode = (
    <div
      className={resizeContainerClassName}
      style={genVideoResizeContainerStyle(style)}
      on={resizable ? { mousedown: genVideoResizeMousedownHandler(editor, elemNode) } : {}}
    >
      {mediaVnode}

      {/* 拖拽的触手，统一在 resize 容器上绑定拖拽事件 */}
      {resizable
        ? VIDEO_DRAGGER_POSITIONS.map(position => (
          <div className={`${VIDEO_DRAGGER_CLASS} ${position}`}></div>
        ))
        : null}
      {resizable ? <div className={VIDEO_SIZE_TIP_CLASS}></div> : null}
    </div>
  )

  const vnode = (
    <figure
      className={containerClassName}
      data-selected={selected ? 'true' : ''} // 标记为 选中
      data-w-e-align={align}
    >
      {resizeContainerVnode}
    </figure>
  )

  // 【注意】void node 中，renderElem 不用处理 children 。core 会统一处理。

  const containerVnode = h(
    'div',
    {
      props: {
        contentEditable: false,
      },
      on: {
        mousedown: e => e.preventDefault(),
      },
    },
    vnode,
  )

  return containerVnode
}

const renderVideoConf = {
  type: 'video', // 和 elemNode.type 一致
  renderElem: renderVideo,
}

export { renderVideoConf }
