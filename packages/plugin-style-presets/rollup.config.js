import { createRollupConfig } from '@wangeditor-next-shared/rollup-config'

import pkg from './package.json' with { type: 'json' }

const name = 'WangEditorStylePresetsPlugin'
const configList = []

const esmConf = createRollupConfig({
  output: {
    file: pkg.module,
    format: 'esm',
    name,
  },
})

configList.push(esmConf)

const umdConf = createRollupConfig({
  output: {
    file: pkg.main,
    format: 'umd',
    globals: {
      '@wangeditor-next/editor': 'wangEditor',
    },
    name,
  },
})

configList.push(umdConf)

export default configList
