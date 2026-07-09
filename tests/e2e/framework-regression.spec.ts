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

async function create2x2TableByApi(page: Page) {
  await page.evaluate(({ widthMode }) => {
    const globalWindow = window as any
    const editor = globalWindow.wangEditorExampleBridge?.editor
      || globalWindow.vue2Editor
      || globalWindow.vue3Editor
      || globalWindow.reactEditor

    if (!editor) {
      throw new Error('editor not ready')
    }

    editor.setHtml(`
      <table style="width: ${widthMode}; table-layout: fixed;">
        <colgroup>
          <col width="120">
          <col width="120">
        </colgroup>
        <tbody>
          <tr><td>1</td><td>2</td></tr>
          <tr><td>3</td><td>4</td></tr>
        </tbody>
      </table>
    `)
  }, { widthMode: 'auto' })
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

async function dispatchSyntheticFirstColumnResize(page: Page, deltaX: number): Promise<boolean> {
  return page.evaluate(({ delta }) => {
    const globalWindow = window as any
    const editor = globalWindow.wangEditorExampleBridge?.editor
      || globalWindow.vue2Editor
      || globalWindow.vue3Editor
      || globalWindow.reactEditor
    const table = document.querySelector('[data-testid="editor-textarea"] table.table') as HTMLElement | null
    const hotzone = document.querySelector(
      '[data-testid="editor-textarea"] .column-resizer .column-resizer-item:first-child .resizer-line-hotzone',
    ) as HTMLElement | null

    if (!editor || !table || !hotzone) { return false }

    const tableNode = (editor.children || []).find((node: any) => node?.type === 'table')

    if (!tableNode) { return false }

    const firstCol = table.querySelector('col')
    const firstWidth = Number(firstCol?.getAttribute('width') || 0)
    const tableRect = table.getBoundingClientRect()
    const startX = Math.round(tableRect.left + Math.max(firstWidth, 80))
    const startY = Math.round(tableRect.top + 10)

    tableNode.resizingIndex = 0
    tableNode.isHoverCellBorder = true
    tableNode.scrollWidth = Math.max(Math.round(tableRect.width), 1)

    hotzone.dispatchEvent(new MouseEvent('mousedown', {
      bubbles: true,
      clientX: startX,
      clientY: startY,
    }))
    window.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      clientX: startX + delta,
      clientY: startY,
    }))
    window.dispatchEvent(new MouseEvent('mouseup', {
      bubbles: true,
      clientX: startX + delta,
      clientY: startY,
    }))

    return true
  }, { delta: deltaX })
}

async function setTextareaWidthAndMeasureLastTable(
  page: Page,
  widthPx: number,
): Promise<{ containerWidth: number; tableWidth: number; tableStyleWidth: string }> {
  return page.evaluate(({ width }) => {
    const textarea = document.querySelector('[data-testid="editor-textarea"]') as HTMLElement | null

    if (!textarea) {
      throw new Error('editor textarea not found')
    }

    textarea.style.width = `${width}px`
    textarea.style.maxWidth = `${width}px`
    textarea.style.transition = 'none'

    const tables = Array.from(textarea.querySelectorAll('table.table')) as HTMLElement[]
    const table = tables[tables.length - 1] || null

    if (!table) {
      throw new Error('table not found')
    }

    const containerRect = textarea.getBoundingClientRect()
    const tableRect = table.getBoundingClientRect()

    return {
      containerWidth: containerRect.width,
      tableWidth: tableRect.width,
      tableStyleWidth: table.style.width || '',
    }
  }, { width: widthPx })
}

async function getFirstTableWidthMode(page: Page): Promise<string> {
  return page.evaluate(() => {
    const globalWindow = window as any
    const editor = globalWindow.wangEditorExampleBridge?.editor
      || globalWindow.vue2Editor
      || globalWindow.vue3Editor
      || globalWindow.reactEditor

    if (!editor) {
      throw new Error('editor not ready')
    }

    const tableNode = (editor.children || []).find((node: any) => node?.type === 'table')

    return String(tableNode?.width || '')
  })
}

async function setSelectedTableWidthMode(page: Page, width: '100%' | 'auto') {
  await page.evaluate(({ nextWidth }) => {
    const globalWindow = window as any
    const editor = globalWindow.wangEditorExampleBridge?.editor
      || globalWindow.vue2Editor
      || globalWindow.vue3Editor
      || globalWindow.reactEditor

    if (!editor) {
      throw new Error('editor not ready')
    }

    editor.setHtml(`
      <table style="width: ${nextWidth}; table-layout: fixed;">
        <colgroup>
          <col width="120">
          <col width="120">
        </colgroup>
        <tbody>
          <tr><td>1</td><td>2</td></tr>
          <tr><td>3</td><td>4</td></tr>
        </tbody>
      </table>
    `)
  }, { nextWidth: width })
  await page.waitForTimeout(220)
}

test.describe('Framework parity regression', () => {
  test.describe.configure({ timeout: process.env.CI ? 240_000 : 90_000 })

  test('react-wrapper: regression #907 Editor style should apply to the actual editor root', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await openTarget(page, targets.find(target => target.name === 'react-wrapper')!)

    const snapshot = await page.evaluate(() => {
      const host = document.querySelector('[data-testid="editor-textarea"] [data-w-e-textarea="true"]')
      const textContainer = host?.querySelector('.w-e-text-container')
      const scroll = host?.querySelector('.w-e-scroll')

      if (!host || !textContainer || !scroll) {
        throw new Error('react editor DOM not ready')
      }

      const read = (el: Element) => {
        const computedStyle = getComputedStyle(el)
        const rect = el.getBoundingClientRect()

        return {
          attrStyle: el.getAttribute('style') || '',
          height: rect.height,
          computedHeight: computedStyle.height,
          overflowY: computedStyle.overflowY,
        }
      }

      return {
        host: read(host),
        textContainer: read(textContainer),
        scroll: read(scroll),
      }
    })

    expect(snapshot.host.attrStyle).toContain('height: 360px')
    expect(snapshot.host.attrStyle).toContain('overflow-y: hidden')
    expect(snapshot.textContainer.height).toBeGreaterThan(300)
    expect(snapshot.scroll.height).toBeGreaterThan(300)
    expect(pageErrors).toEqual([])
  })

  test('vue3-wrapper: regression #919 production build should keep image hoverbar and paste order', async ({ page }) => {
    test.skip(
      process.env.PLAYWRIGHT_WRAPPER_PREVIEW !== '1',
      'regression #919 requires wrapper production preview',
    )

    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await openTarget(page, targets.find(target => target.name === 'vue3-wrapper')!)

    await page.evaluate(() => {
      const globalWindow = window as any
      const editor = globalWindow.vue3Editor

      if (!editor) {
        throw new Error('vue3 editor not ready')
      }

      editor.clear()
      editor.dangerouslyInsertHtml(
        '<p><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="tiny" /></p>',
      )
    })
    await page.locator('[data-testid="editor-textarea"] img').first().click({ force: true })
    await page.waitForTimeout(500)

    const imageState = await page.evaluate(() => {
      const visibleHoverbar = Array.from(document.querySelectorAll('.w-e-hover-bar')).find(el => {
        const style = window.getComputedStyle(el)
        const rect = el.getBoundingClientRect()

        return style.display !== 'none'
          && style.visibility !== 'hidden'
          && rect.width > 0
          && rect.height > 0
      })

      return {
        selectedImage: !!document.querySelector('.w-e-selected-image-container'),
        hoverbarVisible: !!visibleHoverbar,
        menuKeys: visibleHoverbar
          ? Array.from(visibleHoverbar.querySelectorAll('[data-menu-key]')).map(el => el.getAttribute('data-menu-key'))
          : [],
      }
    })

    expect(imageState.selectedImage).toBe(true)
    expect(imageState.hoverbarVisible).toBe(true)
    expect(imageState.menuKeys).toEqual(expect.arrayContaining([
      'imageWidth30',
      'editorImageSizeMenu',
      'editImage',
      'deleteImage',
    ]))

    await openTarget(page, targets.find(target => target.name === 'vue3-wrapper')!)

    const wordLikeHtml = `
      <html><body>
        <div class="WordSection1">
          <p class="MsoTitle"><span style="font-size:22pt;font-family:宋体">测试标题</span></p>
          <p class="MsoNormal"><span style="font-family:宋体">第一段内容</span></p>
          <p class="MsoNormal"><span style="font-family:宋体">第二段内容</span></p>
        </div>
      </body></html>`

    const pasteState = await page.evaluate(({ html }) => {
      const globalWindow = window as any
      const editor = globalWindow.vue3Editor

      if (!editor) {
        throw new Error('vue3 editor not ready')
      }

      editor.clear()
      editor.focus()

      const transfer = new DataTransfer()

      transfer.setData('text/html', html)
      transfer.setData('text/plain', '测试标题\n第一段内容\n第二段内容')
      editor.insertData(transfer)

      return {
        text: editor.getText(),
        children: editor.children.map((node: any) => {
          return Array.isArray(node.children)
            ? node.children.map((child: any) => child.text || '').join('')
            : ''
        }),
      }
    }, { html: wordLikeHtml })

    expect(pasteState.children).toEqual([
      '测试标题',
      '第一段内容',
      '第二段内容',
    ])
    expect(pasteState.text).toBe('测试标题\n第一段内容\n第二段内容')
    expect(pageErrors).toEqual([])
  })

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

    test(`${target.name}: regression #339 setHtml should keep emsp in styled span`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)

      const snapshot = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml('<p>2.<span style="font-family: MS-Mincho;">111&emsp;222</span></p>')

        const children = editor.children || []
        const paragraph = children[0] || {}
        const styledNode = paragraph?.children?.[1] || {}
        const html = editor.getHtml?.() || ''

        return {
          styledText: String(styledNode.text || ''),
          styledFontFamily: String(styledNode.fontFamily || ''),
          html,
        }
      })

      expect(snapshot.styledText).toBe('111 222')
      expect(snapshot.styledFontFamily).toBe('MS-Mincho')
      expect(snapshot.html).toContain('111 222')
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #441 ordered list selection text should match visual range`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)

      const listMenuSupport = await page.evaluate(() => {
        const menuKeys = Array.from(
          document.querySelectorAll('[data-testid="editor-toolbar"] [data-menu-key]'),
        ).map(el => el.getAttribute('data-menu-key') || '')

        return {
          hasNumberedList: menuKeys.includes('numberedList'),
          hasOrderedList: menuKeys.includes('orderedList'),
        }
      })

      let orderedListMenuKey = ''

      if (listMenuSupport.hasNumberedList) {
        orderedListMenuKey = 'numberedList'
      } else if (listMenuSupport.hasOrderedList) {
        orderedListMenuKey = 'orderedList'
      }

      test.skip(
        !orderedListMenuKey,
        `${target.name} demo toolbar does not expose ordered-list menu`,
      )

      const orderedListMenu = await ensureMenuEnabled(page, orderedListMenuKey)

      await orderedListMenu.click({ force: true })
      await page.keyboard.type('parent-item')
      await page.keyboard.press('Enter')
      await page.keyboard.type('child-item')
      await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const secondListItemIndex = (editor.children || []).findIndex((node: any, index: number) => {
          return index > 0 && node?.type === 'list-item'
        })

        if (secondListItemIndex < 0) {
          throw new Error('second list item not found')
        }

        editor.select({
          anchor: { path: [secondListItemIndex, 0], offset: 0 },
          focus: { path: [secondListItemIndex, 0], offset: 0 },
        })
        editor.handleTab?.()
      })
      await page.waitForTimeout(200)

      const didSelectPrefix = await page.evaluate(() => {
        const textArea = document.querySelector('[data-testid="editor-textarea"]') as HTMLElement | null
        const textNodes = Array.from(textArea?.querySelectorAll('[data-slate-string]') || []) as HTMLElement[]
        const parentText = textNodes.find(el => (el.textContent || '').trim() === 'parent-item')

        if (!parentText) { return false }

        const row = parentText.closest('div[style*="display: flex"]') as HTMLElement | null

        if (!row) { return false }
        const prefixNode = row.querySelector('[data-w-e-reserve]') as HTMLElement | null

        if (!prefixNode || !prefixNode.firstChild) { return false }

        const selection = window.getSelection()

        if (!selection) { return false }

        const range = document.createRange()

        range.setStart(prefixNode.firstChild, 0)
        range.setEnd(prefixNode.firstChild, prefixNode.textContent?.length || 0)
        selection.removeAllRanges()
        selection.addRange(range)
        document.dispatchEvent(new Event('selectionchange'))

        return true
      })

      expect(didSelectPrefix).toBe(true)
      await page.waitForTimeout(120)

      const snapshot = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const listItems = (editor.children || []).filter((node: any) => node?.type === 'list-item')
        const levels = listItems.map((node: any) => {
          return {
            level: Number(node?.level ?? -1),
            text: String(node?.children?.[0]?.text || ''),
          }
        })
        const selection = window.getSelection()

        return {
          levels,
          domSelectionText: selection?.toString() || '',
          editorSelectionText: editor.getSelectionText?.() || '',
          selection: editor.selection || null,
        }
      })

      expect(snapshot.levels.some(item => item.level === 1 && item.text.includes('child-item'))).toBe(true)
      expect(
        snapshot.editorSelectionText.length,
        JSON.stringify(snapshot),
      ).toBeGreaterThan(0)
      expect(snapshot.domSelectionText).toBe('1.')
      expect(snapshot.editorSelectionText.replace(/\s+/g, '')).toBe('parent-item')
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #610 image insertion should keep active font marks`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)

      const imageMenuSupport = await page.evaluate(() => {
        const menuKeys = Array.from(
          document.querySelectorAll('[data-testid="editor-toolbar"] [data-menu-key]'),
        ).map(el => el.getAttribute('data-menu-key') || '')

        return {
          hasGroupImage: menuKeys.includes('group-image'),
          hasInsertImage: menuKeys.includes('insertImage'),
        }
      })

      test.skip(
        !imageMenuSupport.hasGroupImage && !imageMenuSupport.hasInsertImage,
        `${target.name} demo toolbar does not expose image insertion menus`,
      )

      await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml('<p><span style="font-family: 微软雅黑; font-size: 14px;">M</span></p>')
        editor.select({
          anchor: { path: [0, 0], offset: 1 },
          focus: { path: [0, 0], offset: 1 },
        })
      })

      if (imageMenuSupport.hasGroupImage) {
        const groupImage = await ensureMenuEnabled(page, 'group-image')

        await groupImage.hover()
        const groupPanel = groupImage.locator('..').locator('.w-e-bar-item-menus-container')

        await groupPanel.waitFor({ state: 'visible' })
        await groupPanel.locator('[data-menu-key="insertImage"]').click({ force: true })
      } else {
        const imageMenu = await ensureMenuEnabled(page, 'insertImage')

        await imageMenu.click({ force: true })
      }

      const modal = page.locator('.w-e-modal:visible').last()

      await expect(modal).toBeVisible()
      await modal.locator('input[type="text"]').first().fill('https://example.com/regression-610.png')
      await modal.locator('.button-container button').first().click()
      await page.waitForTimeout(220)

      await focusEditable(page)
      await page.keyboard.type('Z')
      await page.waitForTimeout(150)

      const markState = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const findTextNode = (nodes: any[], targetText: string): Record<string, unknown> | null => {
          for (const node of nodes || []) {
            if (typeof node?.text === 'string' && node.text.includes(targetText)) {
              return node
            }
            if (Array.isArray(node?.children)) {
              const found = findTextNode(node.children, targetText)

              if (found) { return found }
            }
          }
          return null
        }

        const insertedTextNode = findTextNode(editor.children || [], 'Z')

        return {
          imageCount: (editor.getElemsByTypePrefix?.('image') || []).length,
          fontFamily: insertedTextNode?.fontFamily || '',
          fontSize: insertedTextNode?.fontSize || '',
          html: editor.getHtml?.() || '',
        }
      })

      expect(markState.imageCount).toBeGreaterThanOrEqual(1)
      expect(markState.fontFamily).toBe('微软雅黑')
      expect(markState.fontSize).toBe('14px')
      expect(markState.html).toContain('regression-610.png')
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #704 list item should allow inserting image and video`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)

      const menuSupport = await page.evaluate(() => {
        const menuKeys = Array.from(
          document.querySelectorAll('[data-testid="editor-toolbar"] [data-menu-key]'),
        ).map(el => el.getAttribute('data-menu-key') || '')

        return {
          hasBulletedList: menuKeys.includes('bulletedList'),
          hasGroupImage: menuKeys.includes('group-image'),
          hasInsertImage: menuKeys.includes('insertImage'),
          hasGroupVideo: menuKeys.includes('group-video'),
          hasInsertVideo: menuKeys.includes('insertVideo'),
        }
      })

      test.skip(
        !menuSupport.hasBulletedList
          || (!menuSupport.hasGroupImage && !menuSupport.hasInsertImage)
          || (!menuSupport.hasGroupVideo && !menuSupport.hasInsertVideo),
        `${target.name} demo toolbar does not expose required list/image/video menus`,
      )

      await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        editor.setHtml('<ul><li>list item</li></ul>')

        const listIndex = editor.children.findIndex((node: any) => node?.type === 'list-item')

        if (listIndex < 0) {
          throw new Error('list-item node not found')
        }

        const listTextNode = listIndex >= 0 ? (editor.children[listIndex]?.children?.[0] || {}) : {}
        const textLength = String(listTextNode.text || '').length
        const offset = Math.min(Math.max(textLength, 1), 4)

        editor.select({
          anchor: { path: [listIndex, 0], offset },
          focus: { path: [listIndex, 0], offset },
        })
      })

      if (menuSupport.hasGroupImage) {
        const groupImage = await ensureMenuEnabled(page, 'group-image')

        await groupImage.hover()
        const groupPanel = groupImage.locator('..').locator('.w-e-bar-item-menus-container')

        await groupPanel.waitFor({ state: 'visible' })
        await groupPanel.locator('[data-menu-key="insertImage"]').click({ force: true })
      } else {
        const imageMenu = await ensureMenuEnabled(page, 'insertImage')

        await imageMenu.click({ force: true })
      }

      const imageModal = page.locator('.w-e-modal:visible').last()

      await expect(imageModal).toBeVisible()
      await imageModal.locator('input[type="text"]').first().fill('https://example.com/regression-704.png')
      await imageModal.locator('.button-container button').first().click()
      await page.waitForTimeout(200)

      await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const listIndex = editor.children.findIndex((node: any) => node?.type === 'list-item')

        if (listIndex < 0) {
          throw new Error('list-item node not found after image insertion')
        }

        const listTextNode = listIndex >= 0 ? (editor.children[listIndex]?.children?.[0] || {}) : {}
        const textLength = String(listTextNode.text || '').length
        const offset = Math.min(Math.max(textLength, 1), 4)

        editor.select({
          anchor: { path: [listIndex, 0], offset },
          focus: { path: [listIndex, 0], offset },
        })
      })

      if (menuSupport.hasGroupVideo) {
        const groupVideo = await ensureMenuEnabled(page, 'group-video')

        await groupVideo.hover()
        const groupPanel = groupVideo.locator('..').locator('.w-e-bar-item-menus-container')

        await groupPanel.waitFor({ state: 'visible' })
        await groupPanel.locator('[data-menu-key="insertVideo"]').click({ force: true })
      } else {
        const videoMenu = await ensureMenuEnabled(page, 'insertVideo')

        await videoMenu.click({ force: true })
      }

      const videoModal = page.locator('.w-e-modal:visible').last()

      await expect(videoModal).toBeVisible()
      await videoModal.locator('input[type="text"]').first().fill('https://example.com/regression-704.mp4')
      await videoModal.locator('.button-container button').first().click()
      await page.waitForTimeout(260)

      const snapshot = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const listItemCount = (editor.children || []).filter((node: any) => node?.type === 'list-item').length

        return {
          imageCount: (editor.getElemsByTypePrefix?.('image') || []).length,
          videoCount: (editor.getElemsByTypePrefix?.('video') || []).length,
          listItemCount,
          html: editor.getHtml?.() || '',
        }
      })

      expect(snapshot.listItemCount).toBeGreaterThanOrEqual(1)
      expect(snapshot.imageCount).toBeGreaterThanOrEqual(1)
      expect(snapshot.videoCount).toBeGreaterThanOrEqual(1)
      expect(snapshot.html).toContain('regression-704')
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

    test(`${target.name}: regression #848 tableFullWidth should stay responsive after container resize`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)
      await create2x2Table(page)

      await page
        .locator('[data-testid="editor-textarea"] table.table')
        .last()
        .locator('tr:nth-child(1) > *:nth-child(1)')
        .click({ force: true })

      const fullWidthMenu = page.locator('[data-menu-key="tableFullWidth"]:visible').first()
      const hasFullWidthMenu = await fullWidthMenu.count()

      test.skip(!hasFullWidthMenu, `${target.name} demo does not expose tableFullWidth menu`)

      await expect(fullWidthMenu).not.toHaveClass(/disabled/)
      await fullWidthMenu.click({ force: true })
      await page.waitForTimeout(220)

      const widthMode = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const tableNode = (editor.children || []).find((node: any) => node?.type === 'table')

        return String(tableNode?.width || '')
      })

      expect(widthMode).toBe('100%')

      const wide = await setTextareaWidthAndMeasureLastTable(page, 820)

      await page.waitForTimeout(100)
      const narrow = await setTextareaWidthAndMeasureLastTable(page, 520)

      await page.waitForTimeout(100)
      const widened = await setTextareaWidthAndMeasureLastTable(page, 760)

      expect(wide.tableStyleWidth).toBe('100%')
      expect(narrow.tableStyleWidth).toBe('100%')
      expect(widened.tableStyleWidth).toBe('100%')

      expect(narrow.tableWidth).toBeLessThan(wide.tableWidth - 80)
      expect(widened.tableWidth).toBeGreaterThan(narrow.tableWidth + 80)

      const wideRatio = wide.tableWidth / Math.max(wide.containerWidth, 1)
      const narrowRatio = narrow.tableWidth / Math.max(narrow.containerWidth, 1)
      const widenedRatio = widened.tableWidth / Math.max(widened.containerWidth, 1)

      expect(Math.abs(wideRatio - narrowRatio)).toBeLessThan(0.15)
      expect(Math.abs(narrowRatio - widenedRatio)).toBeLessThan(0.15)
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #893 tableFullWidth should toggle back and allow effective resize`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)
      await create2x2TableByApi(page)

      await page
        .locator('[data-testid="editor-textarea"] table.table')
        .last()
        .locator('tr:nth-child(1) > *:nth-child(1)')
        .click({ force: true })

      await setSelectedTableWidthMode(page, '100%')
      expect(await getFirstTableWidthMode(page)).toBe('100%')

      await setSelectedTableWidthMode(page, 'auto')
      expect(await getFirstTableWidthMode(page)).toBe('auto')

      await setSelectedTableWidthMode(page, '100%')
      expect(await getFirstTableWidthMode(page)).toBe('100%')

      const before = await getLastTableWidths(page)
      const dragged = await dispatchSyntheticFirstColumnResize(page, 60)

      await page.waitForTimeout(240)
      const after = await getLastTableWidths(page)
      const widthModeAfterDrag = await getFirstTableWidthMode(page)

      const beforeFirst = before[0] || 0
      const afterFirst = after[0] || 0

      expect(dragged).toBe(true)
      expect(beforeFirst).toBeGreaterThan(0)
      expect(afterFirst).toBeGreaterThan(beforeFirst)
      expect(widthModeAfterDrag).toBe('auto')
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #923 table without height should allow column resize`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)
      await create2x2TableByApi(page)

      await page.evaluate(() => {
        const table = document.querySelector('[data-testid="editor-textarea"] table.table') as HTMLTableElement | null

        if (!table) {
          throw new Error('table not ready')
        }

        table.removeAttribute('height')
        table.style.height = ''

        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor
        const tableNode = (editor?.children || []).find((node: any) => node?.type === 'table')

        if (!tableNode) {
          throw new Error('table node not ready')
        }

        delete tableNode.height
      })
      await page.waitForTimeout(120)

      const hotzoneHeight = await page
        .locator('[data-testid="editor-textarea"] .column-resizer')
        .last()
        .locator('.column-resizer-item')
        .first()
        .locator('.resizer-line-hotzone')
        .evaluate((hotzone: HTMLElement) => hotzone.getBoundingClientRect().height)
      const before = await getLastTableWidths(page)
      const dragged = await dispatchSyntheticFirstColumnResize(page, 60)

      await page.waitForTimeout(240)
      const after = await getLastTableWidths(page)

      expect(hotzoneHeight).toBeGreaterThan(0)
      expect(dragged).toBe(true)
      expect(before[0] || 0).toBeGreaterThan(0)
      expect(after[0] || 0).toBeGreaterThan(before[0] || 0)
      expect(pageErrors).toEqual([])
    })

    test(`${target.name}: regression #505 fast drag should keep effective resize`, async ({ page }) => {
      const pageErrors: string[] = []

      page.on('pageerror', err => {
        pageErrors.push(err?.stack || err?.message || String(err))
      })

      await openTarget(page, target)
      await clearEditor(page)
      await page.keyboard.type('outside anchor')
      await create2x2Table(page)
      await page
        .locator('[data-testid="editor-textarea"] table.table')
        .last()
        .locator('tr:nth-child(1) > *:nth-child(1)')
        .click({ force: true })

      const before = await getLastTableWidths(page)
      const table = page.locator('[data-testid="editor-textarea"] table.table').last()
      const tableRect = await table.boundingBox()
      const hotzone = page
        .locator('[data-testid="editor-textarea"] .column-resizer')
        .last()
        .locator('.column-resizer-item')
        .first()
        .locator('.resizer-line-hotzone')

      if (tableRect && before.length > 0) {
        await page.mouse.move(tableRect.x + before[0], tableRect.y + 20)
        await page.waitForTimeout(120)
      }

      const fastDragApplied = await page.evaluate(() => {
        const hotzoneEl = document.querySelector(
          '[data-testid="editor-textarea"] .column-resizer .column-resizer-item:first-child .resizer-line-hotzone',
        ) as HTMLElement | null

        if (!hotzoneEl) { return false }

        const rect = hotzoneEl.getBoundingClientRect()
        const x = Math.round(rect.left + rect.width / 2)
        const y = Math.round(rect.top + rect.height / 2)

        hotzoneEl.dispatchEvent(new MouseEvent('mousedown', {
          bubbles: true,
          clientX: x,
          clientY: y,
        }))
        // Trigger a no-op movement first so the next movement is throttled trailing.
        window.dispatchEvent(new MouseEvent('mousemove', {
          bubbles: true,
          clientX: x,
          clientY: y,
        }))
        window.dispatchEvent(new MouseEvent('mousemove', {
          bubbles: true,
          clientX: x + 120,
          clientY: y,
        }))
        window.dispatchEvent(new MouseEvent('mouseup', {
          bubbles: true,
          clientX: x + 120,
          clientY: y,
        }))

        return true
      })
      const afterFastDrag = await getLastTableWidths(page)

      const beforeFirst = before[0] || 0
      const afterFastFirst = afterFastDrag[0] || 0

      expect(fastDragApplied).toBe(true)
      await expect(hotzone).toHaveClass(/visible/)
      expect(beforeFirst).toBeGreaterThan(0)
      expect(afterFastFirst).toBeGreaterThan(beforeFirst)
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

    test(`${target.name}: regression #608 mixed bold span should keep non-bold subrange`, async ({ page }) => {
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

        editor.setHtml('<p><span style="font-weight: 700;">前缀<span style="font-weight: 400;">中间</span>后缀</span></p><p><br></p>')

        await new Promise<void>(resolve => {
          setTimeout(() => resolve(), 80)
        })
      })
      const snapshot = await page.evaluate(() => {
        const globalWindow = window as any
        const editor = globalWindow.wangEditorExampleBridge?.editor
          || globalWindow.vue2Editor
          || globalWindow.vue3Editor
          || globalWindow.reactEditor

        if (!editor) {
          throw new Error('editor not ready')
        }

        const richParagraph = (editor.children || []).find((node: any) => {
          if (!node || node.type !== 'paragraph') { return false }
          const text = (node.children || [])
            .map((child: any) => String(child?.text || ''))
            .join('')
            .trim()

          return text.length > 0
        })
        const richParagraphChildren = richParagraph?.children || []
        const modelSegments = richParagraphChildren.map((node: any) => {
          return {
            text: String(node?.text || ''),
            bold: node?.bold === true,
          }
        })
        const html = editor.getHtml?.() || ''

        return {
          modelSegments,
          html,
        }
      })

      expect(snapshot.modelSegments).toEqual([
        { text: '前缀', bold: true },
        { text: '中间', bold: false },
        { text: '后缀', bold: true },
      ])
      expect(snapshot.html).toMatch(/<p><strong>前缀<\/strong>中间<strong>后缀<\/strong><\/p>/)
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

  test('vue2-wrapper-markdown: regression #675 should skip markdown trigger during composition', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await openTarget(page, {
      name: 'vue2-wrapper-markdown',
      url: '/examples/framework-vue2-markdown.html',
    })

    await clearEditor(page)
    await page.keyboard.type('# ')

    const normalTriggerSnapshot = await page.evaluate(() => {
      const editor = (window as any).vue2MarkdownEditor

      if (!editor) {
        throw new Error('vue2 markdown editor not ready')
      }

      return {
        firstType: editor.children?.[0]?.type || '',
        html: editor.getHtml?.() || '',
      }
    })

    expect(normalTriggerSnapshot.firstType).toBe('header1')
    expect(normalTriggerSnapshot.html).toContain('<h1>')

    await clearEditor(page)
    await page.keyboard.type('#')

    const compositionSnapshot = await page.evaluate(() => {
      const globalWindow = window as any
      const editor = globalWindow.vue2MarkdownEditor

      if (!editor) {
        throw new Error('vue2 markdown editor not ready')
      }

      const textarea = globalWindow.editor.DomEditor.getTextarea(editor)

      textarea.isComposing = true
      editor.insertText(' ')
      editor.insertText('你')
      textarea.isComposing = false

      return {
        firstType: editor.children?.[0]?.type || '',
        html: editor.getHtml?.() || '',
        text: editor.getText?.() || '',
      }
    })

    expect(compositionSnapshot.firstType).toBe('paragraph')
    expect(compositionSnapshot.html).toContain('<p># 你</p>')
    expect(compositionSnapshot.text).toContain('# 你')
    expect(pageErrors).toEqual([])
  })

  test('vue3-wrapper: regression #388 enter-at-bottom should keep scroll pinned', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await openTarget(page, {
      name: 'vue3-wrapper',
      url: 'http://127.0.0.1:3103/',
    })

    await page.evaluate(() => {
      const editor = (window as any).vue3Editor

      if (!editor) {
        throw new Error('vue3 editor not ready')
      }

      const lines = Array.from({ length: 120 }, (_, index) => {
        return `<p>scroll-line-${String(index).padStart(3, '0')}</p>`
      }).join('')

      editor.setHtml(lines)

      const lastIndex = Math.max((editor.children?.length || 1) - 1, 0)
      const lastText = String(editor.children?.[lastIndex]?.children?.[0]?.text || '')

      editor.select({
        anchor: { path: [lastIndex, 0], offset: lastText.length },
        focus: { path: [lastIndex, 0], offset: lastText.length },
      })
      editor.focus()

      const container = document.querySelector('[data-testid="editor-textarea"]')
      const scroller = container?.querySelector('.w-e-scroll') as HTMLElement | null

      if (scroller) {
        scroller.scrollTop = scroller.scrollHeight
      }
    })

    await page
      .locator('[data-testid="editor-textarea"] [data-slate-node="text"]')
      .last()
      .click({ force: true })

    await Array.from({ length: 36 }).reduce<Promise<void>>(sequence => {
      return sequence.then(() => page.keyboard.press('Enter'))
    }, Promise.resolve())

    await page.waitForTimeout(500)

    const metrics = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="editor-textarea"]')
      const scroller = container?.querySelector('.w-e-scroll') as HTMLElement | null

      if (!scroller) {
        throw new Error('scroll container missing')
      }

      const viewportBottom = scroller.scrollTop + scroller.clientHeight
      const gapToBottom = scroller.scrollHeight - viewportBottom
      const scrollerRect = scroller.getBoundingClientRect()
      const selection = window.getSelection()

      let caretTop = -1
      let caretBottom = -1

      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0).cloneRange()

        range.collapse(true)
        const rangeRect = range.getBoundingClientRect()

        if (rangeRect && !(rangeRect.top === 0 && rangeRect.bottom === 0)) {
          caretTop = rangeRect.top
          caretBottom = rangeRect.bottom
        } else if (selection.anchorNode) {
          const anchorElem = selection.anchorNode.nodeType === Node.TEXT_NODE
            ? selection.anchorNode.parentElement
            : selection.anchorNode as Element
          const anchorRect = anchorElem?.getBoundingClientRect()

          if (anchorRect) {
            caretTop = anchorRect.top
            caretBottom = anchorRect.bottom
          }
        }
      }

      const caretInView = caretBottom >= scrollerRect.top - 1 && caretTop <= scrollerRect.bottom + 1

      return {
        gapToBottom,
        scrollTop: scroller.scrollTop,
        scrollHeight: scroller.scrollHeight,
        clientHeight: scroller.clientHeight,
        caretTop,
        caretBottom,
        scrollerTop: scrollerRect.top,
        scrollerBottom: scrollerRect.bottom,
        caretInView,
      }
    })

    expect(metrics.caretInView, JSON.stringify(metrics)).toBe(true)
    expect(pageErrors).toEqual([])
  })
})
