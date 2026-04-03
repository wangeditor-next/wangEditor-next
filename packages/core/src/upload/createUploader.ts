/**
 * @description gen uploader
 * @author wangfupeng
 */

import type Uppy from '@uppy/core'

import type { IDomEditor } from '../editor/interface'
import createUppyUploader from './createUppyUploader'
import type { IUploadAdapter, IUploadConfig, IUploader } from './interface'

type IUploadConfigWithAdapter = IUploadConfig & {
  uploadAdapter: IUploadAdapter
}

function createUploader<T extends IUploadConfig>(
  config: T,
  editor?: IDomEditor,
): T extends IUploadConfigWithAdapter ? IUploader : Uppy {
  if (config.uploadAdapter) {
    return config.uploadAdapter({ config, editor }) as T extends IUploadConfigWithAdapter ? IUploader : Uppy
  }

  return createUppyUploader(config) as T extends IUploadConfigWithAdapter ? IUploader : Uppy
}

export default createUploader
