/**
 * @description uploader test
 * @author wangfupeng
 */

import nock from 'nock'

import createUploader from '../../src/upload/createUploader'
import { IUploadConfig } from '../../src/upload/interface'

const server = 'https://fake-endpoint.wangeditor-v5.com'

describe('uploader', () => {
  test('if should return Uppy object if invoke createUploader function', () => {
    const uppy = createUploader({
      server: '/upload',
      fieldName: 'file1',
      metaWithUrl: true,
      meta: {
        token: 'xxx',
      },
      onSuccess: (_file, _res) => { return undefined },
      onFailed: (_file, _res) => { return undefined },
      onError: (_file, _err, _res) => { return undefined },
    })

    expect(uppy).not.toBeNull()
  })

  test('it should throw can not get address error if not pass server option', () => {
    try {
      createUploader({
        fieldName: 'file1',
        metaWithUrl: false,
        onSuccess: (_file, _res) => { return undefined },
        onFailed: (_file, _res) => { return undefined },
        onError: (_file, _err, _res) => { return undefined },
      } as IUploadConfig)
    } catch (err: unknown) {
      expect((err as Error).message).toBe('Cannot get upload server address\n没有配置上传地址')
    }
  })

  test('it should throw can not get fileName error if not pass fileName option', () => {
    try {
      createUploader({
        server: '/upload',
        metaWithUrl: false,
        onSuccess: (_file, _res) => { return undefined },
        onFailed: (_file, _res) => { return undefined },
        onError: (_file, _err, _res) => { return undefined },
      } as IUploadConfig)
    } catch (err: unknown) {
      expect((err as Error).message).toBe('Cannot get fieldName\n没有配置 fieldName')
    }
  })

  test('it should invoke success callback if file be uploaded successfully', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .reply(200, {})
      .post('/')
      .reply(200, {})

    const fn = vi.fn()
    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: fn,
      onFailed: (_file, _res) => { return undefined },
      onError: (_file, _err, _res) => { return undefined },
    })

    // reference https://github.com/transloadit/uppy/blob/main/packages/%40uppy/xhr-upload/src/index.test.js
    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().then(() => {
      expect(fn).toBeCalled()
    })
  })

  test('it should invoke success callback for each file when uploading multiple files', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .times(2)
      .reply(200, {})
      .post('/')
      .times(2)
      .reply(200, {})

    const fn = vi.fn()
    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: fn,
      onFailed: (_file, _res) => { return undefined },
      onError: (_file, _err, _res) => { return undefined },
    })

    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })
    uppy.addFile({
      source: 'vi',
      name: 'bar.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().then(() => {
      expect(fn).toHaveBeenCalledTimes(2)
      expect(fn.mock.calls.map(([file]) => file.name)).toEqual(['foo.jpg', 'bar.jpg'])
    })
  })

  test('it should invoke error callback if file be uploaded error', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .reply(200, {})
      .post('/')
      .reply(200, {})

    const fn = vi.fn()

    console.error = fn

    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {
        throw new Error('test onSuccess error')
      },
      onFailed: (_file, _res) => { return undefined },
      onError: (_file, _err, _res) => { return undefined },
    })

    // reference https://github.com/transloadit/uppy/blob/main/packages/%40uppy/xhr-upload/src/index.test.js
    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().catch(_err => {
      expect(fn).toBeCalled()
    })
  })

  test('it should invoke onProgress callback if file be uploaded successfully', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .reply(200, {})
      .post('/')
      .reply(200, {})

    const fn = vi.fn()
    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {},
      onProgress: fn,
      onFailed: (_file, _res) => { return undefined },
      onError: (_file, _err, _res) => { return undefined },
    })

    // reference https://github.com/transloadit/uppy/blob/main/packages/%40uppy/xhr-upload/src/index.test.js
    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().then(() => {
      expect(fn).toBeCalled()
    })
  })

  test('it should invoke error callback if file be uploaded failed', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .reply(200, {})
      .post('/')
      .reply(400, {})

    const fn = vi.fn()
    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {},
      onFailed: (_file, _res) => { return undefined },
      onError: fn,
    })

    // reference https://github.com/transloadit/uppy/blob/main/packages/%40uppy/xhr-upload/src/index.test.js
    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().catch(() => {
      expect(fn).toBeCalled()
    })
  })

  test('it should invoke console.error method if file be uploaded failed and not pass onError option', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .reply(200, {})
      .post('/')
      .reply(400, {})

    const fn = vi.fn()

    console.error = fn
    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {},
      onFailed: (_file, _res) => { return undefined },
    } as any)

    // reference https://github.com/transloadit/uppy/blob/main/packages/%40uppy/xhr-upload/src/index.test.js
    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().catch(() => {
      expect(fn).toBeCalled()
    })
  })

  test('it should invoke console.error method if file be uploaded failed and pass onError option throw error', () => {
    nock(server)
      .defaultReplyHeaders({
        'access-control-allow-method': 'POST',
        'access-control-allow-origin': '*',
      })
      .options('/')
      .reply(200, {})
      .post('/')
      .reply(400, {})

    const fn = vi.fn()

    console.error = fn
    const uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {},
      onFailed: (_file, _res) => { return undefined },
      onError: () => {
        throw new Error('test onError error')
      },
    } as any)

    // reference https://github.com/transloadit/uppy/blob/main/packages/%40uppy/xhr-upload/src/index.test.js
    uppy.addFile({
      source: 'vi',
      name: 'foo.jpg',
      type: 'image/jpeg',
      data: new Blob([Buffer.alloc(8192)]),
    })

    return uppy.upload().catch(_err => {
      expect(fn).toBeCalled()
    })
  })

  test('it should invoke error callback if file size over max size', () => {
    const fn = vi.fn()
    const consoleFn = vi.fn()

    console.error = consoleFn
    let uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {},
      onFailed: (_file, _res) => { return undefined },
      onError: fn,
      maxFileSize: 5,
    })

    try {
      uppy.addFile({
        source: 'vi',
        name: 'foo.jpg',
        type: 'image/jpeg',
        data: new Blob([Buffer.alloc(8192)]),
      })
    } catch {
      expect(fn).toBeCalled()
    }

    uppy = createUploader({
      server,
      fieldName: 'file1',
      metaWithUrl: false,
      onSuccess: () => {},
      onFailed: (_file, _res) => { return undefined },
      onError: () => {
        throw new Error('test onError error')
      },
      maxFileSize: 5,
    })

    try {
      uppy.addFile({
        source: 'vi',
        name: 'foo.jpg',
        type: 'image/jpeg',
        data: new Blob([Buffer.alloc(8192)]),
      })
    } catch {
      expect(consoleFn).toBeCalled()
    }
  })
})
