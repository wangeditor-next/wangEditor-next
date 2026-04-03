/**
 * @description upload video
 * @author wangfupeng
 */

import {
  createUploader, IDomEditor, IUploader,
  IUploadFile, IUploadResultFile,
} from '@wangeditor-next/core'

import insertVideo from './insert-video'

function getMenuConfig(editor: IDomEditor) {
  // 获取配置，见 `./config.js`
  return editor.getMenuConfig('uploadVideo')
}

// 存储 editor uploader 的关系 - 缓存 uploader ，不重复创建
const EDITOR_TO_UPLOADER_MAP = new WeakMap<IDomEditor, IUploader>()

/**
 * 获取 uploader 实例（并通过 editor 缓存）
 * @param editor editor
 */
function getUploader(editor: IDomEditor): IUploader {
  let uploader = EDITOR_TO_UPLOADER_MAP.get(editor)

  if (uploader != null) { return uploader }

  const menuConfig = getMenuConfig(editor)
  const {
    onSuccess, onProgress, onFailed, customInsert, onError,
  } = menuConfig

  // 上传完成之后
  const successHandler = (file: IUploadResultFile, res: any) => {
    // 预期 res 格式：
    // 成功：{ errno: 0, data: { url, poster } }
    // 失败：{ errno: !0, message: '失败信息' }

    if (customInsert) {
      // 用户自定义插入视频，此时 res 格式可能不符合预期
      customInsert(res, (src, poster) => insertVideo(editor, src, poster))
      // success 回调
      onSuccess(file, res)
      return
    }

    const { errno = 1, data = {} } = res

    if (errno !== 0) {
      // failed 回调
      onFailed(file, res)
      return
    }

    const { url = '', poster = '' } = data

    insertVideo(editor, url, poster)

    // success 回调
    onSuccess(file, res)
  }

  // progress 显示进度条
  const progressHandler = (progress: number) => {
    editor.showProgressBar(progress)

    // 回调函数
    if (onProgress) { onProgress(progress) }
  }

  // onError 提示错误
  const errorHandler = (file: any, err: any, res: any) => {
    onError(file, err, res)
  }

  uploader = createUploader({
    ...menuConfig,
    onProgress: progressHandler,
    onSuccess: successHandler,
    onError: errorHandler,
  }, editor)
  EDITOR_TO_UPLOADER_MAP.set(editor, uploader)

  return uploader
}

/**
 * 上传视频文件
 * @param editor editor
 * @param file file
 */
async function uploadFile(editor: IDomEditor, files: File[]) {
  const uploader = getUploader(editor)
  const uploadList: IUploadFile[] = files.map(file => ({
    name: file.name,
    type: file.type,
    size: file.size,
    data: file,
  }))

  uploader.addFiles(uploadList)
  await uploader.upload()
}

export default async function (editor: IDomEditor, files: FileList | null) {
  if (files == null) { return }
  const fileList = Array.prototype.slice.call(files)

  const uploadFileList : File[] = []
  // 获取菜单配置
  const { customUpload } = getMenuConfig(editor)

  // 按顺序上传
  for await (const file of fileList) {
    // 上传
    if (customUpload) {
      // 自定义上传
      await customUpload(file, (src, poster) => insertVideo(editor, src, poster), editor)
    } else {
      uploadFileList.push(file)
    }
  }
  // 默认上传
  if (uploadFileList.length > 0) { await uploadFile(editor, uploadFileList) }
}
