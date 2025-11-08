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

  useEffect(() => {
    if (ref.current == null || editor == null) { return }
    if (ref.current?.getAttribute('data-w-e-toolbar')) { return }

    const toolbar = wangEditor.createToolbar({
      editor,
      selector: ref.current,
      config: defaultConfig,
      mode,
    })

    return () => {
      if (toolbar) {
        toolbar.destroy()
        ref.current?.removeAttribute('data-w-e-toolbar')
      }
    }
  }, [editor, defaultConfig, mode])

  return <div style={style} ref={ref} className={className}></div>
}

export default ToolbarComponent
