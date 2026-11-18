/**
 * @description editor 插件，重写 editor API
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Transforms } from 'slate'

import { CustomElement } from '../../../custom-types'
import {
  VIDEO_CLIPBOARD_AUTOPLAY_MARKER,
  VIDEO_CLIPBOARD_MUTED_MARKER,
} from './attributes'

export function serializeVideoClipboardHtml(html: string): string {
  const container = document.createElement('div')

  container.innerHTML = html

  container.querySelectorAll('video').forEach(video => {
    if (video.hasAttribute(VIDEO_CLIPBOARD_AUTOPLAY_MARKER)) {
      video.setAttribute('autoplay', '')
      video.removeAttribute(VIDEO_CLIPBOARD_AUTOPLAY_MARKER)
    }

    if (video.hasAttribute(VIDEO_CLIPBOARD_MUTED_MARKER)) {
      video.setAttribute('muted', '')
      video.removeAttribute(VIDEO_CLIPBOARD_MUTED_MARKER)
    }
  })

  return container.innerHTML
}

function withVideo<T extends IDomEditor>(editor: T): T {
  const { isVoid, normalizeNode, setFragmentData } = editor
  const newEditor = editor

  // 重写 isVoid
  newEditor.isVoid = (elem: CustomElement) => {
    const { type } = elem

    if (type === 'video') {
      return true
    }

    return isVoid(elem)
  }

  // 重写 normalizeNode
  newEditor.normalizeNode = ([node, path]) => {
    const type = DomEditor.getNodeType(node)

    // ----------------- video 后面必须跟一个 p header blockquote -----------------
    if (type === 'video') {
      // -------------- video 是 editor 最后一个节点，需要后面插入 p --------------
      const isLast = DomEditor.isLastNode(newEditor, node)

      if (isLast) {
        Transforms.insertNodes(newEditor, DomEditor.genEmptyParagraph(), { at: [path[0] + 1] })
      }
    }

    // 执行默认的 normalizeNode ，重要！！！
    return normalizeNode([node, path])
  }

  // Keep autoplay and muted in HTML copied to non-wangEditor targets. The
  // editable DOM intentionally avoids the real autoplay attribute, and
  // muted is also set as a property, so core's DOM clone alone cannot retain
  // either value in text/html.
  newEditor.setFragmentData = data => {
    setFragmentData(data)

    const html = data.getData('text/html')

    if (!html) {
      return
    }

    data.setData('text/html', serializeVideoClipboardHtml(html))
  }

  // 返回 editor ，重要！
  return newEditor
}

export default withVideo
