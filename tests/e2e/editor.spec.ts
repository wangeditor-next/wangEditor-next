import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const getEditable = (page: Page) => page.locator('[data-testid="editor-textarea"] [contenteditable="true"]')

const getToolbarMenu = (page: Page, menuKey: string) => page.getByTestId('editor-toolbar').locator(`[data-menu-key="${menuKey}"]`)

const focusEditor = async (page: Page) => {
  const editable = getEditable(page)

  await editable.click()
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

const pasteText = async (page: Page, text: string) => {
  await clearEditor(page)
  const editable = getEditable(page)

  await editable.evaluate(
    (node: HTMLElement, value: string) => {
      const data = new DataTransfer()

      data.setData('text/plain', value)
      const event = new ClipboardEvent('paste', {
        clipboardData: data,
        bubbles: true,
        cancelable: true,
      })

      node.dispatchEvent(event)
    },
    text,
  )
}

const dropImage = async (page: Page) => {
  await clearEditor(page)
  const editable = getEditable(page)
  const box = await editable.boundingBox()

  if (!box) { return }
  const dropPoint = { clientX: box.x + box.width / 2, clientY: box.y + box.height / 2 }
  const dataTransfer = await page.evaluateHandle(() => new DataTransfer())

  await dataTransfer.evaluate(data => {
    const file = new File(['drag-image'], 'drag.png', { type: 'image/png' })

    data.items.add(file)
  })

  await page.dispatchEvent(
    '[data-testid="editor-textarea"] [contenteditable="true"]',
    'dragenter',
    { dataTransfer, ...dropPoint },
  )
  await page.dispatchEvent(
    '[data-testid="editor-textarea"] [contenteditable="true"]',
    'dragover',
    { dataTransfer, ...dropPoint },
  )
  await page.dispatchEvent(
    '[data-testid="editor-textarea"] [contenteditable="true"]',
    'drop',
    { dataTransfer, ...dropPoint },
  )
}

test.describe('Basic Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/default-mode.html')
    await page.getByTestId('btn-create').click()
  })

  test('create editor', async ({ page }) => {
    await expect(page.getByTestId('editor-toolbar')).toHaveAttribute('data-w-e-toolbar', 'true')
    await expect(page.getByTestId('editor-textarea')).toHaveAttribute('data-w-e-textarea', 'true')
    await expect(page.locator('#w-e-textarea-1')).toContainText('一行标题')
  })

  test('updates html when typing', async ({ page }) => {
    await typeInEditor(page, 'e2e-text')
    await expect(page.getByTestId('editor-html')).toContainText('e2e-text')
  })

  test('applies bold and italic formatting', async ({ page }) => {
    await typeInEditor(page, 'format text')
    await selectAll(page)
    await waitForMenuEnabled(page, 'bold')
    await getToolbarMenu(page, 'bold').click()
    await waitForMenuEnabled(page, 'italic')
    await getToolbarMenu(page, 'italic').click()

    await expect(page.getByTestId('editor-html')).toContainText('<strong>')
    await expect(page.getByTestId('editor-html')).toContainText('<em>')
  })

  test('creates a bulleted list item', async ({ page }) => {
    await typeInEditor(page, 'list item')
    await selectAll(page)
    await waitForMenuEnabled(page, 'bulletedList')
    await getToolbarMenu(page, 'bulletedList').click()

    await expect(page.getByTestId('editor-html')).toContainText('<ul>')
    await expect(page.getByTestId('editor-html')).toContainText('<li>list item</li>')
  })

  test('creates a numbered list item', async ({ page }) => {
    await typeInEditor(page, 'numbered item')
    await selectAll(page)
    await waitForMenuEnabled(page, 'numberedList')
    await getToolbarMenu(page, 'numberedList').click()

    await expect(page.getByTestId('editor-html')).toContainText('<ol>')
    await expect(page.getByTestId('editor-html')).toContainText('<li>numbered item</li>')
  })

  test('creates a todo item', async ({ page }) => {
    await typeInEditor(page, 'todo item')
    await selectAll(page)
    await waitForMenuEnabled(page, 'todo')
    await getToolbarMenu(page, 'todo').click()

    await expect(page.getByTestId('editor-html')).toContainText('data-w-e-type="todo"')
    await expect(page.getByTestId('editor-html')).toContainText('todo item')
  })

  test('deletes a table row', async ({ page }) => {
    await focusEditor(page)
    await waitForMenuEnabled(page, 'insertTable')
    await getToolbarMenu(page, 'insertTable').click()
    await page.locator('.w-e-panel-content-table').waitFor({ state: 'visible' })
    await page.locator('.w-e-panel-content-table td[data-x="1"][data-y="1"]').click()

    await expect(page.locator('[data-testid="editor-textarea"] table tr')).toHaveCount(2)
    await page.locator('[data-testid="editor-textarea"] table td').first().click()
    await page.locator('.w-e-hover-bar [data-menu-key="deleteTableRow"]').click({ force: true })

    await expect(page.locator('[data-testid="editor-textarea"] table tr')).toHaveCount(1)
  })

  test('deletes a table column', async ({ page }) => {
    await focusEditor(page)
    await waitForMenuEnabled(page, 'insertTable')
    await getToolbarMenu(page, 'insertTable').click()
    await page.locator('.w-e-panel-content-table').waitFor({ state: 'visible' })
    await page.locator('.w-e-panel-content-table td[data-x="1"][data-y="1"]').click()

    await expect(page.locator('[data-testid="editor-textarea"] table tr')).toHaveCount(2)
    await expect(
      page.locator('[data-testid="editor-textarea"] table tr').first().locator('th, td'),
    ).toHaveCount(2)

    await page.locator('[data-testid="editor-textarea"] table td').first().click()
    await page.locator('.w-e-hover-bar [data-menu-key="deleteTableCol"]').click({ force: true })

    await expect(
      page.locator('[data-testid="editor-textarea"] table tr').first().locator('th, td'),
    ).toHaveCount(1)
  })

  test('pastes plain text', async ({ page }) => {
    await pasteText(page, 'pasted text')

    await expect(page.getByTestId('editor-html')).toContainText('pasted text')
  })

  test('handles image drag and drop', async ({ page }) => {
    await dropImage(page)

    await expect(page.getByTestId('editor-html')).toContainText('data:image')
  })

  test('undoes and redoes changes', async ({ page }) => {
    await typeInEditor(page, 'undo text')
    await expect(page.getByTestId('editor-html')).toContainText('undo text')

    await waitForMenuEnabled(page, 'undo')
    await page.locator('[data-menu-key="undo"]').click()
    await expect(page.getByTestId('editor-html')).not.toContainText('undo text')

    await waitForMenuEnabled(page, 'redo')
    await page.locator('[data-menu-key="redo"]').click()
    await expect(page.getByTestId('editor-html')).toContainText('undo text')
  })

  test('inserts a table', async ({ page }) => {
    await focusEditor(page)
    await waitForMenuEnabled(page, 'insertTable')
    await getToolbarMenu(page, 'insertTable').click()
    await page.locator('.w-e-panel-content-table').waitFor({ state: 'visible' })
    await page.locator('.w-e-panel-content-table td').first().click()

    await expect(page.getByTestId('editor-html')).toContainText('<table')
  })

  test('uploads an image as base64', async ({ page }) => {
    await clearEditor(page)

    const groupImage = await waitForMenuEnabled(page, 'group-image')

    await groupImage.hover()
    const groupPanel = groupImage.locator('..').locator('.w-e-bar-item-menus-container')

    await groupPanel.waitFor({ state: 'visible' })
    await groupPanel.locator('[data-menu-key="uploadImage"]').click({ force: true })
    await page
      .locator('input[type="file"]')
      .last()
      .setInputFiles({
        name: 'e2e.png',
        mimeType: 'image/png',
        buffer: Buffer.from([1, 2, 3, 4]),
      })

    await expect(page.getByTestId('editor-html')).toContainText('data:image')
  })

  test('creates a code block', async ({ page }) => {
    await typeInEditor(page, 'code line')
    await selectAll(page)
    await waitForMenuEnabled(page, 'codeBlock')
    await getToolbarMenu(page, 'codeBlock').click()

    await expect(page.getByTestId('editor-html')).toContainText('<pre>')
    await expect(page.getByTestId('editor-html')).toContainText('<code')
  })

  test('toggles readOnly via button', async ({ page }) => {
    await expect(page.locator('#w-e-textarea-1')).toHaveAttribute('contenteditable', 'true')
    await page.getByTestId('btn-toggle-enable').dispatchEvent('mousedown')
    await expect(page.locator('#w-e-textarea-1')).toHaveAttribute('contenteditable', 'false')

    await page.getByTestId('btn-toggle-enable').dispatchEvent('mousedown')
    await expect(page.locator('#w-e-textarea-1')).toHaveAttribute('contenteditable', 'true')
  })

  test('toggles full screen mode', async ({ page }) => {
    const textareaContainer = page.getByTestId('editor-textarea').locator('..')

    await getToolbarMenu(page, 'fullScreen').click()
    await expect(textareaContainer).toHaveClass(/w-e-full-screen-container/)

    await getToolbarMenu(page, 'fullScreen').click()
    await page.waitForTimeout(250)
    await expect(textareaContainer).not.toHaveClass(/w-e-full-screen-container/)
  })
})
