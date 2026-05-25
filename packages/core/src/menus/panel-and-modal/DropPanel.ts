/**
 * @description dropPanel class
 * @author wangfupeng
 */

import $, { Dom7Array } from '../../utils/dom'
import PanelAndModal from './BaseClass'

class DropPanel extends PanelAndModal {
  type = 'dropPanel'

  readonly $elem: Dom7Array = $('<div class="w-e-drop-panel"></div>')

  genSelfElem(): Dom7Array | null {
    return null
  }
}

export default DropPanel
