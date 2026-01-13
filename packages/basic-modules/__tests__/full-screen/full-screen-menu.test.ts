/**
 * @description full screen menu test
 * @author wangfupeng
 */

import { t } from '@wangeditor-next/core'

import createEditor from '../../../../tests/utils/create-editor'
import { CANCEL_FULL_SCREEN_SVG, FULL_SCREEN_SVG } from '../../src/constants/icon-svg'
import FullScreen from '../../src/modules/full-screen/menu/FullScreen'

describe('full screen menu', () => {
  let editor: ReturnType<typeof createEditor>
  let menu: FullScreen

  beforeEach(() => {
    editor = createEditor()
    menu = new FullScreen()
  })

  afterEach(async () => {
    vi.useRealTimers()
    await Promise.resolve()
    editor.destroy()
  })

  it('is disabled', () => {
    expect(menu.isDisabled(editor)).toBeFalsy()
  })

  it('full screen menu', () => {
    vi.useFakeTimers()
    expect(menu.getValue(editor)).toBe('')
    menu.exec(editor, '') // 设置全屏
    expect(menu.isActive(editor)).toBeTruthy()

    menu.exec(editor, '') // 取消全屏（有延迟）
    vi.advanceTimersByTime(200)
    expect(menu.isActive(editor)).toBeFalsy()
  })

  it('get title', () => {
    expect(menu.getTitle(editor)).toBe(t('fullScreen.title'))
    menu.exec(editor, '')
    expect(menu.getTitle(editor)).toBe(t('fullScreen.cancelTitle'))
  })

  it('get icon', () => {
    let svg = menu.getIcon(editor)

    expect(svg).toBe(FULL_SCREEN_SVG)
    menu.exec(editor, '')
    svg = menu.getIcon(editor)
    expect(svg).toBe(CANCEL_FULL_SCREEN_SVG)
  })
})
