/**
 * @description wavy underline menu
 */

import { t } from '@wangeditor-next/core'

import { WAVY_UNDERLINE_SVG } from '../../../constants/icon-svg'
import BaseMenu from './BaseMenu'

class WavyUnderlineMenu extends BaseMenu {
  readonly mark = 'wavyUnderline'

  readonly title = t('textStyle.wavyUnderline')

  readonly iconSvg = WAVY_UNDERLINE_SVG

  readonly hotkey = ''
}

export default WavyUnderlineMenu
