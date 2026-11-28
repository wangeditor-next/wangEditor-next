import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'

// Use the browser's real desktop UA. The smoke projects otherwise emulate a Windows UA on Linux.
test.use({
  userAgent: async ({ contextOptions }, provide) => {
    await provide(contextOptions.userAgent)
  },
})

async function snapshot(page: Page) {
  return page.evaluate(() => {
    const editor = (window as any).wangEditorExampleBridge.editor
    const selection = window.getSelection()
    const cell = selection?.anchorNode?.parentElement?.closest('td')
    const row = cell?.parentElement as HTMLTableRowElement | null
    const anchor = editor.selection?.anchor

    return {
      point: anchor && [anchor.path[1], anchor.path[2], anchor.offset],
      dom: [row?.rowIndex, cell?.cellIndex, selection?.anchorOffset],
      html: editor.getHtml(),
      undos: editor.history.undos.length,
    }
  })
}

async function openTable(page: Page, cells: string[], row: number, offset: number) {
  await page.goto('/examples/default-mode.html')
  await page.getByTestId('btn-create').click()
  const rows = [0, 1, 2].map(r => {
    const content = cells.slice(r * 3, r * 3 + 3).map(text => `<td>${text}</td>`).join('')

    return `<tr>${content}</tr>`
  })

  await page.addStyleTag({ content: 'td { font-family: monospace }' })
  await page.evaluate(html => {
    (window as any).wangEditorExampleBridge.editor.setHtml(html)
  }, `<p>before</p><table><tbody>${rows.join('')}</tbody></table><p>after</p>`)
  const cell = page.getByTestId('editor-textarea').locator('td').nth(row * 3 + 1)
  const xy = await cell.locator('[data-slate-string]').evaluate((leaf, index) => {
    const range = leaf.ownerDocument.createRange()

    range.setStart(leaf.firstChild!, index)
    range.collapse(true)
    const rect = range.getBoundingClientRect()

    return { x: rect.left, y: (rect.top + rect.bottom) / 2 }
  }, offset)

  await page.mouse.click(xy.x, xy.y)
  await expect.poll(async () => (await snapshot(page)).point).toEqual([row, 1, offset])
}

test.beforeEach(({ browserName }) => {
  test.skip(browserName === 'webkit' || (browserName === 'chromium' && process.platform !== 'linux'),
    'Verified desktop engines for this navigation contract are Linux Chromium and Firefox')
})

for (const [key, row] of [['ArrowUp', 0], ['ArrowDown', 2]] as const) {
  test(`typing after ${key} edits only the adjacent cell in the same column`, async ({ page }) => {
    const cells = Array.from('ABCDEFGHI', c => `${c}123`)

    await openTable(page, cells, 1, 2)
    const before = await snapshot(page)

    await page.keyboard.press(key)
    await expect.poll(async () => {
      const state = await snapshot(page)

      return (state.dom[0] !== 1 || state.dom[1] !== 1)
        && state.point?.every((value: number, index: number) => value === state.dom[index])
    }).toBe(true)
    const navigated = await snapshot(page)

    await page.keyboard.type('Z')
    const expected = [...cells]
    const target = row * 3 + 1

    expected[target] = `${cells[target].slice(0, 2)}Z23`
    await expect(page.getByTestId('editor-textarea').locator('td')).toHaveText(expected)
    expect(navigated).toMatchObject({ point: [row, 1, 2], dom: [row, 1, 2], html: before.html, undos: before.undos })
    await expect.poll(async () => (await snapshot(page)).point).toEqual([row, 1, 3])

    await page.keyboard.press('ControlOrMeta+z')
    await expect.poll(() => snapshot(page)).toMatchObject({
      html: before.html, point: [row, 1, 2], dom: [row, 1, 2], undos: before.undos,
    })
    await page.keyboard.press('ControlOrMeta+Shift+z')
    await expect(page.getByTestId('editor-textarea').locator('td')).toHaveText(expected)
    await expect.poll(() => snapshot(page)).toMatchObject({ point: [row, 1, 3], dom: [row, 1, 3] })
  })
}

test('consecutive down arrows through a short cell preserve the engine contract', async ({
  page, browserName,
}) => {
  await openTable(page, ['A', 'abcdefgh', 'C', 'D', 'X', 'F', 'G', 'abcdefgh', 'I'], 0, 6)
  await page.keyboard.press('ArrowDown')
  await expect.poll(() => snapshot(page)).toMatchObject({ point: [1, 1, 1], dom: [1, 1, 1] })
  await page.keyboard.press('ArrowDown')
  const offset = browserName === 'firefox' ? 6 : 1

  await expect.poll(() => snapshot(page)).toMatchObject({
    point: [2, 1, offset], dom: [2, 1, offset],
  })
})

for (const layout of ['overlapping lines', 'hidden target']) {
  test(`ArrowDown keeps its native behavior with ${layout}`, async ({ page, browserName }) => {
    const cells = Array.from('ABCDEFGHI', c => `${c}123`)

    cells[4] = 'ABCDEFGHI'
    await openTable(page, cells, 1, 2)
    const table = page.getByTestId('editor-textarea').locator('table')

    if (layout === 'overlapping lines') {
      await page.addStyleTag({ content: [
        'td p, td span { font: 20px/8px monospace !important }',
        'td:nth-child(2) p { width: 5ch !important; word-break: break-all }',
      ].join('\n') })
      const overlaps = await table.locator('td').nth(4).locator('[data-slate-string]').evaluate(el => {
        const range = document.createRange()

        range.selectNodeContents(el)
        const [first, second] = Array.from(range.getClientRects())

        return !!second && second.top > first.top && second.top < first.bottom
      })

      expect(overlaps).toBe(true)
    } else {
      await page.addStyleTag({ content: 'tr:nth-child(3) td:nth-child(2) p { visibility: hidden }' })
    }
    await page.evaluate(() => {
      window.addEventListener('keydown', e => {
        (window as any).verticalArrowPrevented = e.defaultPrevented
      }, { once: true })
    })
    await page.keyboard.press('ArrowDown')
    expect(await page.evaluate(() => (window as any).verticalArrowPrevented)).toBe(false)

    if (browserName === 'chromium') {
      await page.keyboard.type('Z')
      const index = layout === 'overlapping lines' ? 4 : 5

      await expect(table.locator('td').nth(index)).toContainText('Z')
    }
  })
}
