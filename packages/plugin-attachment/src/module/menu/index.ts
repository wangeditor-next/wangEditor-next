/**
 * @description menu entry
 * @author wangfupeng
 */

import { genUploadAttachmentMenuConfig } from './config'
import DownloadAttachmentMenu from './DownloadAttachment'
import UploadAttachmentMenu from './UploadAttachment'

export const uploadAttachmentMenuConf = {
  key: 'uploadAttachment',
  factory() {
    return new UploadAttachmentMenu()
  },

  // 默认菜单配置，将存储在 editorConfig.MENU_CONF[key] 中
  // 创建编辑器时，可通过 editorConfig.MENU_CONF[key] = {...} 来修改
  config: genUploadAttachmentMenuConfig(),
}

export const downloadAttachmentMenuConf = {
  key: 'downloadAttachment',
  factory() {
    return new DownloadAttachmentMenu()
  },
}
