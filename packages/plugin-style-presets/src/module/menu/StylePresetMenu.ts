/**
 * @description style preset select menu
 */

import { IDomEditor, IOption, ISelectMenu, t } from '@wangeditor-next/editor'

import { STYLE_PRESET_SVG } from '../../constants/icon-svg'
import { applyStylePreset, getActiveStylePreset, removeStylePreset } from '../commands'
import { getStylePresetConfig } from '../config'

class StylePresetMenu implements ISelectMenu {
  readonly title = t('stylePreset.title')

  readonly iconSvg = STYLE_PRESET_SVG

  readonly tag = 'select'

  readonly width = 100

  getOptions(editor: IDomEditor): IOption[] {
    const { presets } = getStylePresetConfig(editor)

    return [
      { text: t('stylePreset.default'), value: '' },
      ...presets.map(preset => ({
        text: preset.title,
        value: preset.key,
      })),
    ]
  }

  getValue(editor: IDomEditor): string | boolean {
    return getActiveStylePreset(editor) || ''
  }

  isActive(_editor: IDomEditor): boolean {
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    if (editor.selection == null) {
      return true
    }
    return getStylePresetConfig(editor).presets.length === 0
  }

  exec(editor: IDomEditor, value: string | boolean): void {
    const key = typeof value === 'string' ? value : ''

    if (!key) {
      removeStylePreset(editor)
      return
    }

    applyStylePreset(editor, key)
  }
}

export default StylePresetMenu
