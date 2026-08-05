/**
 * @description lower dot emphasis menu
 */

import { t } from '@wangeditor-next/core'

import { EMPHASIS_DOT_SVG } from '../../../constants/icon-svg'
import BaseMenu from './BaseMenu'

class EmphasisDotMenu extends BaseMenu {
  readonly mark = 'emphasisDot'

  readonly title = t('textStyle.emphasisDot')

  readonly iconSvg = EMPHASIS_DOT_SVG

  readonly hotkey = ''
}

export default EmphasisDotMenu
