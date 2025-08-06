/**
 * @description upload interface
 * @author wangfupeng
 */

import { UppyFile } from '@uppy/core'

import { IDomEditor } from '../editor/interface'

type FilesType = { [key: string]: UppyFile<{}, {}> }
type InsertFn = (
  src: string,
  poster?: string,
  alt?: string,
  href?: string
) => void | Promise<void>;

// 基础配置接口
interface IBaseUploadConfig {
  fieldName?: string
  maxFileSize?: number
  maxNumberOfFiles?: number
  meta?: Record<string, unknown>
  metaWithUrl: boolean
  headers?:
    | Headers
    | ((file: UppyFile<Record<string, unknown>, Record<string, unknown>>) => Headers)
    | undefined
  withCredentials?: boolean
  timeout?: number
  onBeforeUpload?: (files: FilesType) => boolean | FilesType
  onSuccess: (file: UppyFile<{}, {}>, response: any) => void
  onProgress?: (progress: number) => void
  onFailed: (file: UppyFile<{}, {}>, response: any) => void
  onError: (file: UppyFile<{}, {}>, error: any, res: any) => void
  allowedFileTypes?: string[]
  // 用户自定义插入视频
  customInsert?: (res: any, insertFn: InsertFn) => void
  // 用户自定义上传视频
  customUpload?: (files: File, insertFn: InsertFn, editor: IDomEditor) => void
  // 自定义选择视频，如图床
  customBrowseAndUpload?: (insertFn: InsertFn) => void
  // 支持传入更多 Uppy 配置项
  uppyConfig?: Record<string, any>;
  // 支持传入更多 XHRUpload 配置项
  xhrConfig?: Record<string, any>;
}

// 有自定义上传时的配置（server可选）
interface IUploadConfigWithCustomUpload extends IBaseUploadConfig {
  server?: string
  customUpload: (files: File, insertFn: InsertFn, editor: IDomEditor) => void
}

// 没有自定义上传时的配置（server必需）
interface IUploadConfigWithoutCustomUpload extends IBaseUploadConfig {
  server: string
  customUpload?: never
}

/**
 * 配置参考 https://uppy.io/docs/uppy/
 */
export type IUploadConfig = IUploadConfigWithCustomUpload | IUploadConfigWithoutCustomUpload
