/**
 * @description code-block menu
 * @author wangfupeng
 */

import CodeBlockMenu from './CodeBlockMenu'

export const codeBlockMenuConf = {
  key: 'codeBlock',
  config: {
    showCopyButton: false,
  },
  factory() {
    return new CodeBlockMenu()
  },
}
