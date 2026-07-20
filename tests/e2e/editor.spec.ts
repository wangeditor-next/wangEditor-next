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
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.evaluate(async value => {
    await navigator.clipboard.writeText(value)
  }, text)
  await focusEditor(page)
  await page.keyboard.press('Control+V')
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

const runToolbarUndoImeCompositionScenario = async (
  page: Page,
  menuKey: 'divider' | 'codeBlock',
) => {
  const pageErrors: string[] = []

  page.on('pageerror', err => {
    pageErrors.push(err?.stack || err?.message || String(err))
  })

  await focusEditor(page)

  if (menuKey === 'codeBlock') {
    await typeInEditor(page, 'code line')
    await selectAll(page)
  }

  await waitForMenuEnabled(page, menuKey)
  await getToolbarMenu(page, menuKey).click()

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

test.describe('Basic Editor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/examples/default-mode.html')
    await page.getByTestId('btn-create').click()
    await expect(getEditable(page)).toBeVisible()
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

  test('regression #813: select-all then composition should not throw and should hide placeholder', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.message || String(err))
    })

    await typeInEditor(page, 'abc')
    await selectAll(page)

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

    await page.waitForTimeout(500)

    const placeholder = page.locator('.w-e-text-placeholder')

    await expect(placeholder).toBeHidden()
    await expect(page.getByTestId('editor-html')).toContainText('<p>你</p>')
    expect(pageErrors).toEqual([])
  })

  test('regression #793: repeated composition on long text should not throw DOM point error', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await typeInEditor(page, 'abcdefghijklmnopqrstuvwxyz1234')

    await page.evaluate(() => {
      const el = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]')

      if (!el) {
        throw new Error('editable not found')
      }

      const fire = (event: Event) => el.dispatchEvent(event)
      const seq: Array<{ pinyin: string, text: string }> = [
        { pinyin: 'ni', text: '你' },
        { pinyin: 'hao', text: '好' },
        { pinyin: 'zhong', text: '中' },
        { pinyin: 'wen', text: '文' },
        { pinyin: 'shu', text: '输' },
        { pinyin: 'ru', text: '入' },
      ]

      for (const item of seq) {
        fire(new CompositionEvent('compositionstart', { data: '' }))
        fire(new InputEvent('beforeinput', {
          inputType: 'insertCompositionText',
          data: item.pinyin,
          bubbles: true,
          cancelable: true,
        }))
        fire(new InputEvent('input', {
          inputType: 'insertCompositionText',
          data: item.pinyin,
          bubbles: true,
        }))
        fire(new CompositionEvent('compositionupdate', { data: item.pinyin }))
        fire(new CompositionEvent('compositionend', { data: item.text }))
      }
    })

    await page.waitForTimeout(800)

    await expect(page.getByTestId('editor-html')).toContainText('abcdefghijklmnopqrstuvwxyz1234')
    await expect(page.getByTestId('editor-html')).toContainText('你好中文输入')

    const domPointErrors = pageErrors.filter(msg => msg.includes('Cannot resolve a DOM point from Slate point'))

    expect(domPointErrors).toEqual([])
  })

  test('regression #861: composing insertText after backspace clear should commit once and stay visible', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor
      const el = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]') as HTMLElement | null

      if (!editor || !el) {
        throw new Error('editor or editable not found')
      }

      const fire = (event: Event) => el.dispatchEvent(event)
      const composeCommitAsInsertText = (text: string) => {
        fire(new CompositionEvent('compositionstart', { data: '' }))
        fire(new CompositionEvent('compositionupdate', { data: 'nihao' }))
        fire(new InputEvent('beforeinput', {
          inputType: 'insertText',
          data: text,
          bubbles: true,
          cancelable: true,
          isComposing: true,
        }))
        fire(new CompositionEvent('compositionend', { data: '' }))
      }
      const backspaceDeleteAll = () => {
        let guard = 200

        while (editor.getText().length > 0 && guard > 0) {
          fire(new InputEvent('beforeinput', {
            inputType: 'deleteContentBackward',
            data: null,
            bubbles: true,
            cancelable: true,
          }))
          guard -= 1
        }
      }

      editor.focus()
      editor.clear()
      composeCommitAsInsertText('你好')
      backspaceDeleteAll()
      composeCommitAsInsertText('中文')
    })

    await page.waitForTimeout(200)

    const settled = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor
      const el = document.querySelector('[data-testid="editor-textarea"] [contenteditable="true"]')

      if (!editor || !el) {
        throw new Error('editor or editable not found')
      }

      return {
        modelText: editor.getText(),
        modelHtml: editor.getHtml(),
        domText: (el as HTMLElement).innerText,
      }
    })

    expect(settled.modelText).toBe('中文')
    expect(settled.modelHtml).toContain('<p>中文</p>')
    expect(settled.domText).toContain('中文')
    expect(settled.domText).not.toContain('中文中文')
    await expect(page.getByTestId('editor-html')).toContainText('<p>中文</p>')
    await expect(page.getByTestId('editor-html')).not.toContainText('中文中文')
    await expect(getEditable(page)).toContainText('中文')
    expect(pageErrors).toEqual([])
  })

  test('regression #892: divider -> undo -> composition -> select-all should not throw', async ({ page }) => {
    await runToolbarUndoImeCompositionScenario(page, 'divider')
  })

  test('regression #892: codeBlock -> undo -> composition -> select-all should not throw', async ({ page }) => {
    await runToolbarUndoImeCompositionScenario(page, 'codeBlock')
  })

  test('regression #282: first-line superscript with large font should not be clipped', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      editor.setHtml('<p><span style="font-size: 40px;"><sup><strong>sfdsf</strong></sup></span></p>')
    })

    await page.waitForTimeout(120)

    const snapshot = await page.evaluate(() => {
      const textarea = document.querySelector('[data-testid="editor-textarea"]')
      const scroll = textarea?.querySelector('.w-e-scroll')
      const strong = textarea?.querySelector('strong')
      const sup = textarea?.querySelector('sup')

      if (!scroll || !strong || !sup) {
        throw new Error('required elements not found')
      }

      const scrollRect = scroll.getBoundingClientRect()
      const strongRect = strong.getBoundingClientRect()
      const clippedTop = strongRect.top + 0.5 < scrollRect.top

      return {
        clippedTop,
        scrollTop: scrollRect.top,
        textTop: strongRect.top,
        supLineHeight: window.getComputedStyle(sup).lineHeight,
      }
    })

    expect(snapshot.clippedTop).toBe(false)
    expect(snapshot.supLineHeight).not.toBe('0px')
  })

  test('regression #539: colored multiline blockquote should re-render and stay editable', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []
    const issueHtml = '<blockquote><span style="color: rgb(247, 89, 171);">22222<br>3333</span></blockquote>'

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const snapshot = await page.evaluate(value => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      editor.setHtml(value)
      const firstPassHtml = editor.getHtml()

      // Simulate framework two-way binding "echo" by writing serialized html back.
      editor.setHtml(firstPassHtml)
      editor.focus()
      editor.insertText('Z')
      editor.deleteBackward('character')

      return {
        firstPassHtml,
        secondPassHtml: editor.getHtml(),
        plainText: editor.getText?.() || '',
      }
    }, issueHtml)

    const domNodeErrors = pageErrors.filter(msg => msg.includes('Cannot resolve a DOM node from Slate node'))

    expect(snapshot.firstPassHtml).toContain('<blockquote>')
    expect(snapshot.secondPassHtml).toContain('<blockquote>')
    expect(snapshot.secondPassHtml).toContain('22222')
    expect(snapshot.secondPassHtml).toContain('3333')
    expect(snapshot.plainText).toContain('22222')
    expect(snapshot.plainText).toContain('3333')
    expect(domNodeErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })

  test('regression #44: blockquote div line breaks should survive setHtml(getHtml())', async ({ page }) => {
    const issueHtml = '<blockquote><div>line 1</div><div><span style="font-weight: 700;">line 2</span></div></blockquote>'

    const snapshot = await page.evaluate(value => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      editor.setHtml(value)
      const firstPassHtml = editor.getHtml()

      editor.setHtml(firstPassHtml)

      return {
        firstPassHtml,
        secondPassHtml: editor.getHtml(),
        plainText: editor.getText?.() || '',
      }
    }, issueHtml)

    expect(snapshot.firstPassHtml).toContain('<blockquote>')
    expect(snapshot.firstPassHtml).toContain('line 1')
    expect(snapshot.firstPassHtml).toContain('line 2')
    expect(snapshot.secondPassHtml).toContain('<blockquote>')
    expect(snapshot.secondPassHtml).toContain('line 1')
    expect(snapshot.secondPassHtml).toContain('line 2')
    expect(snapshot.secondPassHtml).toContain('<br>')
    expect(snapshot.plainText).toContain('line 1')
    expect(snapshot.plainText).toContain('line 2')
    expect(snapshot.plainText).toContain('\n')
  })

  test('regression #609: insertData with complex html should not break editing', async ({ page }) => {
    const pageErrors: string[] = []
    const consoleErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.message || String(err))
    })

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const complexHtml = [
      '<p>111111111111111111111111111111</p>',
      '<table style="width:100%;table-layout:fixed"><tbody>',
      '  <tr>',
      '    <td style="text-align:center;vertical-align:top">Layout 布局</td>',
      '    <td style="text-align:left">Dialog 对话框</td>',
      '    <td style="display:none;text-align:center"></td>',
      '  </tr>',
      '  <tr>',
      '    <td style="text-align:center">Container 容器</td>',
      '    <td style="text-align:left"><span>在保留自然浏览状态的情况下，默认可中断前端弹窗操作。</span></td>',
      '    <td style="display:none;text-align:right"></td>',
      '  </tr>',
      '</tbody></table>',
      '<p>22222222222222222222222222222</p>',
      '<p><img alt="tiny" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" /></p>',
      '<p>3333333333333333333333333333333333333</p>',
    ].join('')

    await page.evaluate(value => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      const transfer = new DataTransfer()

      transfer.setData('text/plain', 'fallback')
      transfer.setData('text/html', value)
      editor.insertData(transfer)
    }, complexHtml)

    const editable = page.locator('[data-testid="editor-textarea"] [data-slate-editor]').first()

    await editable.click()
    await page.keyboard.type('after-insertData-check')

    await expect(page.getByTestId('editor-html')).toContainText('after-insertData-check')

    expect(pageErrors).toEqual([])
    expect(consoleErrors).toEqual([])
  })

  test('regression #692: toolbar object config should keep fontSize select options', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await page.evaluate(() => {
      const globalWindow = window as any
      const bridge = globalWindow.wangEditorExampleBridge
      const editorContainer = document.querySelector('#editor-text-area')
      const toolbarContainer = document.querySelector('#editor-toolbar')

      bridge?.toolbar?.destroy()
      bridge?.editor?.destroy()

      if (!editorContainer || !toolbarContainer) {
        throw new Error('editor containers are missing')
      }

      const editor = globalWindow.wangEditor.createEditor({
        selector: '#editor-text-area',
        html: '<p>font-size-regression</p>',
        config: {
          MENU_CONF: {
            fontSize: {
              fontSizeList: ['12px', '16px', '24px', '40px'],
            },
          },
        },
      })
      const toolbar = globalWindow.wangEditor.createToolbar({
        editor,
        selector: '#editor-toolbar',
        config: {
          toolbarKeys: [{ key: 'fontSize', title: '文字大小' }],
        },
      })

      globalWindow.wangEditorExampleBridge = {
        editor,
        toolbar,
      }
    })

    await focusEditor(page)

    const fontSizeMenu = getToolbarMenu(page, 'fontSize')

    await expect(fontSizeMenu).toHaveClass(/select-button/)
    await expect(page.locator('#editor-toolbar .w-e-bar-item-group')).toHaveCount(0)

    await fontSizeMenu.click()

    const selectList = page.locator('.w-e-select-list:visible').last()

    await expect(selectList).toBeVisible()

    const optionTexts = (await selectList.locator('li').allTextContents()).map(item => item.trim())

    expect(optionTexts).toEqual(expect.arrayContaining(['12px', '16px', '24px', '40px']))
    expect(pageErrors).toEqual([])
  })

  test('regression #502: insertLink modal should stay in visible editor area after scroll-to-top', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.message || String(err))
    })

    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      const html = Array.from(
        { length: 320 },
        (_, i) => `<p>line-${String(i).padStart(3, '0')} abcdefghijklmnopqrstuvwxyz</p>`,
      ).join('')

      editor.setHtml(html)
    })

    const editable = page.locator('[data-testid="editor-textarea"] [contenteditable="true"]')

    await editable.click()
    await page.keyboard.press('Control+End')
    await page.waitForTimeout(350)

    await page.evaluate(() => {
      const scroller = document.querySelector('[data-testid="editor-textarea"] .w-e-scroll') as HTMLElement | null

      if (!scroller) {
        throw new Error('scroller missing')
      }
      scroller.scrollTop = 0
      window.scrollTo(0, 0)
    })
    await page.waitForTimeout(120)

    const insertLinkMenu = await waitForMenuEnabled(page, 'insertLink')

    await insertLinkMenu.click()
    await expect(page.locator('.w-e-modal')).toBeVisible()

    const metrics = await page.evaluate(() => {
      const modal = document.querySelector('.w-e-modal')
      const container = document.querySelector('[data-testid="editor-textarea"]')
      const scroller = document.querySelector('[data-testid="editor-textarea"] .w-e-scroll') as HTMLElement | null
      const modalRect = modal?.getBoundingClientRect()
      const containerRect = container?.getBoundingClientRect()

      return {
        pageScrollY: window.scrollY,
        scrollTop: scroller?.scrollTop ?? 0,
        inContainerViewport: !!(modalRect && containerRect
          && modalRect.top >= containerRect.top
          && modalRect.bottom <= containerRect.bottom
          && modalRect.left >= containerRect.left
          && modalRect.right <= containerRect.right),
      }
    })

    expect(metrics.pageScrollY).toBeLessThanOrEqual(1)
    expect(metrics.scrollTop).toBe(0)
    expect(metrics.inContainerViewport).toBe(true)
    expect(pageErrors).toEqual([])
  })

  test('regression #541: dangerouslyInsertHtml should not append extra blank paragraphs', async ({ page }) => {
    const metrics = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      editor.clear()
      const html = '<p><a>222</a></p><p>更新</p><p><a>222</a></p><p>更新</p><p><a>222</a></p><p>更新</p>'

      editor.dangerouslyInsertHtml(html)

      const output = editor.getHtml()
      const wrapper = document.createElement('div')

      wrapper.innerHTML = output
      const paragraphs = Array.from(wrapper.querySelectorAll('p'))
      const blankParagraphCount = paragraphs.filter(p => (p.textContent || '').trim() === '').length

      return {
        output,
        paragraphCount: paragraphs.length,
        blankParagraphCount,
      }
    })

    expect(metrics.paragraphCount).toBe(6)
    expect(metrics.blankParagraphCount).toBe(0)
    expect(metrics.output).toBe(
      '<p><a href="" target="">222</a></p><p>更新</p><p><a href="" target="">222</a></p><p>更新</p><p><a href="" target="">222</a></p><p>更新</p>',
    )
  })

  test('does not execute script when importing untrusted html', async ({ page }) => {
    const dialogs: string[] = []

    page.on('dialog', async dialog => {
      dialogs.push(dialog.message())
      await dialog.dismiss()
    })

    await page.goto('/examples/parse-html.html')
    await page.locator('#text-html').fill('<img src=x onerror="alert(1)" />')
    await page.locator('#btn-create').click()
    await page.waitForTimeout(300)
    await page.locator('#btn-set-html').click()
    await page.waitForTimeout(300)

    expect(dialogs).toEqual([])
    await expect(page.locator('#editor-text-area img')).toHaveCount(1)
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

  test('regression #543: nested list should stay inside parent li after round-trip', async ({ page }) => {
    const issueHtml = '<ol><li>第一项<ul><li>子项1</li><li>子项2</li></ul></li><li>第二项</li></ol>'

    const snapshot = await page.evaluate(value => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor missing')
      }

      editor.setHtml(value)
      const firstPassHtml = editor.getHtml()

      editor.setHtml(firstPassHtml)
      const secondPassHtml = editor.getHtml()

      const wrapper = document.createElement('div')

      wrapper.innerHTML = secondPassHtml
      const topOl = wrapper.querySelector('ol')
      const topLevelLi = topOl
        ? Array.from(topOl.children).filter(el => el.tagName === 'LI')
        : []
      const firstLi = topLevelLi[0] as HTMLLIElement | undefined
      const nestedUl = firstLi?.querySelector(':scope > ul')
      const directUlUnderOl = topOl?.querySelectorAll(':scope > ul').length || 0

      return {
        firstPassHtml,
        secondPassHtml,
        topLevelLiCount: topLevelLi.length,
        hasNestedUlInFirstLi: !!nestedUl,
        nestedLiCount: nestedUl?.querySelectorAll(':scope > li').length || 0,
        directUlUnderOl,
      }
    }, issueHtml)

    expect(snapshot.firstPassHtml).toContain('<ol>')
    expect(snapshot.firstPassHtml).toContain('<ul>')
    expect(snapshot.secondPassHtml).toContain('<ol>')
    expect(snapshot.secondPassHtml).toContain('<ul>')
    expect(snapshot.topLevelLiCount).toBe(2)
    expect(snapshot.hasNestedUlInFirstLi).toBe(true)
    expect(snapshot.nestedLiCount).toBe(2)
    expect(snapshot.directUlUnderOl).toBe(0)
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

  test('regression #156: insertTableCol should insert after current column when configured', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      const editorConfig = editor.getConfig?.()

      if (!editorConfig?.MENU_CONF) {
        throw new Error('editor config not ready')
      }

      editorConfig.MENU_CONF.insertTableCol = {
        ...(editorConfig.MENU_CONF.insertTableCol || {}),
        insertPosition: 'after',
      }
      editor.setHtml(`
        <table style="width: 100%;">
          <tbody>
            <tr><td>A</td><td>B</td></tr>
          </tbody>
        </table>
      `)
    })

    await page.locator('[data-testid="editor-textarea"] table td').first().click()
    await page.locator('.w-e-hover-bar [data-menu-key="insertTableCol"]').click({ force: true })
    await expect(
      page.locator('[data-testid="editor-textarea"] table tr').first().locator('th, td'),
    ).toHaveCount(3)

    const firstRowTexts = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor
      const tableNode = editor?.children?.find((node: any) => node?.type === 'table')

      if (!tableNode) {
        throw new Error('table node not found')
      }

      return tableNode.children[0].children.map((cell: any) => cell?.children?.[0]?.text ?? '')
    })

    expect(firstRowTexts).toEqual(['A', '', 'B'])
  })

  test('regression #811: row resize hotzone should follow rendered row border after content expands', async ({ page }) => {
    await clearEditor(page)
    await page.keyboard.type('table-resize-probe')

    await waitForMenuEnabled(page, 'insertTable')
    await getToolbarMenu(page, 'insertTable').click()
    await page.locator('.w-e-panel-content-table').waitFor({ state: 'visible' })
    await page.locator('.w-e-panel-content-table td[data-x="1"][data-y="1"]').click()

    await page.locator('[data-testid="editor-textarea"] table tr')
      .first()
      .locator('th, td')
      .first()
      .click()
    await page.keyboard.type('这是用于复现811的超长文本'.repeat(20))
    await page.waitForTimeout(500)

    const metrics = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="editor-textarea"] table.table') as HTMLElement | null
      const rows = Array.from(document.querySelectorAll('[data-testid="editor-textarea"] table tr')) as HTMLElement[]
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!table || rows.length < 2 || !editor) {
        throw new Error('table/rows/editor not ready')
      }
      table.scrollIntoView({ block: 'center', inline: 'nearest' })

      const tableNode = editor.children.find((n: any) => n?.type === 'table')

      if (!tableNode) {
        throw new Error('table node not found in model')
      }

      const modelRowHeights = tableNode.children.map((row: any) => row?.height || 30)
      const domRowHeights = rows.map(row => row.getBoundingClientRect().height)

      const tableRect = table.getBoundingClientRect()
      const firstRowRect = rows[0].getBoundingClientRect()

      return {
        modelRowHeights,
        domRowHeights,
        domFirstBorderOffset: firstRowRect.bottom - tableRect.top,
        tableLeft: tableRect.left,
        tableTop: tableRect.top,
        tableWidth: tableRect.width,
      }
    })

    const sampleX = metrics.tableLeft + Math.min(30, metrics.tableWidth / 3)
    const hoverAtDomBorder = await page.evaluate(async ({ x, y }) => {
      const table = document.querySelector('[data-testid="editor-textarea"] table.table') as HTMLElement | null
      const editor = (window as any).wangEditorExampleBridge?.editor
      const tableNode = editor?.children?.find((n: any) => n?.type === 'table')

      if (!table || !tableNode) {
        throw new Error('table or model table node missing')
      }

      table.dispatchEvent(new MouseEvent('mousemove', {
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
      }))
      await new Promise(resolve => {
        setTimeout(resolve, 120)
      })

      const currentTableNode = editor?.children?.find((n: any) => n?.type === 'table')

      return {
        isHoverRowBorder: !!currentTableNode?.isHoverRowBorder,
        resizingRowIndex: currentTableNode?.resizingRowIndex ?? -1,
      }
    }, {
      x: sampleX,
      y: metrics.tableTop + metrics.domFirstBorderOffset + 1,
    })

    expect(metrics.domRowHeights[0] - metrics.modelRowHeights[0]).toBeGreaterThan(20)
    expect(hoverAtDomBorder.isHoverRowBorder).toBe(true)
    expect(hoverAtDomBorder.resizingRowIndex).toBe(0)
  })

  test('regression #935: first-row multi-cell selection should survive the row resize hotzone', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <p>before table</p>
        <table style="width: 839px; table-layout: fixed; height: 80px;">
          <colgroup contenteditable="false">
            <col width="65" />
            <col width="75" />
            <col width="75" />
            <col width="84" />
            <col width="75" />
            <col width="64" />
            <col width="64" />
            <col width="64" />
            <col width="64" />
            <col width="64" />
            <col width="64" />
            <col width="81" />
          </colgroup>
          <tbody>
            <tr style="height: 71px;">
              <td><strong>需求编号</strong></td>
              <td><strong>需求名称</strong></td>
              <td><strong>测试状态</strong></td>
              <td><strong>延迟提测天数</strong></td>
              <td><strong>设计案例数</strong></td>
              <td><strong>执行案例数</strong></td>
              <td><strong>测试进度</strong></td>
              <td><strong>缺陷总数</strong></td>
              <td><strong>未决缺陷数</strong></td>
              <td><strong>冒烟不通过次数</strong></td>
              <td><strong>测试人员</strong></td>
              <td><strong>开发人员</strong></td>
            </tr>
            <tr>
              <td>REQ-DEMO-001</td><td>年度报表导出清晰度优化示例需求</td><td>测试中</td>
              <td>1.2</td><td>9</td><td>8</td><td>88%</td><td>0</td><td>0</td><td>0</td>
              <td>测试人员甲</td><td>开发人员甲</td>
            </tr>
            <tr>
              <td>REQ-DEMO-002</td><td>电子文档模板更新与兼容性验证示例需求</td><td>测试中</td>
              <td>未延期</td><td>18</td><td>15</td><td>83%</td><td>0</td><td>0</td><td>0</td>
              <td>测试人员乙</td><td>开发人员乙</td>
            </tr>
            <tr>
              <td>REQ-DEMO-003</td><td>业务流程重构与数据校验示例需求</td><td>测试中</td>
              <td>0.1</td><td>30</td><td>18</td><td>60%</td><td>0</td><td>0</td><td>0</td>
              <td>测试人员丙</td><td>开发人员丙</td>
            </tr>
          </tbody>
        </table>
        <p>after table</p>
      `.replace(/>\s+</g, '><').trim())
    })

    const firstRowCells = page.locator(
      '[data-testid="editor-textarea"] table tr:first-child td',
    )

    await expect(firstRowCells).toHaveCount(12)
    await expect(firstRowCells.first()).toHaveText('需求编号')
    await page.locator('[data-testid="editor-textarea"] p').first().click()
    const firstCell = await firstRowCells.nth(0).boundingBox()
    const lastCell = await firstRowCells.nth(4).boundingBox()

    if (!firstCell || !lastCell) {
      throw new Error('first-row cells are not visible')
    }

    await page.mouse.move(
      firstCell.x + firstCell.width / 2,
      firstCell.y + firstCell.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(
      lastCell.x + lastCell.width / 2,
      lastCell.y + lastCell.height - 2,
      { steps: 60 },
    )
    await page.mouse.up()

    const selectionState = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor
      const tableSelection = editor?.getTableSelection?.() || []

      return {
        cells: tableSelection.flat().length,
        selectedCells: document.querySelectorAll(
          '[data-testid="editor-textarea"] table .w-e-selected',
        ).length,
      }
    })

    expect(selectionState).toEqual({
      cells: 5,
      selectedCells: 5,
    })
  })

  test('shows colored multi-cell selections as one animated outer border', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <table>
          <tbody>
            <tr>
              <td style="background-color: rgb(254, 242, 203);">A</td>
              <td style="background-color: rgb(254, 242, 203);">B</td>
              <td style="background-color: rgb(254, 242, 203);">C</td>
            </tr>
            <tr><td>1</td><td>2</td><td>3</td></tr>
          </tbody>
        </table>
        <p><br></p>
      `.replace(/>\s+</g, '><').trim())
    })

    const cells = page.locator('[data-testid="editor-textarea"] table tr:first-child td')
    const firstCell = await cells.first().boundingBox()
    const lastCell = await cells.last().boundingBox()

    if (!firstCell || !lastCell) {
      throw new Error('colored table cells are not visible')
    }

    await page.mouse.move(
      firstCell.x + firstCell.width / 2,
      firstCell.y + firstCell.height / 2,
    )
    await page.mouse.down()
    await page.mouse.move(
      lastCell.x + lastCell.width / 2,
      lastCell.y + lastCell.height / 2,
      { steps: 20 },
    )
    await page.mouse.up()

    const selectionState = await page.evaluate(() => {
      const selectedCells = Array.from(document.querySelectorAll<HTMLElement>(
        '[data-testid="editor-textarea"] table .w-e-selected',
      ))

      return {
        backgrounds: selectedCells.map(cell => getComputedStyle(cell).backgroundColor),
        borders: selectedCells.map(cell => {
          const style = getComputedStyle(cell, '::after')

          return [
            style.borderTopWidth,
            style.borderRightWidth,
            style.borderBottomWidth,
            style.borderLeftWidth,
          ]
        }),
        animations: selectedCells.map(cell => getComputedStyle(cell, '::after').animationName),
      }
    })

    expect(selectionState).toEqual({
      backgrounds: Array(3).fill('rgb(254, 242, 203)'),
      borders: [
        ['2px', '0px', '2px', '2px'],
        ['2px', '0px', '2px', '0px'],
        ['2px', '2px', '2px', '0px'],
      ],
      animations: Array(3).fill('w-e-table-cell-selection-pulse'),
    })

    await page.emulateMedia({ reducedMotion: 'reduce' })

    const reducedMotionStyle = await cells.first().evaluate(cell => {
      const style = getComputedStyle(cell, '::after')

      return {
        animationName: style.animationName,
        borderTopWidth: style.borderTopWidth,
      }
    })

    expect(reducedMotionStyle).toEqual({
      animationName: 'none',
      borderTopWidth: '2px',
    })
  })

  test('regression #297: column resize should work after setHtml without selecting table first', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <p>before table</p>
        <table style="width: 100%;">
          <tbody>
            <tr><td>col-1</td><td>col-2</td><td>col-3</td></tr>
            <tr><td>a</td><td>b</td><td>c</td></tr>
          </tbody>
        </table>
        <p>after table</p>
      `)
    })

    await page.locator('[data-testid="editor-textarea"] p').last().click()

    const metrics = await page.evaluate(() => {
      const table = document.querySelector('[data-testid="editor-textarea"] table.table') as HTMLTableElement | null
      const firstCell = table?.querySelector('tr > :first-child') as HTMLTableCellElement | null

      if (!table || !firstCell) {
        throw new Error('table not ready')
      }

      table.scrollIntoView({ block: 'center', inline: 'nearest' })
      const firstCellRect = firstCell.getBoundingClientRect()

      if (!Number.isFinite(firstCellRect.width) || firstCellRect.width <= 0) {
        throw new Error('first column width is invalid')
      }

      return {
        borderX: firstCellRect.right,
        borderY: firstCellRect.top + firstCellRect.height / 2,
        beforeWidth: firstCellRect.width,
      }
    })

    await page.mouse.move(metrics.borderX, metrics.borderY)

    const firstResizeHandle = page.locator('.column-resizer .resizer-line-hotzone').first()

    await expect(firstResizeHandle).toHaveClass(/visible/)
    await firstResizeHandle.hover()
    await expect(firstResizeHandle).toHaveClass(/highlight/)

    await page.mouse.down()
    await page.mouse.move(metrics.borderX + 60, metrics.borderY)
    await page.mouse.up()
    await page.waitForTimeout(150)

    const afterWidth = await page.evaluate(() => {
      const firstCell = document.querySelector(
        '[data-testid="editor-textarea"] table tr > :first-child',
      ) as HTMLTableCellElement | null

      if (!firstCell) {
        throw new Error('first table cell not found')
      }

      return firstCell.getBoundingClientRect().width
    })

    expect(afterWidth).toBeGreaterThan(metrics.beforeWidth + 8)
  })

  test('row resize should work after setHtml without selecting table first', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <p>before table</p>
        <table style="width: 100%;">
          <tbody>
            <tr><td>row-1-a</td><td>row-1-b</td></tr>
            <tr><td>row-2-a</td><td>row-2-b</td></tr>
          </tbody>
        </table>
        <p>after table</p>
      `)
    })

    await page.locator('[data-testid="editor-textarea"] p').last().click()

    const metrics = await page.evaluate(() => {
      const firstRow = document.querySelector(
        '[data-testid="editor-textarea"] table.table tr',
      ) as HTMLTableRowElement | null

      if (!firstRow) {
        throw new Error('first table row not found')
      }

      firstRow.scrollIntoView({ block: 'center', inline: 'nearest' })
      const firstRowRect = firstRow.getBoundingClientRect()

      if (!Number.isFinite(firstRowRect.height) || firstRowRect.height <= 0) {
        throw new Error('first row height is invalid')
      }

      return {
        borderX: firstRowRect.left + firstRowRect.width / 2,
        borderY: firstRowRect.bottom,
        beforeHeight: firstRowRect.height,
      }
    })

    await page.mouse.move(metrics.borderX, metrics.borderY)

    const firstResizeHandle = page.locator(
      '.row-resizer .resizer-line-hotzone-horizontal',
    ).first()

    await expect(firstResizeHandle).toHaveClass(/visible/)
    await firstResizeHandle.hover()
    await expect(firstResizeHandle).toHaveClass(/highlight/)

    await page.mouse.down()
    await page.mouse.move(metrics.borderX, metrics.borderY + 40)
    await page.mouse.up()
    await page.waitForTimeout(150)

    const afterHeight = await page.evaluate(() => {
      const firstRow = document.querySelector(
        '[data-testid="editor-textarea"] table.table tr',
      ) as HTMLTableRowElement | null

      if (!firstRow) {
        throw new Error('first table row not found')
      }

      return firstRow.getBoundingClientRect().height
    })

    expect(afterHeight).toBeGreaterThan(metrics.beforeHeight + 8)
  })

  test('regression #574: cutting batch-selected table cells should keep table shape and only clear selected cells', async ({ page }) => {
    const pageErrors: string[] = []

    page.on('pageerror', err => {
      pageErrors.push(err?.stack || err?.message || String(err))
    })

    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

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
      `)
    })

    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

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
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      const tableSelection = editor.getTableSelection?.() || []

      return {
        rows: tableSelection.length,
        cells: tableSelection.flat().length,
      }
    })

    expect(selectionState.rows).toBeGreaterThanOrEqual(1)
    expect(selectionState.cells).toBeGreaterThanOrEqual(2)

    await page.keyboard.press('Control+X')
    await page.waitForTimeout(120)

    const tableState = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[data-testid="editor-textarea"] table tr'))
      const matrix = rows.map(row => {
        const cells = Array.from(row.querySelectorAll('td,th')) as HTMLElement[]

        return cells.map(cell => (cell.textContent || '').replace(/\s+/g, ''))
      })

      return {
        rowCount: rows.length,
        colCounts: rows.map(row => row.querySelectorAll('td,th').length),
        matrix,
      }
    })

    expect(pageErrors).toEqual([])
    expect(tableState.rowCount).toBe(2)
    expect(tableState.colCounts).toEqual([2, 2])
    expect(tableState.matrix[0]).toEqual(['', ''])
    expect(tableState.matrix[1]).toEqual(['C', 'D'])
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

  test('regression #335: table caption should render and survive setHtml(getHtml())', async ({ page }) => {
    const snapshot = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <table style="width: 100%;">
          <caption>Table 2: Effects of contact</caption>
          <tbody>
            <tr><td>A</td><td>B</td></tr>
          </tbody>
        </table>
      `)
      const firstPassHtml = editor.getHtml()

      editor.setHtml(firstPassHtml)
      const secondPassHtml = editor.getHtml()
      const domCaption = document.querySelector('[data-testid="editor-textarea"] table caption')?.textContent || ''

      return {
        firstPassHtml,
        secondPassHtml,
        domCaption: domCaption.trim(),
      }
    })

    expect(snapshot.firstPassHtml).toContain('<caption>Table 2: Effects of contact</caption>')
    expect(snapshot.secondPassHtml).toContain('<caption>Table 2: Effects of contact</caption>')
    expect(snapshot.domCaption).toBe('Table 2: Effects of contact')
  })

  test('regression #47: first inserted table should be first node and removable by select-all delete/cut', async ({ page }) => {
    await clearEditor(page)
    await waitForMenuEnabled(page, 'insertTable')
    await getToolbarMenu(page, 'insertTable').click()
    await page.locator('.w-e-panel-content-table').waitFor({ state: 'visible' })
    await page.locator('.w-e-panel-content-table td').first().click()
    await page.waitForTimeout(120)

    const afterInsertByMenu = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      return {
        types: (editor.children || []).map((node: any) => node?.type || ''),
        tableCount: (editor.children || []).filter((node: any) => node?.type === 'table').length,
      }
    })

    expect(afterInsertByMenu.tableCount).toBe(1)
    expect(afterInsertByMenu.types[0]).toBe('table')

    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <table style="width: 100%;">
          <tbody>
            <tr><td>A</td><td>B</td></tr>
          </tbody>
        </table>
      `)
    })
    await page.waitForTimeout(120)

    await page.locator('#w-e-textarea-1').click()
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Backspace')
    await page.waitForTimeout(120)

    const afterBackspace = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      return {
        tableCount: (editor.children || []).filter((node: any) => node?.type === 'table').length,
        firstType: editor.children?.[0]?.type || '',
      }
    })

    expect(afterBackspace.tableCount).toBe(0)
    expect(afterBackspace.firstType).toBe('paragraph')

    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml(`
        <table style="width: 100%;">
          <tbody>
            <tr><td>A</td><td>B</td></tr>
          </tbody>
        </table>
      `)
    })
    await page.waitForTimeout(120)

    await page.locator('#w-e-textarea-1').click()
    await page.keyboard.press('Control+A')
    await page.keyboard.press('Control+X')
    await page.waitForTimeout(120)

    const afterCut = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      return {
        tableCount: (editor.children || []).filter((node: any) => node?.type === 'table').length,
        firstType: editor.children?.[0]?.type || '',
      }
    })

    expect(afterCut.tableCount).toBe(0)
    expect(afterCut.firstType).toBe('paragraph')
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

  test('regression #58: indent should only affect paragraph/header when selecting mixed blocks', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }

      editor.setHtml('<p>before image</p><img src="https://example.com/1.png">')
    })

    await selectAll(page)
    const groupIndent = await waitForMenuEnabled(page, 'group-indent')

    await groupIndent.hover()
    const groupPanel = groupIndent.locator('..').locator('.w-e-bar-item-menus-container')

    await groupPanel.waitFor({ state: 'visible' })
    await groupPanel.locator('[data-menu-key="indent"]').click({ force: true })

    const snapshot = await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor
      const paragraphNode = editor?.children?.find((node: any) => node?.type === 'paragraph')
      const imageNode = editor?.children?.find((node: any) => node?.type === 'image')
      const html = editor?.getHtml?.() || ''

      return {
        paragraphIndent: paragraphNode?.indent || '',
        imageIndent: imageNode?.indent || '',
        html,
      }
    })

    expect(snapshot.paragraphIndent).toBe('2em')
    expect(snapshot.imageIndent).toBe('')
    expect(snapshot.html).not.toMatch(/<img[^>]*text-indent/i)
  })

  test('regression #173: code block copy button should copy code text when enabled', async ({ page }) => {
    await page.evaluate(() => {
      const editor = (window as any).wangEditorExampleBridge?.editor

      if (!editor) {
        throw new Error('editor not ready')
      }
      const editorConfig = editor.getConfig?.()

      if (!editorConfig?.MENU_CONF) {
        throw new Error('editor config not ready')
      }
      const win = window as any

      editorConfig.MENU_CONF.codeBlock = {
        ...(editorConfig.MENU_CONF.codeBlock || {}),
        showCopyButton: true,
      }

      win.e2eCopiedCodeText = ''

      const clipboardMock = {
        writeText: async (text: string) => {
          win.e2eCopiedCodeText = text
        },
      }

      try {
        Object.defineProperty(window.navigator, 'clipboard', {
          configurable: true,
          value: clipboardMock,
        })
      } catch (err) {
        // @ts-ignore
        window.navigator.clipboard = clipboardMock
      }

      editor.setHtml(`<pre><code>const a = 1
console.log(a)</code></pre>`)
    })

    const copyButton = page.locator('[data-testid="editor-textarea"] .w-e-code-block-copy-button')

    await expect(copyButton).toBeVisible()
    await copyButton.click()

    const copiedText = await page.evaluate(() => (window as any).e2eCopiedCodeText || '')

    expect(copiedText).toBe('const a = 1\nconsole.log(a)')
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

test('regression #625: duplicated legacy ids should not break DOM-to-Slate mapping', async ({ page }) => {
  const pageErrors: string[] = []

  page.on('pageerror', err => {
    pageErrors.push(err?.stack || err?.message || String(err))
  })

  await page.goto('/examples/default-mode.html')
  await page.evaluate(() => {
    const legacyRoot = document.createElement('div')

    legacyRoot.id = 'legacy-editor-mock'
    legacyRoot.innerHTML = [
      '<div id="w-e-textarea-1" data-slate-editor data-slate-node="value">',
      '  <p id="w-e-element-header1-0" data-slate-node="element">',
      '    <span id="w-e-text-1" data-slate-node="text">',
      '      <span data-slate-leaf><span data-slate-string>legacy</span></span>',
      '    </span>',
      '  </p>',
      '</div>',
    ].join('')
    document.body.prepend(legacyRoot)
  })

  await page.getByTestId('btn-create').click()
  await expect(getEditable(page)).toBeVisible()

  await page.locator('[data-testid="editor-textarea"] [data-slate-string]').first().click()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.type('hello-next')
  await page.waitForTimeout(120)

  const domNodeErrors = pageErrors.filter(msg => msg.includes('Cannot resolve a Slate node from DOM node'))

  expect(domNodeErrors).toEqual([])
  await expect(page.getByTestId('editor-html')).toContainText('hello-next')
})

test('regression #929: block video keeps explicit media alignment under CSS resets', async ({
  page,
}) => {
  await page.goto('/examples/default-mode.html')
  await page.getByTestId('btn-create').click()
  await expect(getEditable(page)).toBeVisible()

  await page.addStyleTag({
    content: `
      [data-testid="editor-textarea"] video,
      [data-testid="editor-textarea"] iframe {
        display: block !important;
      }
    `,
  })
  await page.evaluate(() => {
    const editor = (window as any).wangEditorExampleBridge.editor

    editor.setHtml(
      [
        '<figure data-w-e-type="video" data-w-e-is-void data-w-e-align="center">',
        '<video width="400" height="200" style="width: 400px; height: 200px;">',
        '<source src="data:video/mp4;base64," type="video/mp4"/>',
        '</video>',
        '</figure>',
        '<p><br></p>',
      ].join(''),
    )
  })

  const figure = page.locator('[data-testid="editor-textarea"] .w-e-video')
  const video = figure.locator('video')
  const readLayout = () =>
    page.evaluate(() => {
      const container = document.querySelector(
        '[data-testid="editor-textarea"] .w-e-video',
      ) as HTMLElement | null
      const media = container?.querySelector('video') as HTMLElement | null

      if (!container || !media) {
        throw new Error('video layout not found')
      }

      const containerRect = container.getBoundingClientRect()
      const mediaRect = media.getBoundingClientRect()

      return {
        align: container.dataset.wEAlign,
        containerDisplay: getComputedStyle(container).display,
        mediaDisplay: getComputedStyle(media).display,
        leftGap: Math.round(mediaRect.left - containerRect.left),
        rightGap: Math.round(containerRect.right - mediaRect.right),
      }
    })

  await expect(figure).toBeVisible()
  await expect(video).toBeVisible()

  const centered = await readLayout()

  expect(centered.align).toBe('center')
  expect(centered.containerDisplay).toBe('flex')
  expect(centered.mediaDisplay).toBe('block')
  expect(Math.abs(centered.leftGap - centered.rightGap)).toBeLessThanOrEqual(1)

  await video.click()
  const hoverbar = page.locator('.w-e-hover-bar:visible')

  await expect(hoverbar.locator('[data-menu-key="videoAlignLeft"]')).toBeVisible()
  await expect(hoverbar.locator('[data-menu-key="videoAlignCenter"]')).toBeVisible()
  await expect(hoverbar.locator('[data-menu-key="videoAlignRight"]')).toBeVisible()

  await hoverbar.locator('[data-menu-key="videoAlignRight"]').click()
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const editor = (window as any).wangEditorExampleBridge.editor
        const videoNode = editor.getElemsByTypePrefix('video')[0]

        return videoNode?.align
      }),
    )
    .toBe('right')

  const rightAligned = await readLayout()

  expect(rightAligned.align).toBe('right')
  expect(rightAligned.leftGap).toBeGreaterThan(rightAligned.rightGap)

  await hoverbar.locator('[data-menu-key="videoAlignLeft"]').click()
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const editor = (window as any).wangEditorExampleBridge.editor
        const videoNode = editor.getElemsByTypePrefix('video')[0]

        return videoNode?.align
      }),
    )
    .toBe('left')

  const leftAligned = await readLayout()
  const exportedHtml = await page.evaluate(() => {
    return (window as any).wangEditorExampleBridge.editor.getHtml()
  })

  expect(leftAligned.align).toBe('left')
  expect(leftAligned.leftGap).toBeLessThan(leftAligned.rightGap)
  expect(exportedHtml).toContain('<figure data-w-e-type="video"')
  expect(exportedHtml).toContain('data-w-e-align="left"')
  expect(exportedHtml).toContain('justify-content: flex-start')
})

test.describe('Multi Editors', () => {
  test('edits each editor independently', async ({ page }) => {
    await page.goto('/examples/multi-editors.html')

    const editor1 = page.locator('#editor-text-area-1 [contenteditable="true"]')
    const editor2 = page.locator('#editor-text-area-2 [contenteditable="true"]')

    await editor1.click()
    await expect
      .poll(async () => page.evaluate(() => ({
        activeId: document.activeElement?.id,
        rangeCount: document.getSelection()?.rangeCount ?? 0,
      })))
      .toEqual({ activeId: 'w-e-textarea-1', rangeCount: 1 })
    await page.keyboard.type('abc')
    await expect(page.locator('#content-view-1')).toContainText('编辑器1abc')
    await expect(page.locator('#content-view-2')).toContainText('编辑器2')

    await editor2.click()
    await expect
      .poll(async () => page.evaluate(() => ({
        activeId: document.activeElement?.id,
        rangeCount: document.getSelection()?.rangeCount ?? 0,
      })))
      .toEqual({ activeId: 'w-e-textarea-2', rangeCount: 1 })
    await page.keyboard.type('xyz')
    await expect(page.locator('#content-view-1')).toContainText('编辑器1abc')
    await expect(page.locator('#content-view-2')).toContainText('编辑器2xyz')
  })
})
