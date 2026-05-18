import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

type Target = {
  name: string
  url: string
  needCreate?: boolean
}

const MIN_COLUMN_WIDTH = 60

const targets: Target[] = [
  {
    name: 'html-core',
    url: '/examples/default-mode.html',
    needCreate: true,
  },
  {
    name: 'vue2-wrapper',
    url: '/examples/framework-vue2.html',
  },
  {
    name: 'vue3-wrapper',
    url: 'http://127.0.0.1:3103/',
  },
  {
    name: 'react-wrapper',
    url: 'http://127.0.0.1:3102/',
  },
]

const WRAPPER_READY_TIMEOUT = process.env.CI ? 180_000 : 60_000

const getEditable = (page: Page) => page.locator('[data-testid="editor-textarea"] [contenteditable="true"]')

const getToolbarMenu = (page: Page, menuKey: string) => page.locator(`[data-testid="editor-toolbar"] [data-menu-key="${menuKey}"]`)

async function openTarget(page: Page, target: Target) {
  const isExternalWrapper = !target.needCreate && /^http:\/\/127\.0\.0\.1:31\d{2}\//.test(target.url)

  await page.goto(target.url, {
    // Vite wrapper demos may spend noticeable time on first module transform in CI.
    // Waiting for "commit" avoids hard-failing on a delayed full load event.
    waitUntil: isExternalWrapper ? 'commit' : 'load',
    timeout: isExternalWrapper ? WRAPPER_READY_TIMEOUT : 30_000,
  })
  if (target.needCreate) {
    await page.getByTestId('btn-create').click()
  }
  await expect(getEditable(page)).toBeVisible({
    timeout: isExternalWrapper ? WRAPPER_READY_TIMEOUT : 10_000,
  })
}

async function focusEditable(page: Page) {
  await getEditable(page).first().click({ force: true })
}

async function clearEditor(page: Page) {
  await focusEditable(page)
  await page.keyboard.press('Control+A')
  await page.keyboard.press('Backspace')
}

async function ensureMenuEnabled(page: Page, menuKey: string) {
  const menu = getToolbarMenu(page, menuKey).first()
  const tryEnable = async (attempt: number): Promise<void> => {
    if (attempt >= 10) { return }
    const className = await menu.getAttribute('class')

    if (!className?.includes('disabled')) { return }

    const textNode = page.locator('[data-testid="editor-textarea"] [data-slate-node="text"]:visible').first()
    const textNodeCount = await textNode.count()

    if (textNodeCount > 0) {
      await textNode.click({ force: true })
    } else {
      await focusEditable(page)
    }
    await page.waitForTimeout(80)

    await tryEnable(attempt + 1)
  }

  await tryEnable(0)

  await expect(menu).not.toHaveClass(/disabled/)
  return menu
}

async function create2x2Table(page: Page) {
  const menu = await ensureMenuEnabled(page, 'insertTable')

  await menu.click()
  const tablePanel = page.locator('.w-e-panel-content-table:visible').last()
  const twoByTwoCell = tablePanel.locator('td[data-x="1"][data-y="1"]')
  const hasTwoByTwoCell = await twoByTwoCell.count()

  if (hasTwoByTwoCell > 0) {
    await twoByTwoCell.click()
  } else {
    await tablePanel.locator('td').nth(3).click()
  }
  await page.waitForTimeout(220)
}

async function getLastTableWidths(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const tables = Array.from(document.querySelectorAll('[data-testid="editor-textarea"] table.table'))
    const lastTable = tables[tables.length - 1]

    if (!lastTable) { return [] }
    return Array.from(lastTable.querySelectorAll('col')).map(col => {
      return Number(col.getAttribute('width') || 0)
    })
  })
}

async function dragLastTableFirstBorder(page: Page, deltaX: number): Promise<boolean> {
  const widths = await getLastTableWidths(page)
  const table = page.locator('[data-testid="editor-textarea"] table.table').last()
  const tableRect = await table.boundingBox()

  if (!tableRect || widths.length === 0) { return false }

  await page.mouse.move(tableRect.x + widths[0], tableRect.y + 20)
  await page.waitForTimeout(140)

  const hotzone = page
    .locator('[data-testid="editor-textarea"] .column-resizer')
    .last()
    .locator('.column-resizer-item')
    .first()
    .locator('.resizer-line-hotzone')
  const hotzoneRect = await hotzone.boundingBox()

  if (!hotzoneRect) { return false }

  await page.mouse.move(hotzoneRect.x + hotzoneRect.width / 2, hotzoneRect.y + hotzoneRect.height / 2)
  await page.mouse.down()
  await page.mouse.move(
    hotzoneRect.x + hotzoneRect.width / 2 + deltaX,
    hotzoneRect.y + hotzoneRect.height / 2,
  )
  await page.mouse.up()
  await page.waitForTimeout(240)

  return true
}

test.describe('Framework parity regression', () => {
  test.describe.configure({ timeout: process.env.CI ? 240_000 : 90_000 })

  for (const target of targets) {
    test(`${target.name}: ime composition should not throw`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)
      await page.keyboard.type('abc')
      await page.keyboard.press('Control+A')

      await page.evaluate(() => {
        const el = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]')

        if (!el) {
          throw new Error('editable not found')
        }

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

      await page.waitForTimeout(360)
      await expect(getEditable(page).first()).toContainText('你')
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: table resize flow should be consistent`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)
      await page.keyboard.type('outside anchor')
      await create2x2Table(page)

      const before = await getLastTableWidths(page)

      await page
        .locator('[data-testid="editor-textarea"] table.table')
        .last()
        .locator('tr:nth-child(1) > *:nth-child(1)')
        .click({ force: true })
      const dragged = await dragLastTableFirstBorder(page, 60)
      const afterDrag = await getLastTableWidths(page)

      const beforeFirst = before[0] || 0
      const afterFirst = afterDrag[0] || 0
      const resized = afterFirst > beforeFirst
      const clampedAtMinWidth = beforeFirst <= MIN_COLUMN_WIDTH && afterFirst === beforeFirst

      expect(dragged).toBe(true)
      expect(beforeFirst).toBeGreaterThan(0)
      expect(resized || clampedAtMinWidth).toBe(true)
      expect(pageErrors).toEqual([])
    })
  }
})
