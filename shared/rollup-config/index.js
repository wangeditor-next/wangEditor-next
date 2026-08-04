/**
 * @description 创建 rollup 配置
 * @author cycleccc
 */

import pkg from 'lodash'
import { visualizer } from 'rollup-plugin-visualizer'

// eslint-disable-next-line import/extensions
import genDevConf from './config/dev.js'
// eslint-disable-next-line import/extensions
import genPrdConf from './config/prd.js'

const { merge } = pkg

// 环境变量
const ENV = process.env.NODE_ENV || 'production'
const IS_SIZE_STATS = ENV.indexOf('size_stats') >= 0 // 分析包体积

export const IS_DEV = ENV.indexOf('development') >= 0
export const IS_PRD = ENV.indexOf('production') >= 0

// Keep UMD dependency names aligned with the globals exposed by each package's UMD entry.
// Package configs may still add or override third-party mappings through output.globals.
export const INTERNAL_UMD_GLOBALS = {
  '@wangeditor-next/basic-modules': 'WangEditorBasicModules',
  '@wangeditor-next/code-highlight': 'WangEditorCodeHighLight',
  '@wangeditor-next/core': 'WangEditorCore',
  '@wangeditor-next/core/upload': 'WangEditorCoreUpload',
  '@wangeditor-next/editor': 'wangEditor',
  '@wangeditor-next/editor/core': 'wangEditorCore',
  '@wangeditor-next/editor/upload': 'wangEditorUpload',
  '@wangeditor-next/editor-for-react': 'WangEditorForReact',
  '@wangeditor-next/editor-for-vue': 'WangEditorForVue',
  '@wangeditor-next/editor-for-vue2': 'WangEditorForVue',
  '@wangeditor-next/list-module': 'WangEditorListModule',
  '@wangeditor-next/plugin-attachment': 'WangEditorAttachmentPlugin',
  '@wangeditor-next/plugin-ctrl-enter': 'WangEditorCtrlEnterPlugin',
  '@wangeditor-next/plugin-float-image': 'WangEditorFloatImagePlugin',
  '@wangeditor-next/plugin-formula': 'WangEditorFormulaPlugin',
  '@wangeditor-next/plugin-link-card': 'WangEditorLinkCardPlugin',
  '@wangeditor-next/plugin-markdown': 'WangEditorMarkDownPlugin',
  '@wangeditor-next/plugin-mention': 'WangEditorMentionPlugin',
  '@wangeditor-next/table-module': 'WangEditorTableModule',
  '@wangeditor-next/upload-image-module': 'WangEditorUploadImageModule',
  '@wangeditor-next/video-module': 'WangEditorVideoModule',
  '@wangeditor-next/yjs': 'WangEditorYjsModule',
  '@wangeditor-next/yjs-for-react': 'WangEditorYjsForReact',
  '@wangeditor-next/yjs-for-vue': 'WangEditorYjsForVue',
}

/**
 * 生成单个 rollup 配置
 * @param {object} customConfig { input, output, plugins ... }
 */
export function createRollupConfig(customConfig = {}) {
  const { input, output = {}, plugins = [] } = customConfig
  const { format } = output
  const normalizedOutput =
    format === 'umd'
      ? {
          ...output,
          globals: {
            ...INTERNAL_UMD_GLOBALS,
            ...output.globals,
          },
        }
      : output

  let baseConfig

  if (IS_PRD) {
    baseConfig = genPrdConf(format)
  } else {
    baseConfig = genDevConf(format)
  }

  if (IS_SIZE_STATS) {
    // 分析包体积。运行之后可查看 package 下的 `stats.html`
    plugins.push(visualizer())
  }

  const config = {
    input: input || baseConfig.input,
    output: normalizedOutput,
    plugins,
  }

  const res = merge({}, baseConfig, config)

  return res
}
