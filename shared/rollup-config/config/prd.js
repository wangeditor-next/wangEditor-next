/**
 * @description rollup prd config
 * @author cycleccc
 */

import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import autoprefixer from 'autoprefixer'
import cssnano from 'cssnano'
import discardDuplicates from 'postcss-discard-duplicates'
import mergeRules from 'postcss-merge-rules'
import cleanup from 'rollup-plugin-cleanup'
import postcss from 'rollup-plugin-postcss'

// eslint-disable-next-line import/extensions
import genCommonConf, { extensions } from './common.js'

/**
 * 生成 prd config
 * @param {string} format 'umd' 'esm'
 */
function genPrdConf(format) {
  const {
    input, output = {}, plugins = [], external,
  } = genCommonConf(format)

  const finalPlugins = [
    ...plugins,
    babel({
      rootMode: 'upward',
      babelHelpers: 'runtime',
      exclude: 'node_modules/**',
      include: 'src/**',
      extensions,
    }),
    postcss({
      plugins: [
        autoprefixer(),
        discardDuplicates(), // 去重完全相同的CSS规则
        mergeRules(), // 合并相似的CSS规则
        cssnano(), // 压缩 css
      ],
      extract: 'css/style.css',
    }),
    cleanup({
      comments: 'none',
      extensions: ['.ts', '.tsx'],
    }),
    terser(), // 压缩 js
  ]

  return {
    input,
    output: {
      sourcemap: true,
      ...output,
    },
    external,
    plugins: finalPlugins,
  }
}

export default genPrdConf
