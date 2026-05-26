/**
 * @description menu config
 * @author wangfupeng
 */

import { IDomEditor, IUploadConfig } from '@wangeditor-next/editor'

import { AttachmentElement } from '../custom-types'

type InsertFn = (fileName: string, link: string) => void

// 在通用 uploadConfig 上，扩展 attachment 相关配置
export type IUploadConfigForAttachment = Omit<
  IUploadConfig,
  'customInsert' | 'customUpload' | 'customBrowseAndUpload'
> & {
  // 用户自定义插入附件
  customInsert?: (res: any, file: any, insertFn: InsertFn) => void
  // 用户自定义上传附件
  customUpload?: (file: File, insertFn: InsertFn, editor: IDomEditor) => void | Promise<void>
  // 自定义选择附件，如图床
  customBrowseAndUpload?: (insertFn: InsertFn) => void
  // 插入之后的回调
  onInsertedAttachment?: (elem: AttachmentElement) => void
}

export function genUploadAttachmentMenuConfig(): IUploadConfigForAttachment {
  return {
    server: '',
    fieldName: 'wangeditor-uploaded-attachment',
    maxFileSize: 10 * 1024 * 1024,
    maxNumberOfFiles: 5,
    allowedFileTypes: ['*'],
    meta: {},
    metaWithUrl: false,
    withCredentials: false,
    timeout: 30 * 1000,

    onBeforeUpload: (files: any) => files,
    onProgress: (_progress: number) => {
      /* on progress */
    },
    onSuccess: (_file: any, _res: any) => {
      /* on success */
    },
    onFailed: (_file: any, _res: any) => {
      /* on failed */
    },
    onError: (_file: any, _err: any, _res: any) => {
      /* on error */
      /* on timeout */
    },

    onInsertedAttachment(_elem: AttachmentElement) {
      // 插入文件之后的 callback
    },
  }
}
