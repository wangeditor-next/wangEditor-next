import { createRollupConfig } from '@wangeditor-next-shared/rollup-config'

import pkg from './package.json' with { type: 'json' }

const name = 'WangEditorYjsForVue'
const globals = {
  '@wangeditor-next/editor': 'wangEditor',
  '@wangeditor-next/yjs': 'WangEditorYjsModule',
  slate: 'Slate',
  vue: 'Vue',
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
