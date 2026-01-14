import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

const getEditable = (page: Page) => page.locator('[data-testid="editor-textarea"] [contenteditable="true"]')

const setEditableText = async (page: Page, text: string) => {
  const editable = getEditable(page)

  await editable.click()
  await editable.fill(text)
}

const pasteText = async (page: Page, text: string) => {
  const editable = getEditable(page)

  await editable.click()
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
  const editable = getEditable(page)

  await editable.evaluate((node: HTMLElement) => {
    const data = new DataTransfer()
    const file = new File(['drag-image'], 'drag.png', { type: 'image/png' })

    data.items.add(file)
    const event = new DragEvent('drop', {
      dataTransfer: data,
      bubbles: true,
      cancelable: true,
    })

    node.dispatchEvent(event)
  })
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
    await setEditableText(page, 'e2e-text')
    await expect(page.getByTestId('editor-html')).toContainText('e2e-text')
  })

  test('applies bold and italic formatting', async ({ page }) => {
    await setEditableText(page, 'format text')
    await getEditable(page).selectText()

    await page.locator('[data-menu-key="bold"]').click()
    await page.locator('[data-menu-key="italic"]').click()

    await expect(page.getByTestId('editor-html')).toContainText('<strong>')
    await expect(page.getByTestId('editor-html')).toContainText('<em>')
  })

  test('creates a bulleted list item', async ({ page }) => {
    await setEditableText(page, 'list item')
    await page.locator('[data-menu-key="bulletedList"]').click()

    await expect(page.getByTestId('editor-html')).toContainText('<ul>')
    await expect(page.getByTestId('editor-html')).toContainText('<li>list item</li>')
  })

  test('creates a numbered list item', async ({ page }) => {
    await setEditableText(page, 'numbered item')
    await page.locator('[data-menu-key="numberedList"]').click()

    await expect(page.getByTestId('editor-html')).toContainText('<ol>')
    await expect(page.getByTestId('editor-html')).toContainText('<li>numbered item</li>')
  })

  test('creates a todo item', async ({ page }) => {
    await setEditableText(page, 'todo item')
    await page.locator('[data-menu-key="todo"]').click()

    await expect(page.getByTestId('editor-html')).toContainText('data-w-e-type="todo"')
    await expect(page.getByTestId('editor-html')).toContainText('todo item')
  })

  test('deletes a table row', async ({ page }) => {
    await getEditable(page).click()
    await page.locator('[data-menu-key="insertTable"]').click()
    await page.locator('.w-e-panel-content-table td[data-x="1"][data-y="1"]').click()

    await expect(page.locator('[data-testid="editor-textarea"] table tr')).toHaveCount(2)
    await page.locator('[data-testid="editor-textarea"] table td').first().click()
    await page.locator('.w-e-hover-bar [data-menu-key="deleteTableRow"]').click({ force: true })

    await expect(page.locator('[data-testid="editor-textarea"] table tr')).toHaveCount(1)
  })

  test('deletes a table column', async ({ page }) => {
    await getEditable(page).click()
    await page.locator('[data-menu-key="insertTable"]').click()
    await page.locator('.w-e-panel-content-table td[data-x="1"][data-y="1"]').click()

    await expect(
      page.locator('[data-testid="editor-textarea"] table tr').first().locator('td'),
    ).toHaveCount(2)

    await page.locator('[data-testid="editor-textarea"] table td').first().click()
    await page.locator('.w-e-hover-bar [data-menu-key="deleteTableCol"]').click({ force: true })

    await expect(
      page.locator('[data-testid="editor-textarea"] table tr').first().locator('td'),
    ).toHaveCount(1)
  })

  test('pastes plain text', async ({ page }) => {
    await setEditableText(page, '')
    await pasteText(page, 'pasted text')

    await expect(page.getByTestId('editor-html')).toContainText('pasted text')
  })

  test('handles image drag and drop', async ({ page }) => {
    await setEditableText(page, '')
    await dropImage(page)

    await expect(page.getByTestId('editor-html')).toContainText('data:image')
  })

  test('undoes and redoes changes', async ({ page }) => {
    await setEditableText(page, 'undo text')
    await expect(page.getByTestId('editor-html')).toContainText('undo text')

    await page.locator('[data-menu-key="undo"]').click()
    await expect(page.getByTestId('editor-html')).not.toContainText('undo text')

    await page.locator('[data-menu-key="redo"]').click()
    await expect(page.getByTestId('editor-html')).toContainText('undo text')
  })

  test('inserts a table', async ({ page }) => {
    await getEditable(page).click()
    await page.locator('[data-menu-key="insertTable"]').click()
    await page.locator('.w-e-panel-content-table td').first().click()

    await expect(page.getByTestId('editor-html')).toContainText('<table')
  })

  test('uploads an image as base64', async ({ page }) => {
    await setEditableText(page, '')

    await page.locator('[data-menu-key="uploadImage"]').click({ force: true })
    await page
      .locator('input[type="file"]')
      .last()
      .setInputFiles({
        name: 'e2e.png',
        mimeType: 'image/png',
        buffer: new Uint8Array([1, 2, 3, 4]),
      })

    await expect(page.getByTestId('editor-html')).toContainText('data:image')
  })

  test('creates a code block', async ({ page }) => {
    await setEditableText(page, 'code line')
    await getEditable(page).selectText()

    await page.locator('[data-menu-key="codeBlock"]').click()

    await expect(page.getByTestId('editor-html')).toContainText('<pre>')
    await expect(page.getByTestId('editor-html')).toContainText('<code>')
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

    await page.locator('[data-menu-key="fullScreen"]').click()
    await expect(textareaContainer).toHaveClass(/w-e-full-screen-container/)

    await page.locator('[data-menu-key="fullScreen"]').click()
    await page.waitForTimeout(250)
    await expect(textareaContainer).not.toHaveClass(/w-e-full-screen-container/)
  })
})
