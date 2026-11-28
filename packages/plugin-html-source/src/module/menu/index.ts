/**
 * @description html-source menu entry
 */

import EditHtmlSourceMenu from './EditHtmlSource'

export const editHtmlSourceMenuConf = {
  key: 'editHtmlSource', // menu key ，唯一。注册之后，可配置到工具栏
  factory() {
    return new EditHtmlSourceMenu()
  },
}
