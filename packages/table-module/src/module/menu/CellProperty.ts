import { IButtonMenu, IDomEditor, t } from '@wangeditor-next/core'
import { Editor } from 'slate'

import { CELL_PROPERTY_SVG } from '../../constants/svg'
import { isOfType } from '../../utils'
import TableProperty from './TableProperty'

class CellProperty extends TableProperty implements IButtonMenu {
  readonly title = t('tableModule.cellProperty')

  readonly iconSvg = CELL_PROPERTY_SVG

  readonly tag = 'button'

  readonly showModal = true

  readonly modalWidth = 360

  readonly menu = 'cell'

  getModalContentNode(editor: IDomEditor) {
    const [node] = Editor.nodes(editor, {
      match: isOfType(editor, 'td'),
    })

    return node
  }
}

export default CellProperty
