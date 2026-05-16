/**
 * @description deprecated upload exports from core root entry
 */

import { createUploader, createUppyUploader } from '../../src/index'

const server = 'https://fake-endpoint.wangeditor-v5.com'

describe('core root upload exports', () => {
  test('keeps backward compatibility with deprecation warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const uploadAdapter = vi.fn(() => ({
      addFiles: vi.fn(),
      upload: vi.fn(async () => undefined),
    }))
    const baseConfig = {
      server,
      fieldName: 'file',
      metaWithUrl: false as const,
      onSuccess: (_file, _res) => { return undefined },
      onFailed: (_file, _res) => { return undefined },
      onError: (_file, _err, _res) => { return undefined },
    }

    createUploader({
      ...baseConfig,
      uploadAdapter,
    })
    createUploader({
      ...baseConfig,
      uploadAdapter,
    })

    createUppyUploader(baseConfig)
    createUppyUploader(baseConfig)

    const warningMessages = warnSpy.mock.calls.map(([message]) => String(message))
    const createUploaderWarnings = warningMessages.filter(msg => msg.includes('`createUploader`'))
    const createUppyUploaderWarnings = warningMessages.filter(msg => msg.includes('`createUppyUploader`'))

    expect(createUploaderWarnings).toHaveLength(1)
    expect(createUppyUploaderWarnings).toHaveLength(1)
  })
})
