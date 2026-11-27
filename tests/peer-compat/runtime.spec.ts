import { expect, type Page, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.waitForFunction(() => (window as any).peerCompat)
})

for (const framework of ['React', 'Vue']) {
  test(`${framework} published wrapper mounts, edits, updates and destroys`, async ({ page }) => {
    const errors: string[] = []

    page.on('pageerror', error => errors.push(error.message))
    await page.evaluate(name => (window as any).peerCompat[`mount${name}`](), framework)
    const key = framework.toLowerCase()
    const editable = page.locator(`#${key} [contenteditable=true]`)

    await expect(editable).toContainText('initial')
    await editable.press('End')
    await editable.pressSequentially(' typed')
    await expect(editable).toContainText('typed')
    await expect
      .poll(() => page.evaluate(name => (window as any).peerCompat.changes[name], key))
      .toBeGreaterThan(0)
    if (framework === 'React') {
      await page.evaluate(() => (window as any).peerCompat.updateReact(undefined))
      await expect(editable).toContainText('typed')
    }
    await page.evaluate(
      name => (window as any).peerCompat[`update${name}`]('<p>controlled</p>'),
      framework
    )
    await expect(editable).toHaveText('controlled')
    await expect(page.locator(`#${key} .w-e-toolbar`)).toHaveCount(1)
    await page.evaluate(name => (window as any).peerCompat[`unmount${name}`](), framework)
    await expect(editable).toHaveCount(0)
    expect(errors).toEqual([])
  })
}

const emptyHtml = '<p><br></p>'

function vueState(page: Page) {
  return page.evaluate(() => (window as any).peerCompat.vueState())
}

test('Vue clears nonempty initial content on the first external empty value', async ({ page }) => {
  await page.evaluate(() => (window as any).peerCompat.mountVue())
  const editable = page.locator('#vue [contenteditable=true]')

  await expect(editable).toHaveText('initial')
  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: '<p>initial</p>',
      html: '<p>initial</p>',
      created: ['<p>initial</p>'],
      updates: [],
      changes: [],
    })
  await page.evaluate(() => (window as any).peerCompat.updateVue(''))
  await expect(editable).toHaveText('')
  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: emptyHtml,
      html: emptyHtml,
      updates: [emptyHtml],
      changes: [emptyHtml],
    })
})

test('Vue applies an external model update from the parent mounted hook', async ({ page }) => {
  const updated = '<p>mounted</p>'

  await page.evaluate(
    html => (window as any).peerCompat.mountVue({ mountedModels: [html] }),
    updated
  )
  await expect(page.locator('#vue [contenteditable=true]')).toHaveText('mounted')
  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: updated,
      html: updated,
      created: [updated],
      updates: [updated],
      changes: [updated],
    })
})

test('Vue applies only the last model update from multiple ticks before creation', async ({
  page,
}) => {
  const mountedModels = ['<p>first</p>', '<p>second</p>', '']

  await page.evaluate(
    models => (window as any).peerCompat.mountVue({ mountedModels: models, deferCreated: true }),
    mountedModels
  )
  await expect(page.locator('#vue [contenteditable=true]')).toHaveText('')
  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: emptyHtml,
      html: emptyHtml,
      created: [emptyHtml],
      updates: [emptyHtml],
      changes: [emptyHtml],
      mountedUpdates: mountedModels.map(model => ({ model, created: false })),
    })
})

test('Vue keeps initial default HTML precedence and skips an equal external value', async ({
  page,
}) => {
  const defaultHtml = '<p>default HTML</p>'

  await page.evaluate(
    html =>
      (window as any).peerCompat.mountVue({
        defaultHtml: html,
        defaultContent: [{ type: 'paragraph', children: [{ text: 'default content' }] }],
      }),
    defaultHtml
  )
  await expect(page.locator('#vue [contenteditable=true]')).toHaveText('default HTML')
  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: '<p>initial</p>',
      html: defaultHtml,
      created: [defaultHtml],
      updates: [],
      changes: [],
    })
  await page.evaluate(async html => {
    const api = (window as any).peerCompat

    await api.updateVue(html)
    await api.updateVue(html)
  }, defaultHtml)
  expect(await vueState(page)).toMatchObject({
    model: defaultHtml,
    html: defaultHtml,
    updates: [],
    changes: [],
  })
})

test('Vue model writeback preserves the caret and undo history after user input', async ({
  page,
}) => {
  await page.evaluate(() => (window as any).peerCompat.mountVue())
  const editable = page.locator('#vue [contenteditable=true]')

  await expect(editable).toHaveText('initial')
  await editable.press('End')
  const before = await vueState(page)

  await editable.pressSequentially('X')
  await expect(editable).toHaveText('initialX')
  const edited = '<p>initialX</p>'
  const point = { path: [0, 0], offset: 8 }

  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: edited,
      html: edited,
      selection: { anchor: point, focus: point },
      updates: [...before.updates, edited],
      changes: [...before.changes, edited],
    })
  await page.evaluate(async html => {
    const api = (window as any).peerCompat

    await api.updateVue(html)
    await api.updateVue(html)
    api.editors.vue.undo()
  }, edited)
  await expect(editable).toHaveText('initial')
  await expect
    .poll(() => vueState(page))
    .toMatchObject({
      model: '<p>initial</p>',
      html: '<p>initial</p>',
      updates: [...before.updates, edited, '<p>initial</p>'],
      changes: [...before.changes, edited, '<p>initial</p>'],
    })
})

test('Vue applies a previous emitted value after a new edit changes the editor', async ({
  page,
}) => {
  await page.evaluate(() => (window as any).peerCompat.mountVue({ writeback: false }))
  const editable = page.locator('#vue [contenteditable=true]')
  const edited = '<p>initialX</p>'

  await expect(editable).toHaveText('initial')
  await editable.press('End')
  await editable.pressSequentially('X')
  await expect.poll(() => vueState(page)).toMatchObject({ model: '<p>initial</p>', html: edited })
  const interleaved = await page.evaluate(async html => {
    const api = (window as any).peerCompat
    const parentUpdate = api.updateVue(html)
    const editor = api.editors.vue

    editor.insertText('Y')
    const localHtml = editor.getHtml()

    await parentUpdate
    return localHtml
  }, edited)

  expect(interleaved).toBe('<p>initialXY</p>')
  await expect(editable).toHaveText('initialX')
  await expect.poll(() => vueState(page)).toMatchObject({ model: edited, html: edited })
})

for (const mode of ['inline', 'class']) {
  test(`${mode} editing, history and saved HTML remain compatible`, async ({ page }) => {
    const result = await page.evaluate(styleMode => {
      const host = document.createElement('div')

      document.body.appendChild(host)
      const editor = (window as any).peerCompat.createEditor({
        selector: host,
        html: '<p><strong>bold</strong> text</p><table><tbody><tr><td>cell</td></tr></tbody></table><p>end</p>',
        config: { textStyleMode: styleMode },
      })
      const before = editor.getHtml()

      // Imported table defaults normalize CSS colors and measured widths on save.
      // Compare canonical saved Slate, while also preserving the first HTML output.
      editor.setHtml(before)
      const content = JSON.stringify(editor.children)

      editor.setHtml(before)
      const after = editor.getHtml()
      const restored = JSON.stringify(editor.children)

      editor.select({ anchor: { path: [0, 1], offset: 5 }, focus: { path: [0, 1], offset: 5 } })
      editor.insertText('added')
      const edited = editor.getText()

      editor.undo()
      const undone = editor.getText()

      editor.redo()
      const redone = editor.getText()

      editor.destroy()
      return { before, after, content, restored, edited, undone, redone }
    }, mode)

    expect(result.after).toBe(result.before)
    expect(result.restored).toBe(result.content)
    expect(result.edited).toContain('added')
    expect(result.undone).not.toContain('added')
    expect(result.redone).toBe(result.edited)
  })
}

for (const status of [200, 500]) {
  test(`real upload handles HTTP ${status} with existing config and callbacks`, async ({
    page,
  }) => {
    const requests: string[] = []

    await page.route('**/__upload*', route => {
      requests.push(route.request().postDataBuffer()!.toString())
      expect(route.request().headers()['x-token']).toBe('123')
      return route.fulfill({ status, json: { errno: status === 200 ? 0 : 1 } })
    })
    const result = await page.evaluate(async () => {
      const success: string[] = []
      const failed: string[] = []
      const uploader = (window as any).peerCompat.createUploader({
        server: '/__upload',
        fieldName: 'image',
        meta: { folder: 'test' },
        headers: () => ({ 'x-token': 123 }),
        xhrConfig: { shouldRetry: () => false },
        onSuccess: (file: any) => success.push(file.name),
        onError: (file: any) => failed.push(file.name),
      })

      try {
        const data = new File(['contents'], 'file.png', { type: 'image/png' })

        uploader.addFiles([{ data, name: data.name, size: data.size, type: data.type }])
        await uploader.upload()
        return { success, failed }
      } finally {
        if (uploader.destroy) {
          uploader.destroy()
        } else {
          uploader.close()
        }
      }
    })

    expect(result.success).toEqual(status === 200 ? ['file.png'] : [])
    expect(result.failed).toEqual(status === 200 ? [] : ['file.png'])
    expect(requests.length).toBeGreaterThan(0)
    expect(requests[0]).toContain('name="image"; filename="file.png"')
    expect(requests[0]).toContain('name="folder"')
  })
}
