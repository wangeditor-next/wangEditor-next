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
})
