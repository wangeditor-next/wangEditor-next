/**
 * @description gen uploader
 * @author wangfupeng
 */

import type { IDomEditor } from '../editor/interface'
import createUppyUploader from './createUppyUploader'
import type { IUploadAdapter, IUploadConfig, IUploader } from './interface'

type IUploadConfigWithAdapter = IUploadConfig & {
  uploadAdapter: IUploadAdapter
}
type IDefaultUploader = IUploader & {
  [key: string]: any
}

function createUploader<T extends IUploadConfig>(
  config: T,
  editor?: IDomEditor,
): T extends IUploadConfigWithAdapter ? IUploader : IDefaultUploader {
  if (config.uploadAdapter) {
    return config.uploadAdapter({ config, editor }) as T extends IUploadConfigWithAdapter
      ? IUploader
      : IDefaultUploader
  }

  return createUppyUploader(config) as T extends IUploadConfigWithAdapter
    ? IUploader
    : IDefaultUploader
}

export default createUploader
