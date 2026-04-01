/**
 * @description upload interface
 * @author wangfupeng
 */

import type { IDomEditor } from '../editor/interface'

export type IUploadHeaders = Headers | Record<string, string>

export interface IUploadResultFile {
  name: string
  type?: string
  size?: number
  [key: string]: any
}

export interface IUploadFile {
  name: string
  type: string
  size: number
  data: Blob | File
  source?: string
}

export interface IUploader {
  addFiles: (files: IUploadFile[]) => void
  upload: () => Promise<unknown>
  destroy?: () => void
}

type FilesType = Record<string, any>
type InsertFn = (
  src: string,
  poster?: string,
  alt?: string,
  href?: string
) => void | Promise<void>;

export interface IUploadAdapterContext {
  config: IUploadConfig
  editor?: IDomEditor
}

export type IUploadAdapter = (context: IUploadAdapterContext) => IUploader

// 基础配置接口
interface IBaseUploadConfig {
  fieldName?: string
  maxFileSize?: number
  maxNumberOfFiles?: number
  meta?: Record<string, unknown>
  metaWithUrl: boolean
  headers?:
    | IUploadHeaders
    | ((file: IUploadResultFile) => IUploadHeaders)
    | undefined
  withCredentials?: boolean
  timeout?: number
  onBeforeUpload?: (files: FilesType) => boolean | FilesType
  onSuccess: (file: IUploadResultFile, response: any) => void
  onProgress?: (progress: number) => void
  onFailed: (file: IUploadResultFile, response: any) => void
  onError: (file: IUploadResultFile, error: any, res: any) => void
  allowedFileTypes?: string[]
  // 用户自定义插入视频
  customInsert?: (res: any, insertFn: InsertFn) => void
  // 用户自定义上传视频
  customUpload?: (files: File, insertFn: InsertFn, editor: IDomEditor) => void
  // 自定义选择视频，如图床
  customBrowseAndUpload?: (insertFn: InsertFn) => void
  // 新的上传适配器接口，默认仍使用内置 Uppy 适配器
  uploadAdapter?: IUploadAdapter
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

// 有上传适配器时的配置（server可选）
interface IUploadConfigWithUploadAdapter extends IBaseUploadConfig {
  server?: string
  uploadAdapter: IUploadAdapter
  customUpload?: (files: File, insertFn: InsertFn, editor: IDomEditor) => void
}

// 没有自定义上传时的配置（server必需）
interface IUploadConfigWithoutCustomUpload extends IBaseUploadConfig {
  server: string
  customUpload?: never
  uploadAdapter?: never
}

/**
 * 配置参考 https://uppy.io/docs/uppy/
 */
export type IUploadConfig =
  | IUploadConfigWithCustomUpload
  | IUploadConfigWithUploadAdapter
  | IUploadConfigWithoutCustomUpload
