/**
 * @description upload entry
 * @author wangfupeng
 */

import createUploader from './createUploader'
import createUppyUploader from './createUppyUploader'
import type {
  IUploadAdapter,
  IUploadAdapterContext,
  IUploadConfig,
  IUploader,
  IUploadFile,
  IUploadResultFile,
} from './interface'

export { createUploader, createUppyUploader }
export type {
  IUploadAdapter,
  IUploadAdapterContext,
  IUploadConfig,
  IUploader,
  IUploadFile,
  IUploadResultFile,
}

// TODO upload 能力，写到文档中，二次开发使用
