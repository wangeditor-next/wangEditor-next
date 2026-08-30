/**
 * @description elem to html
 * @author wangfupeng
 */

import { SlateElement } from '@wangeditor-next/editor'

import { LinkCardElement } from './custom-types'

// 生成 html 的函数
function linkCardToHtml(elem: SlateElement, _childrenHtml: string): string {
  const { title = '', link = '', target, iconImgSrc = '' } = elem as LinkCardElement
  const targetAttr = target ? ` data-target="${target}"` : ''
  const html = `<div data-w-e-type="link-card" data-w-e-is-void data-title="${title}" data-link="${link}"${targetAttr} data-iconImgSrc="${iconImgSrc}">
    <div class="info-container">
      <div class="title-container"><p>${title}</p></div>
      <div class="link-container"><span>${link}</span></div>
    </div>
    <div class="icon-container">
      <img src="${iconImgSrc}"/>
    </div>
  </div>`

  return html
}

// 配置
const conf = {
  type: 'link-card', // 节点 type ，重要！！！
  elemToHtml: linkCardToHtml,
}

export default conf
