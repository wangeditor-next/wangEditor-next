/**
 * @description lower-alpha ordered list menu
 * @author wangfupeng
 */

import { t } from '@wangeditor-next/core'

import { NUMBERED_LIST_SVG } from '../../constants/svg'
import { OrderedListType } from '../custom-types'
import BaseMenu from './BaseMenu'

class LowerAlphaListMenu extends BaseMenu {
  readonly ordered = true

  readonly orderType: OrderedListType = 'a'

  readonly title = t('listModule.lowerAlphaList')

  readonly iconSvg = NUMBERED_LIST_SVG
}

export default LowerAlphaListMenu
