/**
 * @description helper fns
 * @author wangfupeng
 */

import { createUploader, IDomEditor } from '@wangeditor-next/editor'

import { AttachmentElement } from '../custom-types'
import {
  genUploadAttachmentMenuConfig,
  IUploadConfigForAttachment,
} from './config'

function getUploadAttachmentMenuConfig(editor: IDomEditor): IUploadConfigForAttachment {
  const defaultConfig = genUploadAttachmentMenuConfig()
  const menuConfig = editor.getMenuConfig('uploadAttachment') as Partial<IUploadConfigForAttachment>

  return {
    ...defaultConfig,
    ...(menuConfig || {}),
  }
}

/**
 * 插入 attachment 节点
 * @param fileName fileName
 * @param link link
 */
export function insertAttachment(editor: IDomEditor, fileName: string, link: string) {
  if (!fileName || !link) { return }

  // 还原选区
  editor.restoreSelection()

  // 插入节点
  const attachmentElem: AttachmentElement = {
    type: 'attachment',
    fileName,
    link,
    children: [{ text: '' }],
  }

  editor.insertNode(attachmentElem)
  editor.move(1)

  // 回调
  const { onInsertedAttachment } = getUploadAttachmentMenuConfig(editor)

  if (onInsertedAttachment) { onInsertedAttachment(attachmentElem) }
}

// 存储 editor uploader 的关系 - 缓存 uploader ，不重复创建
const EDITOR_TO_UPLOADER_MAP = new WeakMap<IDomEditor, any>()

/**
 * 获取 uploader 实例（并通过 editor 缓存）
 * @param editor editor
 */
function getUploader(editor: IDomEditor) {
  let uploader = EDITOR_TO_UPLOADER_MAP.get(editor)

  if (uploader != null) { return uploader }

  const menuConfig = getUploadAttachmentMenuConfig(editor)
  const {
    customInsert,
    onError,
    onFailed,
    onProgress,
    onSuccess,
  } = menuConfig

  // 上传完成之后
  const successHandler = (file: any, res: any) => {
    // 预期 res 格式：
    // 成功：{ errno: 0, data: { url } }
    // 失败：{ errno: !0, message: '失败信息' }
    if (customInsert) {
      customInsert(res, file, (fileName: string, link: string) => insertAttachment(editor, fileName, link))
      onSuccess(file, res)
      return
    }

    const { errno = 1, data = {} } = res || {}

    if (errno !== 0) {
      onFailed(file, res)
      return
    }

    const { url = '' } = data as { url?: string }

    insertAttachment(editor, file?.name || '', url)
    onSuccess(file, res)
  }

  // progress 显示进度条
  const progressHandler = (progress: number) => {
    editor.showProgressBar(progress)

    if (onProgress) { onProgress(progress) }
  }

  // onError 提示错误
  const errorHandler = (file: any, err: any, res: any) => {
    onError(file, err, res)
  }

  uploader = createUploader(
    {
      ...menuConfig,
      onProgress: progressHandler,
      onSuccess: successHandler,
      onError: errorHandler,
    } as any,
    editor,
  )

  EDITOR_TO_UPLOADER_MAP.set(editor, uploader)

  return uploader
}

/**
 * 上传文件
 * @param editor editor
 * @param files files
 */
async function uploadFile(editor: IDomEditor, files: File[]) {
  const uploader = getUploader(editor)
  const uploadList = files.map(file => ({
    name: file.name,
    type: file.type,
    size: file.size,
    data: file,
  }))

  uploader.addFiles(uploadList)
  await uploader.upload()
}

/**
 * 上传附件文件
 * @param editor editor
 * @param files files
 */
export async function uploadAttachments(
  editor: IDomEditor,
  files: FileList | File[] | null,
) {
  if (files == null) { return }
  const fileList = Array.prototype.slice.call(files) as File[]

  // 获取菜单配置
  const { customUpload } = getUploadAttachmentMenuConfig(editor)
  const uploadFileList: File[] = []

  // 按顺序上传
  for await (const file of fileList) {
    if (customUpload) {
      // 自定义上传
      await customUpload(
        file,
        (fileName: string, link: string) => insertAttachment(editor, fileName, link),
        editor,
      )
    } else {
      // 默认上传
      uploadFileList.push(file)
    }
  }

  if (uploadFileList.length > 0) {
    await uploadFile(editor, uploadFileList)
  }
}
