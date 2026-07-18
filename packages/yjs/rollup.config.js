import { createRollupConfig } from '@wangeditor-next-shared/rollup-config'

import pkg from './package.json' with { type: 'json' }

const name = 'WangEditorYjsModule'
const globals = {
  slate: 'Slate',
  yjs: 'Y',
}

const configList = []

// esm
const esmConf = createRollupConfig({
  output: {
    file: pkg.module,
    format: 'esm',
    name,
  },
})

configList.push(esmConf)

// umd
const umdConf = createRollupConfig({
  output: {
    file: pkg.main,
    format: 'umd',
    globals,
    name,
  },
})

configList.push(umdConf)

export default configList
