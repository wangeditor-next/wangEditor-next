/**
 * @description editor react component
 * @author wangfupeng
 */

import type { IDomEditor, IEditorConfig } from '@wangeditor-next/editor'
import {
  createEditor, SlateDescendant,
} from '@wangeditor-next/editor'
import React, { useEffect, useRef, useState } from 'react'

interface IProps {
  defaultContent?: SlateDescendant[]
  onCreated?: (editor: IDomEditor) => void
  defaultHtml?: string
  value?: string
  onChange: (editor: IDomEditor) => void
  defaultConfig: Partial<IEditorConfig>
  mode?: string
  style?: React.CSSProperties
  className?: string
}

interface ICustomDomEditor extends IDomEditor {
  __react_on_change?: (editor: ICustomDomEditor) => void;
}

function EditorComponent(props: Partial<IProps>) {
  const {
    defaultContent = [], onCreated, defaultHtml = '', value = '', onChange, defaultConfig = {}, mode = 'default', style = {}, className,
  } = props
  const ref = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<ICustomDomEditor | null>(null)
  const [curValue, setCurValue] = useState('')

  const handleCreated = (createdEditor: IDomEditor) => {
    // 组件属性 onCreated
    if (onCreated) { onCreated(createdEditor) }

    // 编辑器 配置 onCreated
    const { onCreated: onCreatedFromConfig } = defaultConfig

    if (onCreatedFromConfig) { onCreatedFromConfig(createdEditor) }
  }

  const handleDestroyed = (destroyedEditor: IDomEditor) => {
    const { onDestroyed } = defaultConfig

    setEditor(null)
    if (onDestroyed) {
      onDestroyed(destroyedEditor)
    }
  }

  useEffect(() => {
    if (editor == null) { return }

    // eslint-disable-next-line no-underscore-dangle
    editor.__react_on_change = (e: IDomEditor) => {
      setCurValue(e.getHtml()) // 记录当前 html 值

      // 组件属性 onChange
      if (onChange) { onChange(e) }

      // 编辑器 配置 onChange
      const { onChange: onChangeFromConfig } = defaultConfig

      if (onChangeFromConfig) { onChangeFromConfig(e) }
    }
  }, [editor, defaultConfig])

  // value 变化，重置 HTML
  useEffect(() => {
    if (editor == null) { return }

    if (value === curValue) { return } // 如果和当前 html 值相等，则忽略

    // ------ 重新设置 HTML ------
    try {
      editor.setHtml(value)
    } catch (error) {
      console.error(error)
    }

  }, [value])

  useEffect(() => {
    if (ref.current == null) { return }
    if (editor != null) { return }
    // 防止重复渲染 当编辑器已经创建就不在创建了
    if (ref.current?.getAttribute('data-w-e-textarea')) { return }

    const newEditor = createEditor({
      selector: ref.current,
      config: {
        ...defaultConfig,
        onCreated: handleCreated,
        // eslint-disable-next-line no-underscore-dangle
        onChange: (e: IDomEditor) => newEditor?.__react_on_change?.(e),
        onDestroyed: handleDestroyed,
      },
      content: defaultContent,
      html: defaultHtml || value,
      mode,
    })as ICustomDomEditor

    setEditor(newEditor)
  }, [editor])

  return <div style={style} ref={ref} className={className}></div>
}

export default EditorComponent
