/**
 * @description create default uppy uploader
 * @author wangfupeng
 */

import Uppy from '@uppy/core'
import XHRUpload from '@uppy/xhr-upload'

import { addQueryToUrl } from '../utils/util'
import type { IUploadConfig, IUploader, IUploadResultFile } from './interface'

function getUploadResultFile(file?: IUploadResultFile | null): IUploadResultFile {
  if (file) { return file }

  return { name: '' }
}

function createUppyUploader(config: IUploadConfig): IUploader {
  const {
    server = '',
    fieldName = '',
    maxFileSize = 10 * 1024 * 1024, // 10M
    maxNumberOfFiles = 100, // 最多多少个文件
    meta = {},
    metaWithUrl = false,
    headers = {},
    withCredentials = false,
    timeout = 10 * 1000, // 10s
    onBeforeUpload = files => files,
    onSuccess = (_file, _res) => {
      /* on success */
    },
    onError = (file, err, res?) => {
      console.error(`${file.name} upload error`, err, res)
    },
    onProgress = _progress => {
      /* on progress */
    },
  } = config

  if (!server) {
    throw new Error('Cannot get upload server address\n没有配置上传地址')
  }
  if (!fieldName) {
    throw new Error('Cannot get fieldName\n没有配置 fieldName')
  }

  let url = server

  if (metaWithUrl) {
    url = addQueryToUrl(url, meta)
  }

  const uppy = new Uppy({
    onBeforeUpload: files => onBeforeUpload(files) as any,
    restrictions: {
      maxFileSize,
      maxNumberOfFiles,
    },
    meta,
    ...config.uppyConfig,
  }).use(XHRUpload, {
    endpoint: url,
    headers,
    formData: true,
    fieldName,
    bundle: false,
    withCredentials,
    timeout,
    ...config.xhrConfig,
  })

  uppy.on('upload-success', (file, response) => {
    const { body = {} } = response ?? {}
    const uploadFile = getUploadResultFile(file as IUploadResultFile | undefined)

    try {
      onSuccess(uploadFile, body)
    } catch (err) {
      console.error('wangEditor upload file - onSuccess error', err)
    }
  })

  uppy.on('progress', progress => {
    if (progress < 1) { return }
    onProgress(progress)
  })

  uppy.on('upload-error', (file, error, response) => {
    const uploadFile = getUploadResultFile(file as IUploadResultFile | undefined)

    try {
      onError(uploadFile, error, response)
    } catch (err) {
      console.error('wangEditor upload file - onError error', err)
    }
  })

  uppy.on('restriction-failed', (file, error) => {
    const uploadFile = getUploadResultFile(file as IUploadResultFile | undefined)

    try {
      onError(uploadFile, error, undefined)
    } catch (err) {
      console.error('wangEditor upload file - onError error', err)
    }
  })

  return uppy
}

export default createUppyUploader
