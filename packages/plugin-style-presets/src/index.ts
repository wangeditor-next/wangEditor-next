/**
 * @description style presets plugin entry
 */

import module from './module/index'

export { applyStylePreset, getActiveStylePreset, removeStylePreset } from './module/commands'
export {
  getStylePresetClassNames,
  STYLE_PRESET_DATA_ATTRIBUTE,
  STYLE_PRESET_PROPERTY,
} from './module/helpers'
export type { IStylePreset, IStylePresetMenuConfig, StylePresetScope } from './module/types'

export default module
