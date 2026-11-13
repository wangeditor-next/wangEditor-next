/**
 * @description image menu helper
 * @author wangfupeng
 */

import { DomEditor, IDomEditor } from '@wangeditor-next/core'
import {
  Editor, Element, Path, Range, Transforms,
} from 'slate'

import { replaceSymbols } from '../../utils/util'
import { ImageElement, ImageStyle } from './custom-types'

/**
 * 判断菜单是否要 disabled
 * @param editor editor
 */
export function isInsertImageMenuDisabled(editor: IDomEditor): boolean {
  const { selection } = editor

  if (selection == null) { return true }
  if (!Range.isCollapsed(selection)) { return true } // 选区非折叠，禁用

  const [match] = Editor.nodes(editor, {
    match: n => {
      const type = DomEditor.getNodeType(n)

      if (type === 'code') { return true } // 代码块
      if (type === 'pre') { return true } // 代码块
      if (type === 'link') { return true } // 链接
      if (type.startsWith('header')) { return true } // 标题
      if (type === 'blockquote') { return true } // 引用
      if (Element.isElement(n) && Editor.isVoid(editor, n)) { return true } // void

      return false
    },
    universal: true,
  })

  if (match) { return true }
  return false
}

async function check(
  menuKey: string,
  editor: IDomEditor,
  src: string,
  alt = '',
  href = '',
): Promise<boolean> {
  const { checkImage } = editor.getMenuConfig(menuKey)

  if (checkImage) {
    const res = await checkImage(src, alt, href)

    if (typeof res === 'string') {
      // 检验未通过，提示信息
      editor.alert(res, 'error')
      return false
    }
    if (res == null) {
      // 检验未通过，不提示信息
      return false
    }
  }

  return true
}

async function parseSrc(menuKey: string, editor: IDomEditor, src: string): Promise<string> {
  const { parseImageSrc } = editor.getMenuConfig(menuKey)

  if (parseImageSrc) {
    const newSrc = await parseImageSrc(src)

    return newSrc
  }
  return src
}

export interface InsertImageNodeOptions {
  /**
   * 是否让图片独占一行（默认 false，即在光标处以 inline 方式插入）。
   * 仅当光标位于普通段落中时生效；其他位置（标题、列表等）仍按 inline 插入。
   */
  block?: boolean
}

/**
 * 以独占一行的方式插入图片：光标所在段落为空则直接使用该段落，否则在其后新建一个段落。
 * @returns 是否已处理（光标不在普通段落中时返回 false，由调用方按 inline 插入）
 */
function insertImageInOwnParagraph(editor: IDomEditor, image: ImageElement): boolean {
  const entry = Editor.above(editor, {
    match: n => Element.isElement(n) && Editor.isBlock(editor, n),
    mode: 'lowest',
  })

  if (entry == null) { return false }
  const [block, path] = entry

  if (DomEditor.getNodeType(block) !== 'paragraph') { return false }

  if (Editor.isEmpty(editor, block as Element)) {
    Transforms.insertNodes(editor, image)
  } else {
    Transforms.insertNodes(
      editor,
      { type: 'paragraph', children: [{ text: '' }, image, { text: '' }] } as Element,
      { at: Path.next(path), select: true },
    )
  }
  return true
}

export async function insertImageNode(
  editor: IDomEditor,
  src: string,
  alt = '',
  href = '',
  options: InsertImageNodeOptions = {},
) {
  const res = await check('insertImage', editor, src, alt, href)

  if (!res) { return } // 检查失败，终止操作

  const parsedSrc = await parseSrc('insertImage', editor, src)

  // 新建一个 image node
  const image: ImageElement = {
    type: 'image',
    src: replaceSymbols(parsedSrc),
    href,
    alt,
    style: {},
    children: [{ text: '' }], // 【注意】void node 需要一个空 text 作为 children
  }

  // 如果 blur ，则恢复选区
  if (editor.selection === null) { editor.restoreSelection() }

  // Preserve active text marks (e.g. fontFamily/fontSize) for the text typed after image insertion.
  const activeMarks = editor.getMarks?.() || {}
  const marksForTrailingText: Record<string, unknown> = {}

  Object.keys(activeMarks).forEach(key => {
    const value = (activeMarks as Record<string, unknown>)[key]

    if (value == null) { return }
    if (value === false) { return }
    marksForTrailingText[key] = value
  })

  // 如果当前正好选中了图片，则 move 一下（如：连续上传多张图片时）
  if (DomEditor.getSelectedNodeByType(editor, 'image')) {
    editor.move(1)
  }

  if (isInsertImageMenuDisabled(editor)) { return }

  // 插入图片
  if (!(options.block && insertImageInOwnParagraph(editor, image))) {
    Transforms.insertNodes(editor, image)
  }
  // Continue typing in the trailing text, rather than inside the image's void child.
  // Move before restoring marks, since a selection change clears Slate's pending marks.
  if (DomEditor.getSelectedNodeByType(editor, 'image')) {
    Transforms.move(editor, { distance: 1 })
  }

  // Slate/Plate style: restore marks for subsequent typing instead of mutating existing text nodes.
  Object.keys(marksForTrailingText).forEach(key => {
    Editor.addMark(editor, key, marksForTrailingText[key])
  })

  // 回调
  const { onInsertedImage } = editor.getMenuConfig('insertImage')

  if (onInsertedImage) { onInsertedImage(image) }
}

export async function updateImageNode(
  editor: IDomEditor,
  src: string,
  alt = '',
  href = '',
  style: ImageStyle = {},
) {
  const res = await check('editImage', editor, src, alt, href)

  if (!res) { return } // 检查失败，终止操作

  const parsedSrc = await parseSrc('editImage', editor, src)

  const selectedImageNode = DomEditor.getSelectedNodeByType(editor, 'image')

  if (selectedImageNode == null) { return }
  const { style: curStyle = {} } = selectedImageNode as ImageElement

  // 修改图片
  const nodeProps: Partial<ImageElement> = {
    src: parsedSrc,
    alt,
    href,
    style: {
      ...curStyle,
      ...style,
    },
  }

  Transforms.setNodes(editor, nodeProps, {
    match: n => DomEditor.checkNodeType(n, 'image'),
  })

  // 回调
  const imageNode = DomEditor.getSelectedNodeByType(editor, 'image')
  const { onUpdatedImage } = editor.getMenuConfig('editImage')

  if (onUpdatedImage) { onUpdatedImage(imageNode as ImageElement) }
}
