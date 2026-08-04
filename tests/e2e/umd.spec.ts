import { expect, test } from '@playwright/test'

test('loads the editor and ctrl-enter UMD bundles using their public globals', async ({ page }) => {
  const errors: string[] = []

  page.on('pageerror', error => errors.push(error.message))

  await page.goto('/examples/umd-plugin.html')

  await expect
    .poll(() => page.evaluate(() => (window as any).umdPluginSmoke))
    .toEqual({
      bound: true,
      defaultPrevented: true,
      insertBreakCalls: 1,
      loadedEditorGlobal: true,
      registered: true,
    })
  expect(errors).toEqual([])
})
