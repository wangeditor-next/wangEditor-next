import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

type PerfThresholds = {
  createMs: number
  setHtmlMs: number
  getHtmlMs: number
  insertTextMs: number
}

const getEditable = (page: Page) => page.locator('[data-testid="editor-textarea"] [contenteditable="true"]')

const getThreshold = (envName: string, fallback: number): number => {
  const raw = Number(process.env[envName])

  if (Number.isFinite(raw) && raw > 0) {
    return raw
  }

  return fallback
}

const PERF_THRESHOLDS: PerfThresholds = {
  createMs: getThreshold('PERF_CREATE_MS', 2500),
  setHtmlMs: getThreshold('PERF_SET_HTML_MS', 3500),
  getHtmlMs: getThreshold('PERF_GET_HTML_MS', 1200),
  insertTextMs: getThreshold('PERF_INSERT_TEXT_MS', 1800),
}

const median = (list: number[]): number => {
  if (list.length === 0) { return 0 }

  const sorted = [...list].sort((a, b) => a - b)
  const middle = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2
  }

  return sorted[middle]
}

const createLargeHtml = (paragraphCount: number): string => {
  const paragraphs: string[] = []

  for (let i = 0; i < paragraphCount; i += 1) {
    paragraphs.push(`<p>row-${i} ${'benchmark-content '.repeat(8)}</p>`)
  }

  return paragraphs.join('')
}

const repeatAsync = async <T>(times: number, task: (index: number) => Promise<T>): Promise<T[]> => {
  const results: T[] = []

  const run = async (index: number): Promise<void> => {
    if (index >= times) { return }

    const result = await task(index)

    results.push(result)
    await run(index + 1)
  }

  await run(0)

  return results
}

const createEditor = async (page: Page): Promise<number> => {
  await page.goto('/examples/default-mode.html')

  const start = Date.now()

  await page.getByTestId('btn-create').click()
  await expect(getEditable(page)).toBeVisible()

  return Date.now() - start
}

const setEditorHtml = async (page: Page, html: string): Promise<void> => {
  await page.evaluate(value => {
    const editor = (window as any).wangEditorExampleBridge?.editor

    if (!editor) {
      throw new Error('[perf] editor instance is not ready')
    }

    editor.setHtml(value)
  }, html)
}

const getEditorHtmlDuration = async (page: Page): Promise<{ duration: number; length: number }> => page.evaluate(() => {
  const editor = (window as any).wangEditorExampleBridge?.editor

  if (!editor) {
    throw new Error('[perf] editor instance is not ready')
  }

  const start = performance.now()
  const html = editor.getHtml()
  const end = performance.now()

  return {
    duration: end - start,
    length: html.length,
  }
})

test.describe('Editor Performance Baseline', () => {
  test('keeps median latency within threshold', async ({ page }) => {
    test.setTimeout(120_000)

    const createRuns = await repeatAsync(3, async () => {
      const duration = await createEditor(page)

      await page.getByTestId('btn-destroy').click()

      return duration
    })

    await createEditor(page)

    const baseHtml = createLargeHtml(280)
    const setAndGetRuns = await repeatAsync(3, async i => {
      const marker = `perf-marker-${i}-${Date.now()}`
      const payload = `${baseHtml}<p>${marker}</p>`
      const setStart = Date.now()

      await setEditorHtml(page, payload)
      await expect(page.getByTestId('editor-html')).toContainText(marker)

      const getHtmlResult = await getEditorHtmlDuration(page)

      expect(getHtmlResult.length).toBeGreaterThan(1000)

      return {
        setHtmlMs: Date.now() - setStart,
        getHtmlMs: getHtmlResult.duration,
      }
    })

    const setHtmlRuns = setAndGetRuns.map(item => item.setHtmlMs)
    const getHtmlRuns = setAndGetRuns.map(item => item.getHtmlMs)
    const insertTextContent = 'benchmark-input '.repeat(300)

    const insertRuns = await repeatAsync(3, async () => {
      await setEditorHtml(page, '<p><br></p>')
      await getEditable(page).click()

      const insertStart = Date.now()

      await page.keyboard.insertText(insertTextContent)
      await expect(page.getByTestId('editor-html')).toContainText('benchmark-input benchmark-input')

      return Date.now() - insertStart
    })

    expect(median(createRuns)).toBeLessThanOrEqual(PERF_THRESHOLDS.createMs)
    expect(median(setHtmlRuns)).toBeLessThanOrEqual(PERF_THRESHOLDS.setHtmlMs)
    expect(median(getHtmlRuns)).toBeLessThanOrEqual(PERF_THRESHOLDS.getHtmlMs)
    expect(median(insertRuns)).toBeLessThanOrEqual(PERF_THRESHOLDS.insertTextMs)
  })
})
