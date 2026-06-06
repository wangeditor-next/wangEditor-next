/**
 * @description set cell property menu
 * @author hsuna
 */

import { DomEditor, IButtonMenu, IDomEditor, t } from '@wangeditor-next/core'
import { Editor, Transforms } from 'slate'

import {
  CLEAN_SVG,
  JUSTIFY_CENTER_SVG,
  JUSTIFY_JUSTIFY_SVG,
  JUSTIFY_LEFT_SVG,
  JUSTIFY_RIGHT_SVG,
  TABLE_PROPERTY_SVG,
} from '../../constants/svg'
import { isOfType } from '../../utils'
import $ from '../../utils/dom'
import { EDITOR_TO_SELECTION } from '../weak-maps'

class TableProperty implements IButtonMenu {
  readonly title = t('tableModule.tableProperty')

  iconSvg = TABLE_PROPERTY_SVG

  readonly tag = 'button'

  readonly showModal = true

  readonly modalWidth = 360

  readonly menu: string = 'table'

  readonly borderStyle = [
    { value: 'none', label: t('tableModule.borderStyle.none') },
    { value: 'solid', label: t('tableModule.borderStyle.solid') },
    { value: 'dotted', label: t('tableModule.borderStyle.dotted') },
    { value: 'dashed', label: t('tableModule.borderStyle.dashed') },
    { value: 'double', label: t('tableModule.borderStyle.double') },
    { value: 'groove', label: t('tableModule.borderStyle.groove') },
    { value: 'ridge', label: t('tableModule.borderStyle.ridge') },
    { value: 'inset', label: t('tableModule.borderStyle.inset') },
    { value: 'outset', label: t('tableModule.borderStyle.outset') },
  ]

  readonly textAlignOptions = [
    { value: 'left', label: t('justify.left'), svg: JUSTIFY_LEFT_SVG },
    { value: 'center', label: t('justify.center'), svg: JUSTIFY_CENTER_SVG },
    { value: 'right', label: t('justify.right'), svg: JUSTIFY_RIGHT_SVG },
    { value: 'justify', label: t('justify.justify'), svg: JUSTIFY_JUSTIFY_SVG },
  ]

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    const tableNode = DomEditor.getSelectedNodeByType(editor, 'table')

    if (tableNode == null) {
      return true
    }
    return false
  }

  exec(_editor: IDomEditor, _value: string | boolean) {
    // 此处空着即可
  }

  getModalContentNode(editor: IDomEditor) {
    const [node] = Editor.nodes(editor, {
      match: isOfType(editor, 'table'),
    })

    return node
  }

  getModalPositionNode(_editor: IDomEditor) {
    return null
  }

  getModalContentElem(editor: IDomEditor) {
    const node = this.getModalContentNode(editor)

    if (!node) {
      return null
    }

    const [data, path] = node
    const $content = $(`<div class="w-e-table-property-modal">
      <label class="babel-container w-e-table-property-row">
        <span class="w-e-table-property-label">${t('tableModule.modal.border')}</span>
        <span class="babel-container-border w-e-table-property-controls">
          <select name="borderStyle" aria-label="${t('tableModule.modal.border')}">
            ${this.borderStyle
              .map(item => `<option value="${item.value}">${item.label}</option>`)
              .join('')}
          </select>
          <span class="color-group" data-mark="color" title="${t('tableModule.modal.borderColor')}">
            <span class="color-group-block"></span>
            <input name="borderColor" type="hidden">
          </span>
          <span class="w-e-table-property-number">
            <input name="borderWidth" type="number" min="0" placeholder="${t(
              'tableModule.modal.borderWidth'
            )}" aria-label="${t('tableModule.modal.borderWidth')}">
            <span class="w-e-table-property-unit">px</span>
          </span>
        </span>
      </label>
      <div class="babel-container w-e-table-property-row">
        <span class="w-e-table-property-label">${t('tableModule.modal.bgColor')}</span>
        <span class="babel-container-background w-e-table-property-controls">
          <span class="color-group" data-mark="bgColor" title="${t('tableModule.modal.bgColor')}">
            <span class="color-group-block"></span>
            <input name="backgroundColor" type="hidden">
          </span>
        </span>
      </div>
      <div class="babel-container w-e-table-property-row">
        <span class="w-e-table-property-label">${t('tableModule.modal.align')}</span>
        <span class="babel-container-align w-e-table-property-controls">
          <input name="textAlign" type="hidden">
          <span class="w-e-table-property-align">
            ${this.textAlignOptions
              .map(
                item => `
              <button
                type="button"
                class="w-e-table-property-align-button"
                data-value="${item.value}"
                title="${item.label}"
                aria-label="${item.label}"
              >${item.svg}</button>
            `
              )
              .join('')}
          </span>
        </span>
      </div>
      <div class="button-container">
        <button type="button">${t('tableModule.modal.ok')}</button>
      </div>
    </div>`)

    // 初始化所有表单的值
    $content.find('[name]').each(elem => {
      $(elem).val(data[$(elem).attr('name')])
    })

    const updateTextAlignButton = value => {
      $content.find('.w-e-table-property-align-button').each(button => {
        const $buttonElem = $(button)
        const isActive = $buttonElem.attr('data-value') === value

        if (isActive) {
          $buttonElem.addClass('active')
          $buttonElem.attr('aria-pressed', 'true')
        } else {
          $buttonElem.removeClass('active')
          $buttonElem.attr('aria-pressed', 'false')
        }
      })
    }

    updateTextAlignButton($content.find('[name="textAlign"]').val() || '')

    $content.find('.w-e-table-property-align-button').on('click', e => {
      const button = e.currentTarget

      if (button == null) {
        return
      }

      const $buttonElem = $(button)
      const value = $buttonElem.attr('data-value') || ''

      $content.find('[name="textAlign"]').val(value)
      updateTextAlignButton(value)
    })

    const setSelectedColor = (elem, color) => {
      if (color) {
        $('.color-group-block', elem).css('background-color', color).empty()
      } else {
        $('.color-group-block', elem).css('background-color', '').html(CLEAN_SVG)
      }
    }

    $content.find('.color-group').each(elem => {
      const selectedColor = $('[type="hidden"]', elem).val() || ''

      setSelectedColor(elem, selectedColor)

      const $elem = $(elem)

      $elem.on('click', () => {
        $content.find('.color-group .w-e-drop-panel').hide()
        let $panel = $elem.data('panel')

        if (!$panel) {
          $panel = this.getPanelContentElem(editor, {
            mark: $elem.data('mark'),
            selectedColor,
            callback: color => {
              $('[type="hidden"]', elem).val(color || '')
              setSelectedColor(elem, color)
              $panel.hide()
            },
          })
          $elem.append($panel)
          $elem.data('panel', $panel)
        } else {
          $panel.show()
        }
      })
    })

    const $button = $content.find('.button-container button')

    $button.on('click', () => {
      const props = Array.from($content.find('[name]')).reduce((obj, elem) => {
        obj[$(elem).attr('name')] = $(elem).val()
        return obj
      }, {})

      const selection = EDITOR_TO_SELECTION.get(editor)

      if (this.menu === 'cell' && !!selection?.length) {
        selection.forEach(row => {
          row.forEach(cell => {
            Transforms.setNodes(editor, props, { at: cell[0][1] })
          })
        })
      } else {
        Transforms.setNodes(editor, props, { at: path })
      }

      setTimeout(() => {
        editor.focus()
      })
    })

    return $content[0]
  }

  getPanelContentElem(editor, { mark, selectedColor, callback }) {
    const $colorPanel = $('<ul class="w-e-panel-content-color"></ul>')

    $colorPanel.on('click', 'li', e => {
      const { target } = e

      if (!target) {
        return
      }
      e.preventDefault()
      e.stopPropagation()

      const $li = $(target)
      const val = $li.attr('data-value')

      callback(val)
    })

    const colorConf = editor.getMenuConfig(mark)
    const { colors = [] } = colorConf

    colors.forEach(color => {
      const $block = $(`<div class="color-block" data-value="${color}"></div>`)

      $block.css('background-color', color)

      const $li = $(`<li data-value="${color}"></li>`)

      if (selectedColor === color) {
        $li.addClass('active')
      }
      $li.append($block)

      $colorPanel.append($li)
    })

    let clearText = ''

    if (mark === 'color') {
      clearText = t('tableModule.color.default')
    }
    if (mark === 'bgColor') {
      clearText = t('tableModule.color.clear')
    }
    const $clearLi = $(`
      <li data-value="" class="clear">
        ${CLEAN_SVG}
        ${clearText}
      </li>
    `)

    $colorPanel.prepend($clearLi)

    const $panel = $('<div class="w-e-drop-panel"></div>')

    $panel.append($colorPanel)
    return $panel
  }
}

export default TableProperty
