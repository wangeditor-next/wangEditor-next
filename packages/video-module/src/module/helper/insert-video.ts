/**
 * @description insert video
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import { Transforms } from 'slate'

import { replaceSymbols } from '../../utils/util'
import { VideoElement } from '../custom-types'

/**
 * 插入视频
 * @param editor editor
 * @param src video src
 * @param poster video poster
 */
export default async function (
  editor: IDomEditor,
  src: string,
  poster = '',
  width = '',
  height = ''
) {
  if (!src) {
    return
  }

  // 还原选区
  editor.restoreSelection()

  // 校验
  const { onInsertedVideo, checkVideo, parseVideoSrc } = editor.getMenuConfig('insertVideo')
  const checkRes = await checkVideo(src, poster)

  if (typeof checkRes === 'string') {
    // 校验失败，给出提示
    editor.alert(checkRes, 'error')
    return
  }
  if (checkRes == null) {
    // 校验失败，不给提示
    return
  }

  // 转换 src
  let parsedSrc = await parseVideoSrc(src)

  if (parsedSrc.trim().indexOf('<iframe ') !== 0) {
    parsedSrc = replaceSymbols(parsedSrc)
  }

  // 新建一个 video node
  const video: VideoElement = {
    type: 'video',
    src: parsedSrc,
    poster,
    align: 'center',
    children: [{ text: '' }],
    style: {
      width,
      height,
    },
  }

  const isInsideTableCell = DomEditor.getSelectedNodeByType(editor, 'table-cell') != null

  // 插入视频
  // 不使用此方式会比正常的选区选取先执行
  Promise.resolve().then(() => {
    // A table cell owns its block children. Removing the empty paragraph or
    // inserting with `mode: highest` would move the video outside the cell.
    if (!isInsideTableCell && DomEditor.isSelectedEmptyParagraph(editor)) {
      Transforms.removeNodes(editor, { mode: 'highest' })
    }

    if (isInsideTableCell) {
      Transforms.insertNodes(editor, video)
      return
    }

    Transforms.insertNodes(editor, video, { mode: 'highest' })
  })

  // 调用 callback
  onInsertedVideo(video)
}
