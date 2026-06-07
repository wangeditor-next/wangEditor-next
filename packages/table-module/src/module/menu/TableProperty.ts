/**
 * @description set cell property menu
 * @author hsuna
 */

import { IButtonMenu, IDomEditor, t } from '@wangeditor-next/core'
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

export type FieldName =
  | 'width'
  | 'borderStyle'
  | 'borderColor'
  | 'borderWidth'
  | 'backgroundColor'
  | 'textAlign'
  | 'verticalAlign'

type FieldValue = string | undefined

class TableProperty implements IButtonMenu {
  readonly title = t('tableModule.tableProperty')

  iconSvg = TABLE_PROPERTY_SVG

  readonly tag = 'button'

  readonly showModal = true

  readonly modalWidth: number = 340

  readonly menu: string = 'table'

  readonly propertyFields: FieldName[] = [
    'width',
    'borderStyle',
    'borderColor',
    'borderWidth',
    'backgroundColor',
  ]

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

  readonly widthOptions = [
    { value: 'auto', label: t('tableModule.modal.widthAuto') },
    { value: '100%', label: t('tableModule.modal.widthFull') },
  ]

  readonly verticalAlignOptions = [
    { value: 'top', label: t('tableModule.verticalAlign.top') },
    { value: 'middle', label: t('tableModule.verticalAlign.middle') },
    { value: 'bottom', label: t('tableModule.verticalAlign.bottom') },
  ]

  getValue(_editor: IDomEditor): string | boolean {
    return ''
  }

  isActive(_editor: IDomEditor): boolean {
    return false
  }

  isDisabled(editor: IDomEditor): boolean {
    return this.getModalContentNode(editor) == null
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
    const fields = this.propertyFields
    const hasField = (field: FieldName) => fields.includes(field)
    const isCellMenu = this.menu === 'cell'
    const $content = $(`<div class="w-e-table-property-modal">
      ${
        hasField('width')
          ? `
        <div class="babel-container w-e-table-property-row">
          <span class="w-e-table-property-label">${t('tableModule.modal.width')}</span>
          <span class="babel-container-width w-e-table-property-controls">
            <input name="width" type="hidden">
            <span class="w-e-table-property-segment w-e-table-property-segment-fill">
              ${this.widthOptions
                .map(
                  item => `
                <button
                  type="button"
                  class="w-e-table-property-segment-button"
                  data-field="width"
                  data-value="${item.value}"
                  title="${item.label}"
                  aria-label="${item.label}"
                >${item.label}</button>
              `
                )
                .join('')}
            </span>
          </span>
        </div>
      `
          : ''
      }
      <label class="babel-container w-e-table-property-row">
        <span class="w-e-table-property-label">${t('tableModule.modal.borderStyle')}</span>
        <span class="babel-container-select w-e-table-property-controls">
          <select name="borderStyle" aria-label="${t('tableModule.modal.borderStyle')}">
            ${this.borderStyle
              .map(item => `<option value="${item.value}">${item.label}</option>`)
              .join('')}
          </select>
        </span>
      </label>
      <div class="babel-container w-e-table-property-row">
        <span class="w-e-table-property-label">${t('tableModule.modal.borderColor')}</span>
        <span class="babel-container-color w-e-table-property-controls">
          <span
            class="color-group color-group-wide"
            data-mark="color"
            title="${t('tableModule.modal.borderColor')}"
            role="button"
            tabindex="0"
          >
            <span class="color-group-block"></span>
            <span class="color-group-label">${t('tableModule.color.default')}</span>
            <input name="borderColor" type="hidden">
          </span>
        </span>
      </div>
      <label class="babel-container w-e-table-property-row">
        <span class="w-e-table-property-label">${t('tableModule.modal.borderWidth')}</span>
        <span class="babel-container-number w-e-table-property-controls">
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
        <span class="babel-container-color w-e-table-property-controls">
          <span
            class="color-group color-group-wide"
            data-mark="bgColor"
            title="${t('tableModule.modal.bgColor')}"
            role="button"
            tabindex="0"
          >
            <span class="color-group-block"></span>
            <span class="color-group-label">${t('tableModule.color.clear')}</span>
            <input name="backgroundColor" type="hidden">
          </span>
        </span>
      </div>
      ${
        hasField('textAlign')
          ? `
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
                  data-field="textAlign"
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
      `
          : ''
      }
      ${
        hasField('verticalAlign')
          ? `
        <div class="babel-container w-e-table-property-row">
          <span class="w-e-table-property-label">${t('tableModule.modal.verticalAlign')}</span>
          <span class="babel-container-vertical-align w-e-table-property-controls">
            <input name="verticalAlign" type="hidden">
            <span class="w-e-table-property-segment">
              ${this.verticalAlignOptions
                .map(
                  item => `
                <button
                  type="button"
                  class="w-e-table-property-segment-button"
                  data-field="verticalAlign"
                  data-value="${item.value}"
                  title="${item.label}"
                  aria-label="${item.label}"
                >${item.label}</button>
              `
                )
                .join('')}
            </span>
          </span>
        </div>
      `
          : ''
      }
      <div class="button-container">
        <button type="button">${t('tableModule.modal.ok')}</button>
      </div>
    </div>`)

    const changedFields = new Set<FieldName>()

    const markChanged = (field: string | undefined) => {
      if (field == null) {
        return
      }
      if (!fields.includes(field as FieldName)) {
        return
      }
      changedFields.add(field as FieldName)
    }

    const getCommonFieldValue = (field: FieldName): FieldValue => {
      if (!isCellMenu) {
        return data[field] || ''
      }

      const selection = EDITOR_TO_SELECTION.get(editor)

      if (!selection?.length) {
        return data[field] || ''
      }

      let commonValue: FieldValue
      let hasValue = false
      let isMixed = false

      selection.forEach(row => {
        row.forEach(cell => {
          const [cellNode] = cell[0]
          const value = cellNode[field] || ''

          if (!hasValue) {
            commonValue = value
            hasValue = true
            return
          }

          if (commonValue !== value) {
            isMixed = true
          }
        })
      })

      return isMixed ? undefined : commonValue
    }

    // 初始化所有表单的值
    $content.find('[name]').each(elem => {
      const name = $(elem).attr('name') as FieldName
      const value = getCommonFieldValue(name)

      if (value == null) {
        $(elem).val('')
        $(elem).attr('data-mixed', 'true')
        if (elem instanceof HTMLInputElement && elem.type === 'hidden') {
          const colorGroup = elem.closest('.color-group')

          if (colorGroup) {
            $(colorGroup).attr('data-mixed', 'true')
          }
        }
        if (elem instanceof HTMLInputElement && elem.type !== 'hidden') {
          elem.placeholder = t('tableModule.modal.mixed')
        }
        return
      }

      $(elem).val(value)
    })

    $content.find('select,input[name="borderWidth"]').on('change', e => {
      const target = e.currentTarget

      if (target == null) {
        return
      }
      markChanged($(target).attr('name'))
      $(target).attr('data-mixed', 'false')
    })

    const updateButtonGroup = (field: FieldName, value: FieldValue) => {
      $content.find(`[data-field="${field}"]`).each(button => {
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

    updateButtonGroup('width', getCommonFieldValue('width') || '')
    updateButtonGroup('textAlign', getCommonFieldValue('textAlign') || '')
    updateButtonGroup('verticalAlign', getCommonFieldValue('verticalAlign') || '')

    $content.find('[data-field]').on('click', e => {
      const button = e.currentTarget

      if (button == null) {
        return
      }

      const $buttonElem = $(button)
      const value = $buttonElem.attr('data-value') || ''
      const field = $buttonElem.attr('data-field') as FieldName

      const $input = $content.find(`[name="${field}"]`)

      $input.val(value)
      $input.attr('data-mixed', 'false')
      updateButtonGroup(field, value)
      markChanged(field)
    })

    const setSelectedColor = (elem, color) => {
      const $elem = $(elem)
      const $label = $('.color-group-label', elem)

      if (color) {
        $('.color-group-block', elem).css('background-color', color).empty()
        $label.text(color)
        $elem.removeClass('is-empty')
      } else {
        $('.color-group-block', elem).css('background-color', '').html(CLEAN_SVG)
        $label.text(
          $elem.data('mark') === 'color' ? t('tableModule.color.default') : t('tableModule.color.clear')
        )
        $elem.addClass('is-empty')
      }
      $elem.attr('data-empty', color ? 'false' : 'true')
    }

    $content.find('.color-group').each(elem => {
      const selectedColor = $('[type="hidden"]', elem).val() || ''

      setSelectedColor(elem, selectedColor)

      const $elem = $(elem)

      $elem.on('click', () => {
        $content.find('.color-group .w-e-drop-panel').hide()
        let $panel = $elem.data('panel')

        if (!$panel) {
          const colorMark = $elem.data('mark')

          $panel = this.getPanelContentElem(editor, {
            mark: colorMark,
            selectedColor,
            callback: color => {
              const fieldName = colorMark === 'color' ? 'borderColor' : 'backgroundColor'

              $('[type="hidden"]', elem).val(color || '')
              $('[type="hidden"]', elem).attr('data-mixed', 'false')
              $(elem).attr('data-mixed', 'false')
              markChanged(fieldName)
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
        const field = $(elem).attr('name') as FieldName

        if (!changedFields.has(field)) {
          return obj
        }

        obj[field] = $(elem).val()
        return obj
      }, {})

      if (Object.keys(props).length === 0) {
        editor.focus()
        return
      }

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
