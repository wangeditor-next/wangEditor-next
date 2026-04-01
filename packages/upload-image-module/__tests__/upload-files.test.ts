import * as basicModules from '@wangeditor-next/basic-modules'
import * as core from '@wangeditor-next/core'
import { afterEach } from 'vitest'

import createEditor from '../../../tests/utils/create-editor'
import uploadImages from '../src/module/upload-images'

afterEach(() => {
  vi.restoreAllMocks()
})

function mockFile(filename: string) {
  const file = new File(['123'], filename)

  return file
}

describe('Upload image menu upload files util', () => {
  test('uploadImages should do nothing if give null value to fileList argument', async () => {
    const editor = createEditor()
    const res = await uploadImages(editor, null)

    expect(res).toBeUndefined()
  })

  test('uploadImages should invoke customUpload if give customUpload to config', async () => {
    const fn = vi.fn()
    const uploadAdapter = vi.fn()
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadImage: {
            customUpload: fn,
            uploadAdapter,
          },
        },
      },
    })

    await uploadImages(editor, [mockFile('test.jpg')] as unknown as FileList)

    expect(fn).toBeCalled()
    expect(uploadAdapter).not.toBeCalled()
  })

  test('uploadImages should insert image with base64 string if file size less than base64LimitSize config', async () => {
    const fn = vi.fn()
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadImage: {
            customUpload: fn,
            base64LimitSize: 10,
          },
        },
      },
    })

    const mockReadAsDataURL = vi.spyOn(FileReader.prototype, 'readAsDataURL')

    await uploadImages(editor, [mockFile('test.jpg')] as unknown as FileList)

    expect(mockReadAsDataURL).toBeCalled()
  })

  test('uploadImages should invoke core createUploader if not give customUpload to config', async () => {
    const fn = vi.fn().mockImplementation(() => ({
      addFile: vi.fn(),
      addFiles: vi.fn(),
      upload: vi.fn(),
    }) as any)
    const editor = createEditor()

    vi.spyOn(core, 'createUploader').mockImplementation(fn)

    await uploadImages(editor, [mockFile('test.jpg')] as unknown as FileList)

    expect(fn).toBeCalled()
  })

  test('uploadImages should invoke uploadAdapter if configured', async () => {
    const addFiles = vi.fn()
    const upload = vi.fn(async () => undefined)
    const uploadAdapter = vi.fn(() => ({ addFiles, upload }))
    const file = mockFile('adapter.jpg')
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadImage: {
            uploadAdapter,
          },
        },
      },
    })

    await uploadImages(editor, [file] as unknown as FileList)

    expect(uploadAdapter).toHaveBeenCalledWith({
      config: expect.objectContaining({ uploadAdapter }),
      editor,
    })
    expect(addFiles).toHaveBeenCalledWith([expect.objectContaining({
      name: 'adapter.jpg',
      data: file,
    })])
    expect(upload).toHaveBeenCalledTimes(1)
  })

  test('uploadImages reuses cached uppy instance for the same editor', async () => {
    const createUploader = vi.fn().mockImplementation(() => ({
      addFiles: vi.fn(),
      upload: vi.fn(),
    }))
    const editor = createEditor()

    vi.spyOn(core, 'createUploader').mockImplementation(createUploader)

    await uploadImages(editor, [mockFile('first.jpg')] as unknown as FileList)
    await uploadImages(editor, [mockFile('second.jpg')] as unknown as FileList)

    expect(createUploader).toHaveBeenCalledTimes(1)
  })

  test('default upload inserts legacy array data and forwards progress and errors', async () => {
    const onSuccess = vi.fn()
    const onProgress = vi.fn()
    const onError = vi.fn()
    const showProgressBar = vi.fn()
    const file = mockFile('test.jpg')
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadImage: {
            onSuccess,
            onProgress,
            onError,
          },
        },
      },
    })

    editor.showProgressBar = showProgressBar

    const insertImageNodeSpy = vi.spyOn(basicModules, 'insertImageNode').mockImplementation(async () => {})

    vi.spyOn(core, 'createUploader').mockImplementation((options: any) => ({
      addFiles: vi.fn(),
      upload: vi.fn(async () => {
        options.onProgress(55)
        options.onSuccess(
          { name: file.name } as any,
          {
            errno: 0,
            data: [
              { url: 'https://img.test/a.png', alt: 'a', href: 'https://link.test/a' },
              { url: 'https://img.test/b.png' },
            ],
          },
        )
        options.onError({ name: file.name }, new Error('boom'), { errno: 1 })
      }),
    }) as any)

    await uploadImages(editor, [file] as unknown as FileList)

    expect(insertImageNodeSpy).toHaveBeenCalledTimes(2)
    expect(insertImageNodeSpy).toHaveBeenNthCalledWith(
      1,
      editor,
      'https://img.test/a.png',
      'a',
      'https://link.test/a',
    )
    expect(showProgressBar).toHaveBeenCalledWith(55)
    expect(onProgress).toHaveBeenCalledWith(55)
    expect(onSuccess).toHaveBeenCalled()
    expect(onError).toHaveBeenCalled()
  })

  test('default upload respects customInsert responses', async () => {
    const customInsert = vi.fn((res, insertFn) => {
      insertFn(res.data.url, 'custom-alt', 'https://custom.link')
    })
    const onSuccess = vi.fn()
    const file = mockFile('custom.jpg')
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadImage: {
            customInsert,
            onSuccess,
          },
        },
      },
    })

    const insertImageNodeSpy = vi.spyOn(basicModules, 'insertImageNode').mockImplementation(async () => {})

    vi.spyOn(core, 'createUploader').mockImplementation((options: any) => ({
      addFiles: vi.fn(),
      upload: vi.fn(async () => {
        options.onSuccess({ name: file.name } as any, {
          errno: 0,
          data: { url: 'https://img.test/custom.png' },
        })
      }),
    }) as any)

    await uploadImages(editor, [file] as unknown as FileList)

    expect(customInsert).toHaveBeenCalledTimes(1)
    expect(insertImageNodeSpy).toHaveBeenCalledWith(
      editor,
      'https://img.test/custom.png',
      'custom-alt',
      'https://custom.link',
    )
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  test('default upload forwards failed responses to onFailed', async () => {
    const onFailed = vi.fn()
    const file = mockFile('failed.jpg')
    const editor = createEditor({
      config: {
        MENU_CONF: {
          uploadImage: {
            onFailed,
          },
        },
      },
    })
    const insertImageNodeSpy = vi.spyOn(basicModules, 'insertImageNode').mockImplementation(async () => {})

    vi.spyOn(core, 'createUploader').mockImplementation((options: any) => ({
      addFiles: vi.fn(),
      upload: vi.fn(async () => {
        options.onSuccess({ name: file.name } as any, {
          errno: 1,
          message: 'failed',
        })
      }),
    }) as any)

    await uploadImages(editor, [file] as unknown as FileList)

    expect(insertImageNodeSpy).not.toHaveBeenCalled()
    expect(onFailed).toHaveBeenCalledTimes(1)
  })
})
