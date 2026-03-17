/**
 * @description plugin
 * @author wangfupeng
 */

import {
  DomEditor,
  IDomEditor,
  SlateEditor,
  SlateElement,
  SlateRange,
  SlateTransforms,
} from '@wangeditor-next/editor'

// 空格对应的 md 关键字
const KEY_TO_TYPE_FOR_SPACE: { [key: string]: string } = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '>': 'blockquote',
  '#': 'header1',
  '##': 'header2',
  '###': 'header3',
  '####': 'header4',
  '#####': 'header5',
}

// 回车对应的 md 关键字
const KEY_TO_TYPE_FOR_ENTER: { [key: string]: string } = {
  '---': 'divider',
  '----': 'divider',
  '-----': 'divider',
  '------': 'divider',

  // PS： '```' 转换 pre/code 比较麻烦，单独写
}

/**
 * 获取 md 关键字和关键字的 range
 * @param editor editor
 */
function getBeforeText(editor: IDomEditor): { beforeText: string; range: SlateRange | null } {
  const { selection } = editor

  if (selection == null) {
    return { beforeText: '', range: null }
  }
  const { anchor } = selection
  // 找到当前文本上面的 block 元素，如 header1 paragraph
  const block = SlateEditor.above(editor, {
    match: n => SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
  })

  if (block == null) {
    return { beforeText: '', range: null }
  }
  const blockPath = block[1]
  const blockStart = SlateEditor.start(editor, blockPath) // block 元素的起始位置，就第一个文字的位置
  const range = { anchor, focus: blockStart }
  const beforeText = SlateEditor.string(editor, range) || ''

  return { beforeText, range }
}

function withMarkdown<T extends IDomEditor>(editor: T) {
  const { insertBreak, insertText } = editor
  const newEditor = editor

  // 输入空格时，尝试转换 markdown
  newEditor.insertText = text => {
    const { selection } = editor

    if (selection == null) {
      return insertText(text)
    }
    if (SlateRange.isExpanded(selection)) {
      return insertText(text)
    }
    if (DomEditor.getSelectedNodeByType(editor, 'paragraph') == null) {
      return insertText(text)
    } // 必须在 paragraph 内
    if (text !== ' ') {
      return insertText(text)
    } // 必须是输入空格

    // 获取空格前面的文字
    const { beforeText, range } = getBeforeText(editor)

    if (!beforeText || !range) {
      return insertText(text)
    }

    // 根据 md 关键字，找到要转换 elem 的 type
    const type = KEY_TO_TYPE_FOR_SPACE[beforeText]

    if (!type) {
      return insertText(text)
    }

    // 转换为 type elem
    SlateTransforms.select(editor, range)
    SlateTransforms.delete(editor)
    const props: Partial<SlateElement> = {
      type,
    }

    SlateTransforms.setNodes<SlateElement>(editor, props, {
      match: n => SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
    })

    // 如果是 list-item ，则包裹一层 bulleted-list
    if (type === 'list-item') {
      const listElem = {
        type: 'bulleted-list',
        children: [],
      }

      SlateTransforms.wrapNodes(editor, listElem, {
        match: n => DomEditor.getNodeType(n) === 'list-item',
      })
    }
  }

  // 换行时，尝试转换 markdown
  newEditor.insertBreak = () => {
    const { selection } = editor

    if (selection == null) {
      return insertBreak()
    }
    if (SlateRange.isExpanded(selection)) {
      return insertBreak()
    }
    if (DomEditor.getSelectedNodeByType(editor, 'paragraph') == null) {
      return insertBreak()
    } // 必须在 paragraph 内

    const { beforeText, range } = getBeforeText(editor) // 获取前面的文字

    if (!beforeText || !range) {
      return insertBreak()
    }

    // 单独处理 pre/code
    if (beforeText.indexOf('```') === 0) {
      let lang = beforeText.slice(3).toLowerCase().trim() // 获取 ```js 中的语言，如 js

      if (lang === 'js') {
        lang = 'javascript'
      }
      if (lang === 'ts') {
        lang = 'typescript'
      }
      if (lang === 'md') {
        lang = 'markdown'
      }
      if (lang === 'py') {
        lang = 'python'
      }
      if (lang === 'vb') {
        lang = 'visual-basic'
      }
      if (lang === 'c#') {
        lang = 'csharp'
      }

      const codeLangs = editor.getConfig().MENU_CONF?.codeSelectLang?.codeLangs || []

      if (lang) {
        // lang 有可能不在支持范围之内
        const isValid = codeLangs.some((item: any) => item.value === lang)

        if (!isValid) {
          return insertBreak()
        }
      }

      // 删除 ```js 文字
      SlateTransforms.select(editor, range)
      SlateTransforms.delete(editor)

      // 插入 pre/code elem
      const preElem = {
        type: 'pre',
        children: [
          {
            type: 'code',
            language: lang,
            children: [{ text: '' }],
          },
        ],
      }

      SlateTransforms.insertNodes(editor, preElem)
      return
    }

    // 根据 md 关键字，找到要转换 elem 的 type
    const type = KEY_TO_TYPE_FOR_ENTER[beforeText]

    if (!type) {
      return insertBreak()
    }

    // 转换为 type elem
    SlateTransforms.select(editor, range)
    SlateTransforms.delete(editor)
    const props: Partial<SlateElement> = {
      type,
    }

    SlateTransforms.setNodes<SlateElement>(editor, props, {
      match: n => SlateElement.isElement(n) && SlateEditor.isBlock(editor, n),
    })
  }

  return newEditor
}

export default withMarkdown
