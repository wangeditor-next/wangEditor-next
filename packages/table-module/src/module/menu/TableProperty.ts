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
  | 'borderStyle'
  | 'borderColor'
  | 'borderWidth'
  | 'backgroundColor'
  | 'textAlign'
  | 'verticalAlign'

type FieldValue = string | undefined
type SelectOption = { value: string; label: string }
type SegmentOption = SelectOption & { svg?: string }
type AttrValue = string | boolean | undefined
type FieldControl = {
  field: FieldName
  root: HTMLElement
  input: HTMLInputElement
  setValue: (value: FieldValue, mixed?: boolean) => void
  getValue: () => string
  setMixed: (mixed: boolean) => void
}

function createElem<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, AttrValue> = {},
  children: Array<Node | string> = []
): HTMLElementTagNameMap[K] {
  const elem = document.createElement(tag)

  Object.entries(attrs).forEach(([key, value]) => {
    if (value == null || value === false) {
      return
    }

    if (value === true) {
      elem.setAttribute(key, '')
      return
    }

    elem.setAttribute(key, value)
  })

  children.forEach(child => {
    elem.append(typeof child === 'string' ? document.createTextNode(child) : child)
  })

  return elem
}

function getKeyboardEvent(event: Event): KeyboardEvent | null {
  return event instanceof KeyboardEvent ? event : null
}

function isActionKey(event: KeyboardEvent) {
  return event.key === 'Enter' || event.key === ' '
}

class TableProperty implements IButtonMenu {
  readonly title = t('tableModule.tableProperty')

  iconSvg = TABLE_PROPERTY_SVG

  readonly tag = 'button'

  readonly showModal = true

  readonly modalWidth: number = 340

  readonly menu: string = 'table'

  readonly propertyFields: FieldName[] = [
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

  readonly textAlignOptions: SegmentOption[] = [
    { value: 'left', label: t('justify.left'), svg: JUSTIFY_LEFT_SVG },
    { value: 'center', label: t('justify.center'), svg: JUSTIFY_CENTER_SVG },
    { value: 'right', label: t('justify.right'), svg: JUSTIFY_RIGHT_SVG },
    { value: 'justify', label: t('justify.justify'), svg: JUSTIFY_JUSTIFY_SVG },
  ]

  readonly verticalAlignOptions: SegmentOption[] = [
    { value: 'top', label: t('tableModule.verticalAlign.top') },
    { value: 'middle', label: t('tableModule.verticalAlign.middle') },
    { value: 'bottom', label: t('tableModule.verticalAlign.bottom') },
  ]

  private renderRow(label: string, controls: HTMLElement, tag: 'div' | 'label' = 'div') {
    const row = createElem(tag, { class: 'babel-container w-e-table-property-row' })
    const labelElem = createElem('span', { class: 'w-e-table-property-label' }, [label])

    row.append(labelElem, controls)
    return row
  }

  private createFieldControl(
    field: FieldName,
    root: HTMLElement,
    input: HTMLInputElement
  ): FieldControl {
    return {
      field,
      root,
      input,
      setValue: (value, mixed = false) => {
        input.value = value || ''
        input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      },
      getValue: () => input.value,
      setMixed: mixed => {
        input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      },
    }
  }

  private renderSelect(field: FieldName, label: string, options: SelectOption[]): FieldControl {
    const input = createElem('input', { name: field, type: 'hidden' })
    const valueElem = createElem('span', { class: 'w-e-table-property-select-value' })
    const trigger = createElem(
      'button',
      {
        type: 'button',
        class: 'w-e-table-property-select-trigger',
        'aria-label': label,
        'aria-haspopup': 'listbox',
        'aria-expanded': 'false',
      },
      [valueElem]
    )
    const panel = createElem('span', { class: 'w-e-table-property-select-panel', role: 'listbox' })

    options.forEach(item => {
      panel.append(
        createElem(
          'button',
          {
            type: 'button',
            class: 'w-e-table-property-select-option',
            'data-select-option-field': field,
            'data-value': item.value,
            role: 'option',
          },
          [item.label]
        )
      )
    })

    const select = createElem(
      'span',
      { class: 'w-e-table-property-select', 'data-select-field': field },
      [trigger, panel]
    )
    const controls = createElem(
      'span',
      { class: 'babel-container-select w-e-table-property-controls' },
      [input, select]
    )
    const root = this.renderRow(label, controls)
    const control = this.createFieldControl(field, root, input)

    control.setValue = (value, mixed = false) => {
      const displayValue = field === 'borderStyle' && !value ? 'none' : value
      const selectedOption = options.find(item => item.value === displayValue)
      const displayLabel = mixed ? t('tableModule.modal.mixed') : selectedOption?.label || ''

      input.value = displayValue || ''
      input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      select.setAttribute('data-mixed', mixed ? 'true' : 'false')
      valueElem.textContent = displayLabel

      Array.from(panel.querySelectorAll<HTMLElement>('.w-e-table-property-select-option')).forEach(
        option => {
          const isActive = !mixed && option.dataset.value === displayValue

          option.classList.toggle('active', isActive)
          option.setAttribute('aria-selected', isActive ? 'true' : 'false')
        }
      )
    }
    control.setMixed = mixed => {
      input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      select.setAttribute('data-mixed', mixed ? 'true' : 'false')
      if (mixed) {
        valueElem.textContent = t('tableModule.modal.mixed')
      }
    }

    return control
  }

  private renderNumber(field: FieldName, label: string): FieldControl {
    const input = createElem('input', {
      name: field,
      type: 'number',
      min: '0',
      placeholder: t('tableModule.modal.borderWidthDefault'),
      'aria-label': label,
    })
    const number = createElem('span', { class: 'w-e-table-property-number' }, [
      input,
      createElem('span', { class: 'w-e-table-property-unit' }, ['px']),
    ])
    const controls = createElem(
      'span',
      { class: 'babel-container-number w-e-table-property-controls' },
      [number]
    )

    return this.createFieldControl(field, this.renderRow(label, controls, 'label'), input)
  }

  private renderColor(
    field: FieldName,
    mark: string,
    label: string,
    emptyLabel: string
  ): FieldControl {
    const block = createElem('span', { class: 'color-group-block' })
    const labelElem = createElem('span', { class: 'color-group-label' }, [emptyLabel])
    const input = createElem('input', { name: field, type: 'hidden' })
    const colorGroup = createElem(
      'span',
      {
        class: 'color-group color-group-wide',
        'data-mark': mark,
        title: label,
        role: 'button',
        tabindex: '0',
      },
      [block, labelElem, input]
    )
    const controls = createElem(
      'span',
      { class: 'babel-container-color w-e-table-property-controls' },
      [colorGroup]
    )
    const root = this.renderRow(label, controls)
    const control = this.createFieldControl(field, root, input)

    control.setValue = (value, mixed = false) => {
      input.value = value || ''
      input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      colorGroup.setAttribute('data-mixed', mixed ? 'true' : 'false')

      if (value) {
        block.style.backgroundColor = value
        block.innerHTML = ''
        labelElem.textContent = value
        colorGroup.classList.remove('is-empty')
      } else {
        block.style.backgroundColor = ''
        block.innerHTML = CLEAN_SVG
        labelElem.textContent = emptyLabel
        colorGroup.classList.add('is-empty')
      }
      colorGroup.setAttribute('data-empty', value ? 'false' : 'true')
    }
    control.setMixed = mixed => {
      input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      colorGroup.setAttribute('data-mixed', mixed ? 'true' : 'false')
    }

    return control
  }

  private renderSegment(
    field: FieldName,
    label: string,
    options: SegmentOption[],
    fill = false
  ): FieldControl {
    const input = createElem('input', { name: field, type: 'hidden' })
    const segment = createElem('span', {
      class: `w-e-table-property-segment${fill ? ' w-e-table-property-segment-fill' : ''}`,
    })

    options.forEach(item => {
      const button = createElem('button', {
        type: 'button',
        class: `w-e-table-property-segment-button${
          item.svg ? ' w-e-table-property-align-button' : ''
        }`,
        'data-field': field,
        'data-value': item.value,
        title: item.label,
        'aria-label': item.label,
      })

      if (item.svg) {
        button.innerHTML = item.svg
      } else {
        button.textContent = item.label
      }
      segment.append(button)
    })

    const controls = createElem(
      'span',
      { class: 'babel-container-align w-e-table-property-controls' },
      [input, segment]
    )
    const root = this.renderRow(label, controls)
    const control = this.createFieldControl(field, root, input)

    control.setValue = (value, mixed = false) => {
      input.value = value || ''
      input.setAttribute('data-mixed', mixed ? 'true' : 'false')
      Array.from(segment.querySelectorAll<HTMLElement>('[data-field]')).forEach(button => {
        const isActive = !mixed && button.dataset.value === value

        button.classList.toggle('active', isActive)
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false')
      })
    }

    return control
  }

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
    const fieldControls = [
      this.renderSelect('borderStyle', t('tableModule.modal.borderStyle'), this.borderStyle),
      this.renderColor(
        'borderColor',
        'color',
        t('tableModule.modal.borderColor'),
        t('tableModule.color.default')
      ),
      this.renderNumber('borderWidth', t('tableModule.modal.borderWidth')),
      this.renderColor(
        'backgroundColor',
        'bgColor',
        t('tableModule.modal.bgColor'),
        t('tableModule.color.clear')
      ),
    ]
    const content = createElem(
      'div',
      { class: 'w-e-table-property-modal' },
      fieldControls.map(control => control.root)
    )

    if (hasField('textAlign')) {
      const control = this.renderSegment(
        'textAlign',
        t('tableModule.modal.align'),
        this.textAlignOptions
      )

      fieldControls.push(control)
      content.append(control.root)
    }
    if (hasField('verticalAlign')) {
      const control = this.renderSegment(
        'verticalAlign',
        t('tableModule.modal.verticalAlign'),
        this.verticalAlignOptions
      )

      fieldControls.push(control)
      content.append(control.root)
    }

    content.append(
      createElem('div', { class: 'button-container' }, [
        createElem('button', { type: 'button' }, [t('tableModule.modal.ok')]),
      ])
    )

    const $content = $(content)
    const controls = new Map<FieldName, FieldControl>()

    fieldControls.forEach(control => {
      controls.set(control.field, control)
    })

    const changedFields = new Set<FieldName>()

    const closeSelectPanels = () => {
      $content.find('.w-e-table-property-select-panel').hide()
      $content.find('.w-e-table-property-select-trigger').attr('aria-expanded', 'false')
    }

    $content.on('mousedown', e => {
      const target = e.target

      if (!(target instanceof Element)) {
        return
      }
      if (target.closest('.w-e-table-property-select')) {
        return
      }
      closeSelectPanels()
    })

    const markChanged = (field: string | undefined) => {
      if (field == null) {
        return
      }
      if (!fields.includes(field as FieldName)) {
        return
      }
      changedFields.add(field as FieldName)
    }

    const setFieldValue = (field: FieldName, value: FieldValue, mixed = false) => {
      controls.get(field)?.setValue(value, mixed)
    }

    const getFieldValue = (field: FieldName) => controls.get(field)?.getValue() || ''

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

    const getDisplayFieldValue = (field: FieldName, value: FieldValue): FieldValue => {
      if (field === 'borderStyle' && !value) {
        return 'none'
      }
      return value
    }

    // 初始化所有表单的值
    controls.forEach((control, name) => {
      const value = getCommonFieldValue(name)
      const displayValue = getDisplayFieldValue(name, value)

      if (value == null) {
        setFieldValue(name, '', true)
        if (control.input.type === 'hidden') {
          const colorGroup = control.input.closest('.color-group')

          if (colorGroup) {
            $(colorGroup).attr('data-mixed', 'true')
          }
        }
        if (control.input.type !== 'hidden') {
          control.input.placeholder = t('tableModule.modal.mixed')
        }
        return
      }

      setFieldValue(name, displayValue)
    })

    controls.get('borderWidth')?.input.addEventListener('change', e => {
      const target = e.currentTarget as HTMLInputElement

      markChanged(target.name)
      target.setAttribute('data-mixed', 'false')
    })

    $content.find('.w-e-table-property-select-trigger').on('click', e => {
      e.preventDefault()
      e.stopPropagation()

      const trigger = e.currentTarget

      if (trigger == null) {
        return
      }
      const $trigger = $(trigger)
      const $select = $trigger.parents('.w-e-table-property-select')
      const $panel = $select.find('.w-e-table-property-select-panel')
      const isOpen = $trigger.attr('aria-expanded') === 'true'

      $content.find('.color-group .w-e-drop-panel').hide()
      closeSelectPanels()

      if (!isOpen) {
        $panel.show()
        $trigger.attr('aria-expanded', 'true')
      }
    })

    $content.find('.w-e-table-property-select-trigger').on('keydown', e => {
      const keyboardEvent = getKeyboardEvent(e)
      const trigger = e.currentTarget

      if (keyboardEvent == null || !(trigger instanceof HTMLElement)) {
        return
      }

      if (isActionKey(keyboardEvent)) {
        keyboardEvent.preventDefault()
        trigger.click()
        return
      }

      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault()
        closeSelectPanels()
      }
    })

    $content.find('.w-e-table-property-select-option').on('click', e => {
      e.preventDefault()
      e.stopPropagation()

      const option = e.currentTarget

      if (option == null) {
        return
      }
      const $option = $(option)
      const field = $option.attr('data-select-option-field') as FieldName
      const value = $option.attr('data-value') || ''

      setFieldValue(field, value)
      markChanged(field)
      closeSelectPanels()
    })

    $content.find('.w-e-table-property-select-option').on('keydown', e => {
      const keyboardEvent = getKeyboardEvent(e)
      const option = e.currentTarget

      if (keyboardEvent == null || !(option instanceof HTMLElement)) {
        return
      }

      if (isActionKey(keyboardEvent)) {
        keyboardEvent.preventDefault()
        option.click()
        return
      }

      if (keyboardEvent.key === 'Escape') {
        keyboardEvent.preventDefault()
        closeSelectPanels()
      }
    })

    $content.find('[data-field]').on('click', e => {
      const button = e.currentTarget

      if (button == null) {
        return
      }

      const $buttonElem = $(button)
      const value = $buttonElem.attr('data-value') || ''
      const field = $buttonElem.attr('data-field') as FieldName

      setFieldValue(field, value)
      markChanged(field)
    })

    const applyBorderVisibilityDefaults = () => {
      const currentBorderStyle = getFieldValue('borderStyle')
      const currentBorderWidth = getFieldValue('borderWidth')

      if (!currentBorderStyle || currentBorderStyle === 'none') {
        setFieldValue('borderStyle', 'solid')
        markChanged('borderStyle')
      }

      if (!currentBorderWidth || currentBorderWidth === '0') {
        setFieldValue('borderWidth', '1')
        markChanged('borderWidth')
      }
    }

    $content.find('.color-group').each(elem => {
      const $elem = $(elem)

      const openColorPanel = () => {
        closeSelectPanels()
        $content.find('.color-group .w-e-drop-panel').hide()
        let $panel = $elem.data('panel')
        const colorMark = $elem.data('mark')
        const fieldName = colorMark === 'color' ? 'borderColor' : 'backgroundColor'

        if (!$panel) {
          $panel = this.getPanelContentElem(editor, {
            mark: colorMark,
            selectedColor: getFieldValue(fieldName),
            callback: color => {
              setFieldValue(fieldName, color || '')
              $(elem).attr('data-mixed', 'false')
              markChanged(fieldName)
              if (fieldName === 'borderColor' && color) {
                applyBorderVisibilityDefaults()
              }
              $panel.hide()
            },
          })
          $elem.append($panel)
          $elem.data('panel', $panel)
        } else {
          this.updateColorPanelActive($panel, getFieldValue(fieldName))
          $panel.show()
        }
      }

      $elem.on('click', () => {
        openColorPanel()
      })

      $elem.on('keydown', e => {
        const keyboardEvent = getKeyboardEvent(e)

        if (keyboardEvent == null || !isActionKey(keyboardEvent)) {
          return
        }

        keyboardEvent.preventDefault()
        openColorPanel()
      })
    })

    const $button = $content.find('.button-container button')

    $button.on('click', () => {
      const props = Array.from(controls).reduce((obj, [field, control]) => {
        if (!changedFields.has(field)) {
          return obj
        }

        obj[field] = control.getValue()
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
    const colorPanel = createElem('ul', { class: 'w-e-panel-content-color' })
    const $colorPanel = $(colorPanel)

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
      const $block = $(createElem('div', { class: 'color-block', 'data-value': color }))

      $block.css('background-color', color)

      const $li = $(createElem('li', { 'data-value': color }))

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
    const clearLi = createElem('li', { 'data-value': '', class: 'clear' })

    clearLi.innerHTML = CLEAN_SVG
    clearLi.append(document.createTextNode(clearText))
    const $clearLi = $(clearLi)

    $colorPanel.prepend($clearLi)

    const $panel = $(createElem('div', { class: 'w-e-drop-panel' }))

    $panel.append($colorPanel)
    return $panel
  }

  updateColorPanelActive($panel, selectedColor: string) {
    $panel.find('li').each(li => {
      const $li = $(li)
      const isActive = $li.attr('data-value') === selectedColor

      if (isActive) {
        $li.addClass('active')
      } else {
        $li.removeClass('active')
      }
    })
  }
}

export default TableProperty
