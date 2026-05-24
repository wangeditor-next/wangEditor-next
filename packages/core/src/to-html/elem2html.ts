/**
 * @description elem -> html
 * @author wangfupeng
 */

import { Editor, Element } from 'slate'

import { DomEditor } from '../editor/dom-editor'
import { IDomEditor } from '../editor/interface'
import { genElemId } from '../render/helper'
import { ELEM_TO_HTML_CONF, ElemToHtmlFnType, STYLE_TO_HTML_FN_LIST } from './index'
import type { INodeToHtmlOptions } from './node2html'
import node2html from './node2html'

/**
 * 默认的 toHtml 函数
 * @param elemNode elem node
 * @param childrenHtml children html
 * @param editor editor
 */
function defaultParser(elemNode: Element, childrenHtml: string, editor: IDomEditor) {
  const isInline = editor.isInline(elemNode)
  const tag = isInline ? 'span' : 'div'

  return `<${tag}>${childrenHtml}</${tag}>`
}

/**
 * 根据 type 获取 toHtml 函数
 * @param type node.type
 */
function getParser(type: string): ElemToHtmlFnType {
  const fn = ELEM_TO_HTML_CONF[type]

  return fn || defaultParser
}

const DEFAULT_ID_KEY = 'data-w-e-id'
const HTML_ATTR_KEY_REGEXP = /^[A-Za-z_:-][A-Za-z0-9_:.-]*$/

function normalizeIdKey(idKey?: string): string {
  if (!idKey) { return DEFAULT_ID_KEY }
  if (!HTML_ATTR_KEY_REGEXP.test(idKey)) { return DEFAULT_ID_KEY }

  return idKey
}

function addAttrToFirstTag(html: string, key: string, value: string): string {
  if (!html) { return html }

  const match = html.match(/^<([A-Za-z][A-Za-z0-9-]*)([^>]*)>/)

  if (!match) { return html }

  const [fullTag, tagName, rawAttrs = ''] = match

  if (new RegExp(`\\s${key}=`).test(rawAttrs)) { return html }

  const hasTrailingSlash = /\/\s*$/.test(rawAttrs)
  const attrsWithoutTrailingSlash = rawAttrs.replace(/\s*\/\s*$/, '')
  const normalizedAttrs = attrsWithoutTrailingSlash.trim() ? ` ${attrsWithoutTrailingSlash.trim()}` : ''
  const suffix = hasTrailingSlash ? ' /' : ''
  const newStartTag = `<${tagName}${normalizedAttrs} ${key}="${value}"${suffix}>`

  return newStartTag + html.slice(fullTag.length)
}

function maybeAttachElemId(
  elemHtml: string,
  elemNode: Element,
  editor: IDomEditor,
  options: INodeToHtmlOptions,
): string {
  if (!options.includeId) { return elemHtml }

  const idKey = normalizeIdKey(options.idKey)
  const key = DomEditor.findKey(editor, elemNode)
  const nodeType = DomEditor.getNodeType(elemNode)
  const elemId = genElemId(nodeType, key.id)

  return addAttrToFirstTag(elemHtml, idKey, elemId)
}

function elemToHtml(elemNode: Element, editor: IDomEditor, options: INodeToHtmlOptions = {}): string {
  const { type = '', children = [] } = elemNode
  const isVoid = Editor.isVoid(editor, elemNode)

  // 计算 children html
  let childrenHtml = ''

  if (!isVoid) {
    // 非 void node
    childrenHtml = children.map(child => node2html(child, editor, options)).join('')
  }

  // 生成 html
  const toHtmlFn = getParser(type)
  const res = toHtmlFn(elemNode, childrenHtml, editor)

  let elemHtml = ''

  if (typeof res === 'string') { elemHtml = res } else { elemHtml = res.html || '' }

  // 添加样式（如 text-align line-height 等）
  if (!isVoid) {
    STYLE_TO_HTML_FN_LIST.forEach(fn => (elemHtml = fn(elemNode, elemHtml, editor)))
  }

  elemHtml = maybeAttachElemId(elemHtml, elemNode, editor, options)

  // 直接返回 html 字符串
  if (typeof res === 'string') { return elemHtml }

  // 解析 prefix suffix （如 list-item）
  const { prefix = '', suffix = '' } = res

  if (prefix) { elemHtml = prefix + elemHtml }
  if (suffix) { elemHtml += suffix }
  return elemHtml
}

export default elemToHtml
