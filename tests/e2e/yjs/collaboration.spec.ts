import type { Browser, BrowserContext, Locator, Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const NATIVE_URL = 'http://127.0.0.1:3110'
const REACT_URL = 'http://127.0.0.1:3111'
const VUE_URL = 'http://127.0.0.1:3112'

type ClientPair = {
  contexts: BrowserContext[]
  editors: Locator[]
  errors: string[]
  pages: Page[]
}

function roomName(label: string): string {
  return `${label}-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

async function openPair(browser: Browser, urls: string[], room: string): Promise<ClientPair> {
  const contexts = await Promise.all([browser.newContext(), browser.newContext()])
  const pages = await Promise.all(contexts.map(context => context.newPage()))
  const errors: string[] = []

  pages.forEach((page, index) => {
    page.on('pageerror', error => errors.push(`client ${index + 1}: ${error.message}`))
    page.on('console', message => {
      if (message.type() === 'error') {
        errors.push(`client ${index + 1} console: ${message.text()}`)
      }
    })
  })

  await Promise.all(
    pages.map((page, index) =>
      page.goto(`${urls[index]}?room=${room}`, { waitUntil: 'networkidle' })
    )
  )

  const editors = pages.map(page => page.locator('[contenteditable="true"]').first())

  await Promise.all(editors.map(editor => editor.waitFor({ state: 'visible' })))

  return { contexts, editors, errors, pages }
}

async function expectConverged(editors: Locator[]): Promise<string> {
  await expect
    .poll(async () => {
      const values = await Promise.all(editors.map(editor => editor.innerText()))

      return values[0] === values[1]
    })
    .toBe(true)

  return editors[0].innerText()
}

async function typeAtEnd(editor: Locator, text: string): Promise<void> {
  await editor.click()
  await editor.press('End')
  await editor.pressSequentially(text, { delay: 20 })
}

test('native JS syncs rich text and keeps undo local', async ({ browser }) => {
  const pair = await openPair(browser, [NATIVE_URL, NATIVE_URL], roomName('native'))
  const { contexts, editors, errors, pages } = pair

  try {
    expect((await expectConverged(editors)).trim()).toBe('')

    await typeAtEnd(editors[0], 'native-one')
    await expect(editors[1]).toHaveText('native-one')
    await typeAtEnd(editors[1], '-two')
    await expect(editors[0]).toHaveText('native-one-two')

    await pages[0].evaluate(() => {
      const offset = window.editor!.getText().length

      window.editor!.select({
        anchor: { path: [0, 0], offset },
        focus: { path: [0, 0], offset },
      })
      window.editor!.undoManager.stopCapturing()
      window.editor!.addMark('bold', true)
      window.editor!.insertText('LOCALUNDO')
      window.editor!.removeMark('bold')
      window.editor!.undoManager.stopCapturing()
    })
    await expect(editors[1]).toContainText('LOCALUNDO')
    await expect
      .poll(() => pages[1].evaluate(() => window.editor!.getHtml()))
      .toContain('<strong>LOCALUNDO</strong>')

    await pages[1].evaluate(() => {
      const paragraph = window.editor!.children[0] as { children: Array<{ text: string }> }
      const textIndex = paragraph.children.length - 1
      const offset = paragraph.children[textIndex].text.length

      window.editor!.select({
        anchor: { path: [0, textIndex], offset },
        focus: { path: [0, textIndex], offset },
      })
      window.editor!.removeMark('bold')
      window.editor!.insertText('REMOTEKEEP')
    })
    await expect(editors[0]).toContainText('REMOTEKEEP')
    await pages[0].evaluate(() => window.editor!.undo())

    const finalText = await expectConverged(editors)

    expect(finalText).toBe('native-one-twoREMOTEKEEP')
    expect(errors).toEqual([])
  } finally {
    await Promise.all(contexts.map(context => context.close()))
  }
})

for (const [label, urls] of [
  ['react', [REACT_URL, REACT_URL]],
  ['vue', [VUE_URL, VUE_URL]],
  ['react-vue', [REACT_URL, VUE_URL]],
] as const) {
  test(`${label} clients sync, converge, and render remote cursors`, async ({ browser }) => {
    const pair = await openPair(browser, [...urls], roomName(label))
    const { contexts, editors, errors, pages } = pair

    try {
      expect((await expectConverged(editors)).trim()).toBe('')

      await typeAtEnd(editors[0], 'FIRST')
      await expect(editors[1]).toHaveText('FIRST')
      await typeAtEnd(editors[1], 'SECOND')
      await expect(editors[0]).toHaveText('FIRSTSECOND')

      await Promise.all([typeAtEnd(editors[0], 'A'), typeAtEnd(editors[1], 'B')])
      const finalText = await expectConverged(editors)

      expect(finalText).toContain('FIRST')
      expect(finalText).toContain('SECOND')
      expect(finalText).toContain('A')
      expect(finalText).toContain('B')
      expect(finalText).toHaveLength('FIRSTSECONDAB'.length)

      await editors[0].click()
      await editors[0].press('Home')
      await expect(pages[1].locator('.absolute.text-xs.text-white')).toHaveCount(1)
      expect(errors).toEqual([])
    } finally {
      await Promise.all(contexts.map(context => context.close()))
    }
  })
}
