import { createRollupConfig } from '@wangeditor-next-shared/rollup-config'

import pkg from './package.json' with { type: 'json' }

const configList = []

function createDualFormatConfig(input, umdFile, esmFile, name) {
  const umdConf = createRollupConfig({
    input,
    output: {
      file: umdFile,
      format: 'umd',
      name,
    },
  })

  configList.push(umdConf)

  const esmConf = createRollupConfig({
    input,
    output: {
      file: esmFile,
      format: 'esm',
      name,
    },
  })

  configList.push(esmConf)
}

createDualFormatConfig('src/index.ts', pkg.main, pkg.module, 'wangEditor')
createDualFormatConfig('src/core.ts', 'dist/core.js', 'dist/core.mjs', 'wangEditorCore')
createDualFormatConfig('src/upload.ts', 'dist/upload.js', 'dist/upload.mjs', 'wangEditorUpload')

export default configList
