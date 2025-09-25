/**
 * @description rollup dev config
 * @author cycleccc
 */

import autoprefixer from 'autoprefixer'
import discardDuplicates from 'postcss-discard-duplicates'
import mergeRules from 'postcss-merge-rules'
import postcss from 'rollup-plugin-postcss'

// eslint-disable-next-line import/extensions
import genCommonConf from './common.js'

/**
 * 生成 dev config
 * @param {string} format 'umd' 'esm'
 */
function genDevConf(format) {
  const {
    input, output = {}, plugins = [], external,
  } = genCommonConf(format)

  return {
    input,
    output,
    external,
    plugins: [
      ...plugins,

      postcss({
        plugins: [
          autoprefixer(),
          discardDuplicates(), // 去重完全相同的CSS规则
          mergeRules(), // 合并相似的CSS规则
        ],
        extract: 'css/style.css',
      }),
    ],
  }
}

export default genDevConf
