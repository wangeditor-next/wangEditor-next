/**
 * @description style preset menu entry
 */

import { genStylePresetMenuConfig } from '../config'
import StylePresetMenu from './StylePresetMenu'

export const stylePresetMenuConf = {
  key: 'stylePreset',
  factory() {
    return new StylePresetMenu()
  },
  config: genStylePresetMenuConfig(),
}
