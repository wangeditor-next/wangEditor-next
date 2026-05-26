import * as editorExports from '@wangeditor-next/editor'

import createEditor from '../../../tests/utils/create-editor'
import { uploadAttachments } from '../src/module/menu/helper'

describe('upload attachment helper', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  function mockFile(filename: string) {
    return new File(['123'], filename)
  }

  it('should do nothing when files is null', async () => {
    const editor = createEditor()

    await expect(uploadAttachments(editor, null)).resolves.toBeUndefined()
  })

  it('should invoke customUpload when provided', async () => {
    const customUpload = vi.fn(async () => undefined)
    const editor = createEditor()

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      customUpload,
    } as any)

    await uploadAttachments(editor, [mockFile('custom.zip')] as unknown as FileList)

    expect(customUpload).toHaveBeenCalledTimes(1)
  })

  it('should call createUploader when using default upload', async () => {
    const createUploader = vi
      .spyOn(editorExports, 'createUploader')
      .mockImplementation(() => ({
        addFiles: vi.fn(),
        upload: vi.fn(async () => undefined),
      } as any))
    const editor = createEditor()

    await uploadAttachments(editor, [mockFile('default.zip')] as unknown as FileList)

    expect(createUploader).toHaveBeenCalledTimes(1)
  })

  it('default upload should support customInsert', async () => {
    const customInsert = vi.fn((res, file, insertFn) => {
      insertFn(`custom-${file.name}`, res.data.url)
    })
    const onSuccess = vi.fn()
    const editor = createEditor()

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      customInsert,
      onSuccess,
    } as any)

    vi.spyOn(editorExports, 'createUploader').mockImplementation((options: any) => ({
      addFiles: vi.fn(),
      upload: vi.fn(async () => {
        options.onSuccess(
          { name: 'custom.zip' },
          {
            errno: 0,
            data: {
              url: 'https://example.com/custom.zip',
            },
          },
        )
      }),
    }) as any)

    await uploadAttachments(editor, [mockFile('custom.zip')] as unknown as FileList)

    expect(customInsert).toHaveBeenCalledTimes(1)
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('default upload should forward failed responses to onFailed', async () => {
    const onFailed = vi.fn()
    const editor = createEditor()

    vi.spyOn(editor, 'getMenuConfig').mockReturnValue({
      onFailed,
    } as any)

    vi.spyOn(editorExports, 'createUploader').mockImplementation((options: any) => ({
      addFiles: vi.fn(),
      upload: vi.fn(async () => {
        options.onSuccess(
          { name: 'failed.zip' },
          {
            errno: 1,
            message: 'failed',
          },
        )
      }),
    }) as any)

    await uploadAttachments(editor, [mockFile('failed.zip')] as unknown as FileList)

    expect(onFailed).toHaveBeenCalledTimes(1)
  })
})
