/**
 * @description editor react component
 * @author wangfupeng
 */

import type { IDomEditor, IEditorConfig } from '@wangeditor-next/editor'
import {
  createEditor, SlateDescendant,
} from '@wangeditor-next/editor'
import React, {
  useCallback, useEffect, useRef, useState,
} from 'react'

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
  loading?: boolean
  loadingText?: React.ReactNode
}

interface ICustomDomEditor extends IDomEditor {
  __react_on_change?: (editor: ICustomDomEditor) => void;
}

function EditorComponent(props: Partial<IProps>) {
  const {
    defaultContent = [], onCreated, defaultHtml = '', value = '', onChange, defaultConfig = {}, mode = 'default', style = {}, className,
    loading = false, loadingText = 'Loading...',
  } = props
  const ref = useRef<HTMLDivElement>(null)
  const latestHtmlRef = useRef('')
  const isSyncingFromPropsRef = useRef(false)
  const [editor, setEditor] = useState<ICustomDomEditor | null>(null)

  const handleCreated = useCallback((createdEditor: IDomEditor) => {
    // 组件属性 onCreated
    if (onCreated) { onCreated(createdEditor) }

    // 编辑器 配置 onCreated
    const { onCreated: onCreatedFromConfig } = defaultConfig

    if (onCreatedFromConfig) { onCreatedFromConfig(createdEditor) }
  }, [defaultConfig, onCreated])

  const handleDestroyed = useCallback((destroyedEditor: IDomEditor) => {
    const { onDestroyed } = defaultConfig

    setEditor(null)
    if (onDestroyed) {
      onDestroyed(destroyedEditor)
    }
  }, [defaultConfig])

  useEffect(() => {
    if (editor == null) { return }

    // eslint-disable-next-line no-underscore-dangle
    editor.__react_on_change = (e: IDomEditor) => {
      const latestHtml = e.getHtml()
      const prevHtml = latestHtmlRef.current

      latestHtmlRef.current = latestHtml // 记录当前 html 值

      // 由 props 同步触发 setHtml 时，不向外触发 onChange，避免受控场景产生回环
      if (isSyncingFromPropsRef.current) { return }

      // 仅在内容发生变化时触发，对齐输入控件 onChange 语义（忽略选区/焦点变化）
      if (latestHtml === prevHtml) { return }

      // 组件属性 onChange
      if (onChange) { onChange(e) }

      // 编辑器 配置 onChange
      const { onChange: onChangeFromConfig } = defaultConfig

      if (onChangeFromConfig) { onChangeFromConfig(e) }
    }
    return () => {
      // eslint-disable-next-line no-underscore-dangle
      editor.__react_on_change = undefined
    }
  }, [editor, defaultConfig, onChange])

  // value 变化，重置 HTML
  useEffect(() => {
    if (editor == null) { return }

    if (value === latestHtmlRef.current) { return } // 如果和当前 html 值相等，则忽略

    // ------ 重新设置 HTML ------
    try {
      isSyncingFromPropsRef.current = true
      editor.setHtml(value)
      latestHtmlRef.current = editor.getHtml()
    } catch (error) {
      console.error(error)
    } finally {
      isSyncingFromPropsRef.current = false
    }
  }, [editor, value])

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

    latestHtmlRef.current = newEditor.getHtml()
    setEditor(newEditor)
  }, [
    editor,
    defaultConfig,
    defaultContent,
    defaultHtml,
    handleCreated,
    handleDestroyed,
    mode,
    value,
  ])

  return (
    <div
      style={{ ...style, position: style.position || 'relative' }}
      className={className}
      data-w-e-react-editor-container="true"
    >
      <div style={{ minHeight: '1px' }} ref={ref}></div>
      {loading && (
      <div
        data-w-e-loading-overlay="true"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255, 255, 255, 0.6)',
          zIndex: 10,
        }}
      >
        {loadingText}
      </div>
      )}
    </div>
  )
}

export default EditorComponent
