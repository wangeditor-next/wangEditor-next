import { expect, test } from '@playwright/test'

for (const entry of ['umd', 'esm'] as const) {
  test(`${entry} uploader sends each file with metadata and invokes success callbacks`, async ({
    page,
  }) => {
    const requests: Array<{ body: string; token: string | undefined; url: string }> = []
    const errors: string[] = []

    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/__upload*', async route => {
      const request = route.request()

      requests.push({
        body: request.postDataBuffer()!.toString(),
        token: request.headers()['x-upload-token'],
        url: request.url(),
      })
      await route.fulfill({ json: { errno: 0, data: { url: '/uploaded.png' } } })
    })
    await page.goto('/examples/default-mode.html')

    const result = await page.evaluate(async format => {
      const successes: Array<{ name: string; response: unknown }> = []
      const failures: string[] = []
      const progress: number[] = []
      let finishProgress: () => void
      const completedProgress = new Promise<void>(resolve => {
        finishProgress = resolve
      })
      const uploadModuleUrl = '/dist/upload.mjs'
      const api = format === 'umd' ? (window as any).wangEditor : await import(uploadModuleUrl)
      const uploader = api.createUploader({
        server: '/__upload',
        fieldName: 'image',
        meta: { folder: 'test' },
        metaWithUrl: true,
        headers: () => ({ 'x-upload-token': 123 }),
        onSuccess: (file: { name: string }, response: unknown) =>
          successes.push({ name: file.name, response }),
        onError: (file: { name: string }) => failures.push(file.name),
        onProgress: (value: number) => {
          progress.push(value)
          if (value === 100) {finishProgress()}
        },
      })

      try {
        uploader.addFiles(
          ['first.png', 'second.png'].map(name => {
            const data = new File(['image content'], name, { type: 'image/png' })

            return { name, type: data.type, size: data.size, data }
          })
        )
        await uploader.upload()
      await completedProgress
        return { successes, failures, progress }
      } finally {
        uploader.destroy()
      }
    }, entry)

    expect(result.failures).toEqual([])
    expect(result.successes.map(file => file.name).sort()).toEqual(['first.png', 'second.png'])
    result.successes.forEach(file =>
      expect(file.response).toEqual({ errno: 0, data: { url: '/uploaded.png' } })
    )
    expect(result.progress).toContain(100)
    expect(requests).toHaveLength(2)
    requests.forEach(request => {
      expect(request.url).toContain('folder=test')
      expect(request.token).toBe('123')
      expect(request.body).toContain('name="image"; filename=')
      expect(request.body).toContain('name="folder"')
      expect(request.body).toContain('image content')
    })
    expect(errors).toEqual([])
  })

  test(`${entry} uploader reports HTTP failures without invoking success`, async ({ page }) => {
    await page.route('**/__upload', route =>
      route.fulfill({ status: 500, json: { message: 'failed' } })
    )
    await page.goto('/examples/default-mode.html')

    const result = await page.evaluate(async format => {
      const successes: string[] = []
      const failures: Array<{ name: string; message: string }> = []
      const uploadModuleUrl = '/dist/upload.mjs'
      const api = format === 'umd' ? (window as any).wangEditor : await import(uploadModuleUrl)
      const uploader = api.createUploader({
        server: '/__upload',
        fieldName: 'image',
        xhrConfig: { shouldRetry: () => false },
        onSuccess: (file: { name: string }) => successes.push(file.name),
        onError: (file: { name: string }, error: Error) =>
          failures.push({ name: file.name, message: error.message }),
      })

      try {
        const data = new File(['image content'], 'failed.png', { type: 'image/png' })

        uploader.addFiles([{ name: data.name, type: data.type, size: data.size, data }])
        await uploader.upload()
        return { successes, failures }
      } finally {
        uploader.destroy()
      }
    }, entry)

    expect(result.successes).toEqual([])
    expect(result.failures).toHaveLength(1)
    expect(result.failures[0].name).toBe('failed.png')
    expect(result.failures[0].message).not.toBe('')
  })
}
