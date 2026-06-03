import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const getEditable = (page: Page) => page.locator('[data-testid="editor-textarea"] [contenteditable="true"]')

const getToolbarMenu = (page: Page, menuKey: string) => page
  .getByTestId('editor-toolbar')
  .locator(`[data-menu-key="${menuKey}"]`)

const focusEditor = async (page: Page) => {
  await getEditable(page).click()
}

const clearEditor = async (page: Page) => {
  await focusEditor(page)
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
}

const typeInEditor = async (page: Page, text: string) => {
  await clearEditor(page)
  await page.keyboard.type(text)
}

const selectAll = async (page: Page) => {
  await focusEditor(page)
  await page.keyboard.press('Control+A')
}

const waitForMenuEnabled = async (page: Page, menuKey: string) => {
  const menu = getToolbarMenu(page, menuKey)

  await expect(menu).not.toHaveClass(/disabled/)
  return menu
}

const setEditorHtml = async (page: Page, html: string) => {
  await page.evaluate(value => {
    const editor = (window as any).wangEditorExampleBridge?.editor

    if (!editor) {
      throw new Error('[smoke] editor instance is not ready')
    }

    editor.setHtml(value)
  }, html)
}

const runDividerUndoImeScenario = async (page: Page) => {
  const pageErrors: string[] = []

  page.on('pageerror', err => {
    pageErrors.push(err?.stack || err?.message || String(err))
  })

  await focusEditor(page)
  await waitForMenuEnabled(page, 'divider')
  await getToolbarMenu(page, 'divider').click()

  await waitForMenuEnabled(page, 'undo')
  await getToolbarMenu(page, 'undo').click()

  await page.evaluate(() => {
    const el = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]') as HTMLElement | null

    if (!el) {
      throw new Error('editable not found')
    }

    el.focus()
    const selection = window.getSelection()

    if (!selection) {
      throw new Error('selection not found')
    }

    const range = document.createRange()

    range.selectNodeContents(el)
    range.collapse(false)
    selection.removeAllRanges()
    selection.addRange(range)

    const fire = (event: Event) => el.dispatchEvent(event)

    fire(new CompositionEvent('compositionstart', { data: '' }))
    fire(new InputEvent('beforeinput', {
      inputType: 'insertCompositionText',
      data: 'ni',
      bubbles: true,
      cancelable: true,
    }))
    fire(new InputEvent('input', {
      inputType: 'insertCompositionText',
      data: 'ni',
      bubbles: true,
    }))
    fire(new CompositionEvent('compositionupdate', { data: 'ni' }))
    fire(new CompositionEvent('compositionend', { data: '你' }))
  })

  await page.waitForTimeout(320)
  await selectAll(page)

  const selectionSnapshot = await page.evaluate(() => {
    const selection = window.getSelection()

    return {
      text: selection?.toString() || '',
      rangeCount: selection?.rangeCount || 0,
    }
  })

  await expect(page.getByTestId('editor-html')).toContainText('你')
  await expect(page.locator('.w-e-text-placeholder')).toBeHidden()
  expect(selectionSnapshot.rangeCount).toBeGreaterThan(0)
  expect(selectionSnapshot.text).toContain('你')

  const fatalErrors = pageErrors.filter(msg => {
    if (msg.includes('Cannot resolve a Slate node from DOM node')) { return true }
    if (msg.includes('Cannot resolve a DOM point from Slate point')) { return true }
    return false
  })

  expect(fatalErrors).toEqual([])
}

test.describe('Cross Browser Smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/default-mode.html')
    await page.getByTestId('btn-create').click()
    await expect(getEditable(page)).toBeVisible()
  })

  test('creates editor', async ({ page }) => {
    await expect(page.getByTestId('editor-toolbar')).toHaveAttribute('data-w-e-toolbar', 'true')
    await expect(page.getByTestId('editor-textarea')).toHaveAttribute('data-w-e-textarea', 'true')
    await expect(page.locator('#w-e-textarea-1')).toContainText('一行标题')
  })

  test('updates html when typing', async ({ page }) => {
    await typeInEditor(page, 'smoke-text')
    await expect(page.getByTestId('editor-html')).toContainText('smoke-text')
  })

  test('applies bold formatting', async ({ page }) => {
    await typeInEditor(page, 'format text')
    await selectAll(page)
    await waitForMenuEnabled(page, 'bold')
    await getToolbarMenu(page, 'bold').click()

    await expect(page.getByTestId('editor-html')).toContainText('<strong>')
  })

  test('creates a bulleted list', async ({ page }) => {
    await typeInEditor(page, 'list item')
    await selectAll(page)
    await waitForMenuEnabled(page, 'bulletedList')
    await getToolbarMenu(page, 'bulletedList').click()

    await expect(page.getByTestId('editor-html')).toContainText('<ul>')
    await expect(page.getByTestId('editor-html')).toContainText('<li>list item</li>')
  })

  test('inserts a table', async ({ page }) => {
    await setEditorHtml(page, '<p>table anchor</p>')
    await page.locator('[data-testid="editor-textarea"] p').first().click()
    await waitForMenuEnabled(page, 'insertTable')
    await getToolbarMenu(page, 'insertTable').click()
    await page.locator('.w-e-panel-content-table').waitFor({ state: 'visible' })
    await page.locator('.w-e-panel-content-table td').first().click()

    await expect(page.getByTestId('editor-html')).toContainText('<table')
  })

  test('undoes and redoes changes', async ({ page }) => {
    await typeInEditor(page, 'undo text')
    await expect(page.getByTestId('editor-html')).toContainText('undo text')

    await waitForMenuEnabled(page, 'undo')
    await getToolbarMenu(page, 'undo').click()
    await expect(page.getByTestId('editor-html')).not.toContainText('undo text')

    await waitForMenuEnabled(page, 'redo')
    await getToolbarMenu(page, 'redo').click()
    await expect(page.getByTestId('editor-html')).toContainText('undo text')
  })

  test('regression #892: divider -> undo -> composition should stay stable', async ({ page }) => {
    await runDividerUndoImeScenario(page)
  })
})
