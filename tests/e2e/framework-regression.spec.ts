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

    test(`${target.name}: regression #564 malformed span+p html should not throw`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)

      const malformedHtml = '<p><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">这是一</span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><p><br></p></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">这是二</span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><p><br></p></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">这是三</span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><p><br></p></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;"><p><br></p></span><span style="color: rgb(0, 0, 0); font-size: medium; font-family: -webkit-standard;">这是四</span></p>'

      const snapshot = await page.evaluate(({ html }) => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml(html)
        const output = editor.getHtml()
        const hasInlineNestedParagraph = /<span[^>]*>\s*<p/i.test(output)
        const root = document.querySelector('[data-testid="editor-textarea"]')
        const nestedParagraphInSpanCount = root?.querySelectorAll('span p').length ?? 0

        editor.focus()
        editor.insertText('1')
        editor.deleteBackward('character')

        return {
          output,
          outputAfterEdit: editor.getHtml(),
          hasInlineNestedParagraph,
          nestedParagraphInSpanCount,
        }
      }, { html: malformedHtml })

      expect(snapshot.hasInlineNestedParagraph).toBe(false)
      expect(snapshot.nestedParagraphInSpanCount).toBe(0)
      expect(snapshot.outputAfterEdit).toBe(snapshot.output)
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

    test(`${target.name}: setHtml in-table focus should keep single table and stable output`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)

      const firstHtml = `
        <table border="1" cellspacing="0" width="100%">
          <tbody>
            <tr>
              <td style="font-size: 14px; color: #fed865; vertical-align: middle; text-align: center; background-color: #44739f;">A1</td>
              <td>B1</td>
            </tr>
          </tbody>
        </table>
        <p><br></p>
      `
      const secondHtml = `
        <table border="1" cellspacing="0" width="100%">
          <tbody>
            <tr>
              <td style="font-size: 14px; color: #fed865; vertical-align: middle; text-align: center; background-color: #44739f;">A2</td>
              <td>B2</td>
            </tr>
          </tbody>
        </table>
        <p><br></p>
      `

      await page.evaluate(({ html }) => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const normalizeHtml = (value: string) => value.replace(/\s+/g, ' ').trim()

        editor.setHtml(html)
        const afterFirstSet = normalizeHtml(editor.getHtml())

        editor.setHtml(html)
        const afterSecondSet = normalizeHtml(editor.getHtml())

        globalWindow.setHtmlStableFlag = afterFirstSet === afterSecondSet
        globalWindow.setHtmlTableCountAfterFirst = (afterFirstSet.match(/<table/gi) || []).length
        globalWindow.setHtmlTableCountAfterSecond = (afterSecondSet.match(/<table/gi) || []).length

        const tableIndex = editor.children.findIndex((node: any) => node?.type === 'table')

        if (tableIndex < 0) {
          throw new Error('table node not found')
        }

        editor.select({
          anchor: { path: [tableIndex, 0, 0, 0], offset: 0 },
          focus: { path: [tableIndex, 0, 0, 0], offset: 1 },
        })
      }, { html: firstHtml })

      await page.waitForTimeout(120)

      await page.evaluate(({ html }) => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml(html)
      }, { html: secondHtml })

      await page.waitForTimeout(160)

      const snapshot = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor
        const root = document.querySelector('[data-testid="editor-textarea"]') as HTMLElement | null
        const tableElements = Array.from(root?.querySelectorAll('table') || [])
        const nestedTableElements = Array.from(root?.querySelectorAll('table table') || [])
        const firstCell = tableElements[0]?.querySelector('tr td, tr th') as HTMLElement | null
        const modelTableCount = (editor?.children || []).filter((node: any) => node?.type === 'table').length
        const currentHtml = editor?.getHtml?.() || ''

        return {
          stableBetweenRepeatedSetHtml: !!globalWindow.setHtmlStableFlag,
          tableCountAfterFirstSet: Number(globalWindow.setHtmlTableCountAfterFirst || 0),
          tableCountAfterSecondSet: Number(globalWindow.setHtmlTableCountAfterSecond || 0),
          currentHtmlTableCount: (currentHtml.match(/<table/gi) || []).length,
          modelTableCount,
          domTableCount: tableElements.length,
          nestedTableCount: nestedTableElements.length,
          firstCellText: (firstCell?.textContent || '').replace(/\s+/g, ''),
          firstCellStyle: firstCell?.getAttribute('style') || '',
        }
      })

      expect(snapshot.stableBetweenRepeatedSetHtml).toBe(true)
      expect(snapshot.tableCountAfterFirstSet).toBe(1)
      expect(snapshot.tableCountAfterSecondSet).toBe(1)
      expect(snapshot.currentHtmlTableCount).toBe(1)
      expect(snapshot.modelTableCount).toBe(1)
      expect(snapshot.domTableCount).toBe(1)
      expect(snapshot.nestedTableCount).toBe(0)
      expect(snapshot.firstCellText).toBe('A2')
      expect(snapshot.firstCellStyle).toContain('background-color')
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #621 heading default font-size should clear pasted inline size`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)

      await page.evaluate(async () => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml(`
          <h2><span style="font-size: 16px;">公众号标题</span></h2>
          <p><br></p>
        `)
        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 80)
        })

        const headingIndex = editor.children.findIndex((node: any) => node?.type === 'header2')

        if (headingIndex < 0) {
          throw new Error('header2 node not found')
        }

        const headingTextNode = editor.children?.[headingIndex]?.children?.[0] || {}
        const text = String(headingTextNode.text || '')
        const endOffset = Math.max(text.length, 1)
        const editable = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]')
        const headingLeaf = editable?.querySelector('h2 [data-slate-string="true"]') as HTMLElement | null

        if (!headingLeaf) {
          throw new Error('heading leaf dom not found')
        }

        globalWindow.issue621BeforeSize = Number.parseFloat(window.getComputedStyle(headingLeaf).fontSize || '0')
        globalWindow.issue621BeforeModelFontSize = String(headingTextNode.fontSize || '')

        editor.select({
          anchor: { path: [headingIndex, 0], offset: 0 },
          focus: { path: [headingIndex, 0], offset: endOffset },
        })
      })

      const fontSizeMenu = getToolbarMenu(page, 'fontSize').first()
      const hasFontSizeMenu = await fontSizeMenu.count()

      if (hasFontSizeMenu > 0) {
        await expect(fontSizeMenu).not.toHaveClass(/disabled/)
        await fontSizeMenu.click()
        await page.locator('.w-e-select-list:visible li[data-value=""]').first().click()
      } else {
        await page.evaluate(() => {
          const globalWindow = window as any
          const editor = globalWindow.wangEditorExampleBridge?.editor
            || globalWindow.vue2Editor
            || globalWindow.vue3Editor
            || globalWindow.reactEditor

          if (!editor) {
            throw new Error('editor not ready')
          }

          // Wrapper demos may not expose fontSize menu in toolbar.
          editor.removeMark('fontSize')
        })
      }

      await page.waitForTimeout(160)

      const snapshot = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const headingIndex = editor.children.findIndex((node: any) => node?.type === 'header2')
        const headingTextNode = headingIndex >= 0 ? (editor.children?.[headingIndex]?.children?.[0] || {}) : {}
        const editable = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]')
        const heading = editable?.querySelector('h2') as HTMLElement | null
        const headingLeaf = editable?.querySelector('h2 [data-slate-string="true"]') as HTMLElement | null
        const html = editor.getHtml?.() || ''

        return {
          beforeSize: Number(globalWindow.issue621BeforeSize || 0),
          beforeModelFontSize: String(globalWindow.issue621BeforeModelFontSize || ''),
          afterSize: Number.parseFloat(headingLeaf ? window.getComputedStyle(headingLeaf).fontSize || '0' : '0'),
          leafStyle: headingLeaf?.getAttribute('style') || '',
          modelFontSize: String(headingTextNode.fontSize || ''),
          html,
          headingText: (heading?.textContent || '').trim(),
        }
      })

      expect(snapshot.headingText).toContain('公众号标题')
      expect(snapshot.beforeModelFontSize).toBe('16px')
      expect(snapshot.beforeSize).toBeGreaterThan(0)
      expect(snapshot.afterSize).toBeGreaterThan(snapshot.beforeSize)
      expect(snapshot.leafStyle).not.toContain('font-size')
      expect(snapshot.modelFontSize).toBe('')
      expect(snapshot.html).toContain('<h2>')
      expect(snapshot.html).not.toMatch(/<span[^>]*style="[^"]*font-size/i)
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: table multi-cell bold should affect only selected cells`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)

      await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml(`
          <table style="width: 100%;">
            <tbody>
              <tr><td>A</td><td>B</td></tr>
              <tr><td>C</td><td>D</td></tr>
            </tbody>
          </table>
          <p><br></p>
        `)

        const tableIndex = editor.children.findIndex((node: any) => node?.type === 'table')

        if (tableIndex < 0) {
          throw new Error('table node not found')
        }

        editor.select({
          anchor: { path: [tableIndex, 0, 0, 0], offset: 0 },
          focus: { path: [tableIndex, 0, 1, 0], offset: 1 },
        })
      })

      await page.waitForTimeout(150)

      const selectionState = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const tableSelection = editor.getTableSelection?.() || []

        return {
          tableSelectionRows: tableSelection.length,
          selectedCells: tableSelection.flat().length,
        }
      })
      const boldMenu = getToolbarMenu(page, 'bold').first()

      expect(selectionState.tableSelectionRows).toBeGreaterThanOrEqual(1)
      expect(selectionState.selectedCells).toBeGreaterThanOrEqual(2)
      await expect(boldMenu).not.toHaveClass(/disabled/)

      await boldMenu.click()
      await page.waitForTimeout(180)

      const markState = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const tableIndex = editor.children.findIndex((node: any) => node?.type === 'table')

        if (tableIndex < 0) {
          throw new Error('table node not found after bold')
        }

        const getCellTextNode = (row: number, col: number) => {
          return editor.children?.[tableIndex]?.children?.[row]?.children?.[col]?.children?.[0] || {}
        }

        return {
          aBold: !!getCellTextNode(0, 0).bold,
          bBold: !!getCellTextNode(0, 1).bold,
          cBold: !!getCellTextNode(1, 0).bold,
          dBold: !!getCellTextNode(1, 1).bold,
        }
      })

      expect(markState.aBold).toBe(true)
      expect(markState.bBold).toBe(true)
      expect(markState.cBold).toBe(false)
      expect(markState.dBold).toBe(false)
      expect(pageErrors).toEqual([])
    })
  }
})
