/**
 * @description upload image config
 * @author wangfupeng
 */

import { IUploadImageConfig } from '@wangeditor-next/core'

// 生成默认配置
export function genUploadImageConfig(): IUploadImageConfig {
  return {
    server: '', // server API 地址，需用户配置

    fieldName: 'wangeditor-uploaded-image', // formData 中，文件的 key
    maxFileSize: 2 * 1024 * 1024, // 2M
    maxNumberOfFiles: 100, // 最多上传 xx 张图片
    allowedFileTypes: ['image/*'],
    meta: {
      // 自定义上传参数，例如传递验证的 token 等。参数会被添加到 formData 中，一起上传到服务端。
      // 例如：token: 'xxxxx', x: 100
    },
    metaWithUrl: false,
    // headers: {
    //   // 自定义 http headers
    //   // 例如：Accept: 'text/x-json', a: 100,
    // },
    withCredentials: false,
    timeout: 10 * 1000, // 10s

    onBeforeUpload: (files: any) => files, // 返回 false 则终止上传
    onProgress: (_progress: number) => {
      /* on progress */
    },
    onSuccess: (_file: any, _res: any) => {
      /* on success */
    },
    onFailed: (file: any, res: any) => {
      console.error(`'${file.name}' upload failed`, res)
    },
    onError: (file: any, err: any, res: any) => {
      /* on error */
      /* on timeout */
      console.error(`'${file.name}' upload error`, res)
    },

    // 自定义插入图片，用户配置
    // customInsert: (res, insertFn) => {},

    // 自定义上传图片，用户配置
    // customUpload: (file, insertFn) => {},

    // 自定义上传适配器，默认仍使用内置 Uppy
    // uploadAdapter: ({ config, editor }) => ({ addFiles() {}, upload: async () => {} }),

    // 小于 xxx 就插入 base64
    base64LimitSize: 0,

    // 自定义选择，并上传图片，如：图床 （用户配置）
    // customBrowseAndUpload: insertFn => {},
  }
}
