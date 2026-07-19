/**
 * @description style preset config
 */

import { IDomEditor } from '@wangeditor-next/editor'

import { IStylePreset, IStylePresetMenuConfig } from './types'

const PRESET_KEY_REGEXP = /^[a-z][a-z0-9-]{0,63}$/
const CLASS_NAME_REGEXP = /^-?[_a-zA-Z]+[_a-zA-Z0-9-]*$/

export function genStylePresetMenuConfig(): IStylePresetMenuConfig {
  return { presets: [] }
}

function validateClassNames(preset: IStylePreset) {
  const { className = '', key } = preset
  const classNames = className.trim().split(/\s+/).filter(Boolean)

  classNames.forEach(name => {
    if (!CLASS_NAME_REGEXP.test(name)) {
      throw new Error(`Invalid class name "${name}" for style preset "${key}".`)
    }
  })
}

function validatePresets(presets: IStylePreset[]) {
  const keys = new Set<string>()
  const classMappings: Array<{
    classNames: string[]
    key: string
    scope: IStylePreset['scope']
  }> = []

  presets.forEach(preset => {
    if (!preset || typeof preset !== 'object') {
      throw new Error('Style presets must be objects.')
    }
    if (!PRESET_KEY_REGEXP.test(preset.key)) {
      throw new Error(`Invalid style preset key "${preset.key}". Use kebab-case.`)
    }
    if (typeof preset.title !== 'string' || !preset.title.trim()) {
      throw new Error(`Style preset "${preset.key}" requires a title.`)
    }
    if (preset.scope !== 'text' && preset.scope !== 'block') {
      throw new Error(`Style preset "${preset.key}" requires scope "text" or "block".`)
    }
    if (keys.has(preset.key)) {
      throw new Error(`Duplicate style preset key "${preset.key}".`)
    }

    validateClassNames(preset)

    const classNames = (preset.className || `w-e-style-preset-${preset.key}`)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .sort()
    const conflictingMapping = classMappings.find(mapping => {
      if (mapping.scope !== preset.scope) {
        return false
      }
      const previousClassNames = new Set(mapping.classNames)
      const currentClassNames = new Set(classNames)

      return (
        classNames.every(name => previousClassNames.has(name)) ||
        mapping.classNames.every(name => currentClassNames.has(name))
      )
    })

    if (conflictingMapping) {
      throw new Error(
        `Ambiguous class mapping between style presets "${conflictingMapping.key}" and "${preset.key}".`
      )
    }

    keys.add(preset.key)
    classMappings.push({ classNames, key: preset.key, scope: preset.scope })
  })
}

export function getStylePresetConfig(editor: IDomEditor): IStylePresetMenuConfig {
  const menuConfig = editor.getMenuConfig(
    'stylePreset'
  ) as unknown as Partial<IStylePresetMenuConfig>
  const presets = menuConfig?.presets

  if (presets == null) {
    return genStylePresetMenuConfig()
  }
  if (!Array.isArray(presets)) {
    throw new Error('Style preset config "presets" must be an array.')
  }

  validatePresets(presets)
  return { presets }
}

export function findStylePreset(editor: IDomEditor, key: string): IStylePreset | undefined {
  return getStylePresetConfig(editor).presets.find(preset => preset.key === key)
}
