/**
 * @description toolbar react component
 * @author wangfupeng
 */

import * as wangEditor from '@wangeditor-next/editor'
import React, { useEffect, useRef } from 'react'

interface IProps {
  editor: wangEditor.IDomEditor | null
  defaultConfig?: Partial<wangEditor.IToolbarConfig>
  mode?: string
  style?: object
  className?: string
}

function ToolbarComponent(props: IProps) {
  const {
    editor, defaultConfig = {}, mode = 'default', style = {}, className,
  } = props
  const ref = useRef<HTMLDivElement>(null)
  const toolbarRef = useRef<wangEditor.Toolbar | null>(null)

  function destroyToolbar() {
    if (toolbarRef.current) {
      toolbarRef.current.destroy()
      toolbarRef.current = null
    }
  }

  useEffect(() => {
    if (ref.current == null || editor == null) {
      return destroyToolbar()
    }
    if (ref.current?.getAttribute('data-w-e-toolbar')) { return }

    toolbarRef.current = wangEditor.createToolbar({
      editor,
      selector: ref.current,
      config: defaultConfig,
      mode,
    })
  }, [editor, defaultConfig, mode])

  useEffect(() => {
    return destroyToolbar
  }, [])

  return <div style={style} ref={ref} className={className}></div>
}

export default ToolbarComponent
